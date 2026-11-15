
from pathlib import Path
from io import BytesIO
import uuid

import cv2
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import User, Analysis
from .schemas import UserCreate, UserOut, TokenOut, AnalysisOut
from .security import hash_password, verify_password, create_token, current_user
from .config import settings
from .vision import ROSTER, extract_clues, match_roster, detect_faces

app = FastAPI(title="CricketVision AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory=settings.upload_dir),
    name="uploads",
)

MAX_UPLOAD = 8 * 1024 * 1024


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if len(payload.password) < 8 or len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(400, "Password must contain 8 to 72 bytes")

    if db.query(User).filter_by(email=payload.email.lower()).first():
        raise HTTPException(409, "Email is already registered")

    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=TokenOut)
def login(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=payload.email.lower()).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    return {
        "access_token": create_token(user.id),
        "token_type": "bearer",
    }


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@app.post("/analyses", response_model=AnalysisOut)
async def create_analysis(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "Upload a JPG, PNG, or WEBP image")

    suffix = Path(file.filename or "image.jpg").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = ".jpg"

    data = await file.read(MAX_UPLOAD + 1)

    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Image must be 8 MB or smaller")

    if not data:
        raise HTTPException(400, "Uploaded image is empty")

    try:
        with Image.open(BytesIO(data)) as uploaded_image:
            width, height = uploaded_image.size

            if width * height > 20_000_000:
                raise HTTPException(
                    413,
                    "Image dimensions must be 20 megapixels or smaller",
                )

            uploaded_image.verify()

    except UnidentifiedImageError as exc:
        raise HTTPException(
            400,
            "The uploaded file is not a readable image",
        ) from exc

    except (OSError, Image.DecompressionBombError) as exc:
        raise HTTPException(
            400,
            "The uploaded image is invalid or could not be decoded",
        ) from exc

    image = cv2.imdecode(
        np.frombuffer(data, dtype=np.uint8),
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise HTTPException(400, "The uploaded file is not a readable image")

    height, width = image.shape[:2]

    if width * height > 20_000_000:
        raise HTTPException(
            413,
            "Image dimensions must be 20 megapixels or smaller",
        )

    filename = f"{uuid.uuid4().hex}{suffix}"
    target = Path(settings.upload_dir) / filename
    target.write_bytes(data)

    # Detect face locations only; do not identify people.
    annotated_image, face_count = detect_faces(image)

    annotated_filename = f"annotated_{uuid.uuid4().hex}.jpg"
    annotated_target = Path(settings.upload_dir) / annotated_filename

    if not cv2.imwrite(str(annotated_target), annotated_image):
        raise HTTPException(500, "Could not save the annotated image")

    # Extract visible text clues using OCR.
    number, name, explanation = extract_clues(str(target))
    matched, confidence = match_roster(number, name)

    if not number and not name:
        confidence = 0

    record = Analysis(
        owner_id=user.id,
        filename=filename,
        extracted_number=number,
        extracted_name=name,
        matched_player=matched,
        confidence=confidence,
        explanation=explanation,
        status="completed" if matched else "uncertain",
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # Face details are returned for this analysis without changing the database.
    result = AnalysisOut.model_validate(record).model_dump()
    result["face_count"] = face_count
    result["annotated_image_url"] = f"/uploads/{annotated_filename}"

    return result


@app.get("/players")
def list_players(user: User = Depends(current_user)):
    return ROSTER


@app.get("/analyses", response_model=list[AnalysisOut])
def list_analyses(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Analysis)
        .filter_by(owner_id=user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


@app.get("/analyses/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: int,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(Analysis)
        .filter_by(id=analysis_id, owner_id=user.id)
        .first()
    )

    if not record:
        raise HTTPException(404, "Analysis not found")

    return record

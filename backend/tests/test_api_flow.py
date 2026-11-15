from io import BytesIO

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from PIL import Image

from app.config import settings
from app.database import Base, get_db
from app.main import app


def test_registration_auth_roster_and_upload_validation(tmp_path, monkeypatch):
    database = tmp_path / "api-flow.db"
    engine = create_engine(
        f"sqlite:///{database}",
        connect_args={"check_same_thread": False},
    )
    test_sessions = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    monkeypatch.setattr(settings, "upload_dir", str(upload_dir))

    def override_get_db():
        db = test_sessions()
        try:
            yield db
        finally:
            db.close()

    monkeypatch.setitem(app.dependency_overrides, get_db, override_get_db)
    with TestClient(app) as client:
        assert client.get("/auth/me").status_code == 401
        preflight = client.options(
            "/auth/register",
            headers={
                "Origin": "http://127.0.0.1:5174",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert preflight.status_code == 200
        assert preflight.headers["access-control-allow-origin"] == "http://127.0.0.1:5174"

        registered = client.post(
            "/auth/register",
            json={"email": "analyst@example.com", "password": "secure-pass-123"},
        )
        assert registered.status_code == 200
        assert registered.json()["email"] == "analyst@example.com"

        login = client.post(
            "/auth/login",
            json={"email": "analyst@example.com", "password": "secure-pass-123"},
        )
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        assert client.get("/auth/me", headers=headers).json()["email"] == "analyst@example.com"
        assert len(client.get("/players", headers=headers).json()) == 5
        assert client.get("/analyses", headers=headers).json() == []
        image_bytes = BytesIO()
        Image.new("RGB", (64, 64), "white").save(image_bytes, format="PNG")
        analysis = client.post(
            "/analyses",
            headers=headers,
            files={"file": ("blank.png", image_bytes.getvalue(), "image/png")},
        )
        assert analysis.status_code == 200
        assert analysis.json()["status"] == "uncertain"
        assert analysis.json()["matched_player"] is None
        assert analysis.json()["confidence"] == 0
        assert len(client.get("/analyses", headers=headers).json()) == 1

        invalid_image = client.post(
            "/analyses",
            headers=headers,
            files={"file": ("not-an-image.png", b"not an image", "image/png")},
        )
        assert invalid_image.status_code == 400

    app.dependency_overrides.pop(get_db, None)
    engine.dispose()

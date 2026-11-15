
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str

    model_config = ConfigDict(from_attributes=True)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AnalysisOut(BaseModel):
    id: int
    filename: str
    status: str
    extracted_number: str | None
    extracted_name: str | None
    matched_player: str | None
    confidence: int
    explanation: str
    created_at: datetime
    face_count: int | None = None
    annotated_image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Pydantic schema


class URLCreate(BaseModel):
    url: str


class URLUpdate(BaseModel):
    url: str


class URLInfo(BaseModel):
    id: int
    url: str
    short_code: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

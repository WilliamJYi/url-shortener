from sqlalchemy.orm import Session
from . import models, schemas

def create_short_url(db: Session, url_data: schemas.URLCreate, short_code: str) -> models.URL:
    new_url = models.URL(
        url=url_data.url,
        short_code=short_code
    )
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    return new_url

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import models, schemas
from ..database import get_db
import random
import string


def generate_short_code(length: int = 6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


router = APIRouter()


@router.post("/shorten")
async def create_short_url(url: schemas.URLCreate, db: AsyncSession = Depends(get_db)):
    short_code = generate_short_code()
    new_url = models.URL(url=url.url, short_code=short_code)
    db.add(new_url)
    await db.commit()
    await db.refresh(new_url)
    return new_url


@router.get("/shorten/{short_code}", response_model=schemas.URLInfo, status_code=200)
async def retrieve_short_url(short_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.URL).where(models.URL.short_code == short_code)
    )
    url = result.scalar_one_or_none()
    if not url:
        raise HTTPException(status_code=404, detail="Item not found")
    return RedirectResponse(url=url.url)


@router.put("/shorten/{short_code}", response_model=schemas.URLInfo, status_code=200)
async def update_short_url(short_code: str, update_data: schemas.URLUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.URL).where(models.URL.short_code == short_code)
    )
    url_object = result.scalar_one_or_none()

    if not url_object:
        raise HTTPException(status_code=404, detail="Short URL not found")

    url_object.url = update_data.url
    await db.commit()
    await db.refresh(url_object)
    return url_object


@router.delete("/shorten/{short_code}", status_code=204)
async def delete_short_url(short_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.URL).where(models.URL.short_code == short_code))
    url_object = result.scalar_one_or_none()

    if not url_object:
        raise HTTPException(status_code=404, detail="Short URL not found")

    await db.delete(url_object)
    await db.commit()
    return


@router.get("/all")
async def get_all_urls(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.URL))
    urls = result.scalars().all()
    return urls

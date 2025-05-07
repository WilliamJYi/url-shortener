from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import shorten
from . import startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await startup.create_tables()
    yield
    # Shutdown logic (if needed)

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(shorten.router)


@app.get("/")
def root():
    return {"message": "Hello World"}

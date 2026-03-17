from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api import persona, feedback
from app.api import persona_pool, simulation as simulation_api, project as project_api
from app.api import auth as auth_api
from app.api import scrape as scrape_api

# Import models so SQLAlchemy registers them before create_all
import app.models.persona  # noqa: F401
import app.models.simulation  # noqa: F401
import app.models.project  # noqa: F401
import app.models.chat  # noqa: F401
import app.models.user  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # DB接続プールをウォームアップ（Railway cold start対策）
    try:
        await init_db()
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
    except Exception:
        pass
    yield


app = FastAPI(title="PersonaAI API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(persona.router)
app.include_router(feedback.router)
app.include_router(persona_pool.router)
app.include_router(simulation_api.router)
app.include_router(project_api.router)
app.include_router(auth_api.router)
app.include_router(scrape_api.router)


@app.get("/health")
def health():
    return {"status": "ok"}

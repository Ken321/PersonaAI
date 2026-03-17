from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    allowed_origins: str = "http://localhost:5173"

    database_url: str = "postgresql+asyncpg://personaai:personaai@localhost:5432/personaai"
    database_url_sync: str = "postgresql+psycopg2://personaai:personaai@localhost:5432/personaai"

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_days: int = 30

    persona_generation_model: str = "gpt-5-mini"
    feedback_generation_model: str = "gpt-5-mini"
    insight_generation_model: str = "gpt-5-mini"
    default_persona_count: int = 20

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()

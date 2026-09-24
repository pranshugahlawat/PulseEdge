from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "PulseEdge Clinical Engine"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
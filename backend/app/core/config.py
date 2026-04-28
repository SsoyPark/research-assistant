# backend/app/core/config.py
from pydantic_settings import BaseSettings  # 환경변수

class Settings(BaseSettings):
    gemini_api_key: str      
    tavily_api_key: str      

    class Config:
        env_file = ".env"    

settings = Settings()        # 앱 전체에서 import해서 쓸 설정 인스턴스
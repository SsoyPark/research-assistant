# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.research import router 
from app.api.draft import router as draft_router

app = FastAPI(title="Research Assistant API")      # FastAPI 앱 인스턴스 생성

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React 개발 서버 주소만 허용
    allow_credentials=True,                  # 쿠키/인증 정보 허용
    allow_methods=["*"],                     # GET, POST 등 모든 HTTP 메서드 허용
    allow_headers=["*"],                     # 모든 헤더 허용
)

app.include_router(router)
app.include_router(draft_router) 

@app.get("/")                # GET / 요청이 오면 아래 함수 실행
def health_check():
    return {"status": "ok"} # 서버 정상 작동 확인용 응답
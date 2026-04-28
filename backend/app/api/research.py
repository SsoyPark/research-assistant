# backend/app/api/research.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form  
# UploadFile: 파일 업로드 처리
# Form: multipart/form-data에서 텍스트 필드 받기
from typing import Optional
from app.agents.orchestrator import run_research
from app.agents.experience import experience_agent, extract_text_by_type
import json

router = APIRouter(prefix="/api", tags=["research"])

@router.post("/research")
async def create_research(
    company: str = Form(...),                        # 필수 텍스트 필드
    role: str = Form(...),                           # 필수 텍스트 필드
    depth: str = Form("standard"),                   # 선택 텍스트 필드
    jd_url: Optional[str] = Form(None),              # 선택 텍스트 필드
    experience_text: Optional[str] = Form(None),     # 직접 입력한 경험 텍스트
    file: Optional[UploadFile] = File(None),         # 첨부 파일 (선택)
):
    try:
        # 1단계: 파일 텍스트 추출
        file_text = None
        if file and file.filename:                   # 파일이 첨부된 경우
            content = await file.read()              # 파일 바이트 읽기
            file_text = extract_text_by_type(
                content=content,
                content_type=file.content_type or "",
                filename=file.filename,
            )

        # 2단계: 경험 에이전트로 키워드 추출
        experience_result = await experience_agent(
            raw_text=experience_text,                # 직접 입력 텍스트
            file_text=file_text,                     # 파일 추출 텍스트
        )
        experience_tags = experience_result.get("keywords", [])  # 추출된 키워드

        # 3단계: 기존 오케스트레이터 실행
        result = await run_research(
            company=company,
            role=role,
            experience_tags=experience_tags,         # 추출된 키워드 전달
            jd_url=jd_url or None,
            depth=depth,
        )

        # 경험 분석 결과도 함께 반환
        result["experience_analysis"] = experience_result

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
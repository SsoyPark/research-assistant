# backend/app/api/research.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.agents.orchestrator import run_research
from app.agents.experience import experience_agent, extract_text_by_type
import json

router = APIRouter(prefix="/api", tags=["research"])

@router.post("/research")
async def create_research(
    company: str = Form(...),
    role: str = Form(...),
    depth: str = Form("standard"),
    jd_url: Optional[str] = Form(None),
    experience_text: Optional[str] = Form(None),
    jasoseo_items: Optional[str] = Form(None),
    files: list[UploadFile] = File(default=[]),       # 경험 파일 여러 개
    jd_file: Optional[UploadFile] = File(None),       # 직무기술서 파일
):
    try:
        # 자소서 항목 파싱
        parsed_jasoseo = json.loads(jasoseo_items) if jasoseo_items else []

        # 경험 파일 여러 개 텍스트 추출 후 합치기
        file_texts = []
        for f in files:
            if f and f.filename:
                content = await f.read()
                file_texts.append(extract_text_by_type(
                    content=content,
                    content_type=f.content_type or "",
                    filename=f.filename,
                ))
        file_text = "\n\n".join(file_texts) if file_texts else None

        # 직무기술서 텍스트 추출
        jd_file_text = None
        if jd_file and jd_file.filename:
            content = await jd_file.read()
            jd_file_text = extract_text_by_type(
                content=content,
                content_type=jd_file.content_type or "",
                filename=jd_file.filename,
            )

        # 경험 에이전트
        experience_result = await experience_agent(
            raw_text=experience_text,
            file_text=file_text,
        )
        experience_tags = experience_result.get("keywords", [])

        # 오케스트레이터 실행
        result = await run_research(
            company=company,
            role=role,
            experience_tags=experience_tags,
            jd_url=jd_url or None,
            jd_file_text=jd_file_text,
            depth=depth,
            jasoseo_items=parsed_jasoseo,
        )

        result["experience_analysis"] = experience_result
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# backend/app/api/research.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse        # SSE 스트리밍 응답
from typing import Optional
from app.agents.orchestrator import run_research
from app.agents.experience import experience_agent, extract_text_by_type
import json, asyncio

router = APIRouter(prefix="/api", tags=["research"])

async def research_stream(
    company: str,
    role: str,
    depth: str,
    jd_url: Optional[str],
    jd_file_text: Optional[str],
    experience_text: Optional[str],
    file_text: Optional[str],
    jasoseo_items: list,
):
    """SSE 스트리밍 제너레이터 — 에이전트 단계별로 이벤트 전송"""

    def send(event: str, data: dict) -> str:
        """SSE 형식으로 직렬화"""
        return f"data: {json.dumps({'event': event, 'data': data}, ensure_ascii=False)}\n\n"

    try:
        # 1단계: 경험 분석
        yield send("status", {"message": "내 경험 분석 중...", "step": 1, "total": 4})
        experience_result = await experience_agent(
            raw_text=experience_text,
            file_text=file_text,
        )
        experience_tags = experience_result.get("keywords", [])
        yield send("experience_done", experience_result)   # 경험 분석 완료

        # 2단계: 기업 + JD 병렬 분석
        yield send("status", {"message": "기업 · JD 분석 중...", "step": 2, "total": 4})
        from app.agents.company import company_agent
        from app.agents.jd import jd_agent
        company_result, jd_result = await asyncio.gather(
            company_agent(company, role),
            jd_agent(company, role, jd_url, jd_file_text),
        )
        yield send("company_done", company_result)         # 기업 분석 완료
        yield send("jd_done", jd_result)                   # JD 분석 완료

        # 3단계: 자소서 전략 생성
        yield send("status", {"message": "자소서 전략 생성 중...", "step": 3, "total": 4})
        from app.agents.strategy import strategy_agent
        strategy_result = await strategy_agent(
            company=company,
            role=role,
            experience_tags=experience_tags,
            company_result=company_result,
            jd_result=jd_result,
            jasoseo_items=jasoseo_items,
        )
        yield send("strategy_done", strategy_result)       # 전략 생성 완료

        # 4단계: 최종 결과 전송
        yield send("status", {"message": "완료!", "step": 4, "total": 4})
        final_result = {
            "company": company,
            "role": role,
            "depth": depth,
            "experience_analysis": experience_result,
            "company_analysis": company_result,
            "jd_analysis": jd_result,
            "strategy": strategy_result,
        }
        yield send("done", final_result)                   # 전체 결과 전송

    except Exception as e:
        yield send("error", {"message": str(e)})           # 에러 전송


@router.post("/research")
async def create_research(
    company: str = Form(...),
    role: str = Form(...),
    depth: str = Form("standard"),
    jd_url: Optional[str] = Form(None),
    experience_text: Optional[str] = Form(None),
    jasoseo_items: Optional[str] = Form(None),
    files: list[UploadFile] = File(default=[]),
    jd_file: Optional[UploadFile] = File(None),
):
    # 자소서 항목 파싱
    parsed_jasoseo = json.loads(jasoseo_items) if jasoseo_items else []

    # 경험 파일 텍스트 추출
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

    # SSE 스트리밍 응답 반환
    return StreamingResponse(
        research_stream(
            company=company,
            role=role,
            depth=depth,
            jd_url=jd_url or None,
            jd_file_text=jd_file_text,
            experience_text=experience_text,
            file_text=file_text,
            jasoseo_items=parsed_jasoseo,
        ),
        media_type="text/event-stream",                    # SSE 미디어 타입
        headers={
            "Cache-Control": "no-cache",                   # 캐시 방지
            "X-Accel-Buffering": "no",                     # Nginx 버퍼링 방지
        }
    )
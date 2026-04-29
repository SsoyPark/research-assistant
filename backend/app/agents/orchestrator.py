# backend/app/agents/orchestrator.py
import asyncio
from app.agents.company import company_agent
from app.agents.jd import jd_agent
from app.agents.strategy import strategy_agent

async def run_research(
    company: str,
    role: str,
    experience_tags: list[str],
    jd_url: str = None,
    jd_file_text: str = None,        # 직무기술서 텍스트 추가
    depth: str = "standard",
    jasoseo_items: list[str] = [],
) -> dict:

    # 기업/JD 병렬 실행
    company_result, jd_result = await asyncio.gather(
        company_agent(company, role),
        jd_agent(company, role, jd_url, jd_file_text),  # 직무기술서 전달
    )

    # 전략 생성
    strategy_result = await strategy_agent(
        company=company,
        role=role,
        experience_tags=experience_tags,
        company_result=company_result,
        jd_result=jd_result,
        jasoseo_items=jasoseo_items,
    )

    return {
        "company": company,
        "role": role,
        "depth": depth,
        "company_analysis": company_result,
        "jd_analysis": jd_result,
        "strategy": strategy_result,
    }
# backend/app/agents/orchestrator.py
import asyncio                                    # 비동기 처리 라이브러리
from app.agents.company import company_agent      # 기업 분석 에이전트
from app.agents.jd import jd_agent               # JD 분석 에이전트
from app.agents.strategy import strategy_agent   # 자소서 전략 에이전트

async def run_research(
    company: str,                                 # 지원 기업
    role: str,                                    # 지원 직무
    experience_tags: list[str],                   # 내 핵심 경험 키워드
    jd_url: str = None,                           # 채용공고 URL (선택)
    depth: str = "standard",                      # 리서치 깊이
) -> dict:
    """오케스트레이터 — 에이전트 실행 순서 조율 및 결과 통합"""

    # 1단계: company 에이전트와 jd 에이전트를 동시에 실행 (속도 최적화)
    # asyncio.gather = 두 작업을 병렬로 실행, 둘 다 끝날 때까지 대기
    company_result, jd_result = await asyncio.gather(
        company_agent(company, role),
        jd_agent(company, role, jd_url),
    )

    # 2단계: 앞선 두 결과를 받아서 strategy 에이전트 실행
    # company/jd 결과에 의존하므로 반드시 순차 실행
    strategy_result = await strategy_agent(
        company=company,
        role=role,
        experience_tags=experience_tags,
        company_result=company_result,
        jd_result=jd_result,
    )

    # 3단계: 세 에이전트 결과 통합해서 최종 리포트 반환
    return {
        "company": company,
        "role": role,
        "depth": depth,
        "company_analysis": company_result,        # 기업 분석 결과
        "jd_analysis": jd_result,                  # JD 분석 결과
        "strategy": strategy_result,               # 자소서 전략 결과
    }
# backend/app/agents/company.py
from app.core.gemini import call_gemini
from app.core.config import settings
from tavily import TavilyClient
import re

client = TavilyClient(api_key=settings.tavily_api_key)


async def company_agent(company: str, role: str) -> dict:
    """기업 분석 에이전트 — 검색 후 Gemini로 요약"""

    queries = [
        f"{company} 사업 도메인 주요 서비스",
        f"{company} AI 전략 기술 투자 2024 2025",
        f"{company} {role} 채용 요구역량",
    ]

    # 검색 결과 수집
    raw_results = []
    for query in queries:
        response = client.search(
            query=query,
            max_results=3,
            search_depth="basic",
        )
        contents = " ".join([r["content"] for r in response["results"]])
        raw_results.append({"query": query, "content": contents})

    # 검색 결과 합쳐서 Gemini로 요약
    combined = "\n\n".join([f"[{r['query']}]\n{r['content']}" for r in raw_results])

    prompt = f"""
아래는 {company}에 대한 검색 결과야.
{role} 직무 지원자 관점에서 필요한 정보만 골라서 요약해줘.

{combined[:6000]}

다음 항목을 JSON 형식으로 작성해줘:
1. business_domain: 주요 사업 도메인 및 서비스 (2~3문장)
2. ai_strategy: AI 전략 및 기술 투자 현황 (2~3문장)
3. key_info: {role} 지원자가 알아야 할 핵심 정보 리스트 (3~5개)

JSON만 반환하고 다른 말은 하지 마.
"""

    text = call_gemini(prompt)

    import json
    match = re.search(r'\{.*\}', text, re.DOTALL)
    parsed = json.loads(match.group()) if match else {"raw": text}

    return {
        "agent": "company",
        "company": company,
        "summary": parsed                            # 요약된 결과
    }
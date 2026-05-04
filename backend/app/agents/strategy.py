# backend/app/agents/strategy.py
from app.core.gemini import call_gemini 
from app.core.config import settings              # 환경변수



async def strategy_agent(
    company: str,
    role: str,
    experience_tags: list[str],
    company_result: dict,
    jd_result: dict,
    jasoseo_items: list[str] = [],               # 추가
) -> dict:

    jd_analysis = jd_result.get("analysis", {})
    company_summary = company_result.get("summary", {})
    company_info = f"""
사업 도메인: {company_summary.get('business_domain', '')}
AI 전략: {company_summary.get('ai_strategy', '')}
핵심 정보: {', '.join(company_summary.get('key_info', []))}
"""

    # 자소서 항목 있으면 항목별 전략 추가 요청
    jasoseo_prompt = ""
    if jasoseo_items:
        items_text = "\n".join([f"{i+1}. {item}" for i, item in enumerate(jasoseo_items)])
        jasoseo_prompt = f"""
## 자소서 항목
{items_text}

6. jasoseo_strategies: 각 자소서 항목별 맞춤 전략 (딕셔너리)
   - 항목 번호를 키로, 아래 내용을 값으로:
     - intent: 이 항목에서 기업이 보려는 것
     - strategy: 어떤 경험을 어떻게 연결할지
     - keywords: 이 항목에서 강조할 키워드 리스트
     - caution: 주의할 점
"""

    prompt = f"""
너는 취업 컨설턴트야. 아래 정보를 바탕으로 자소서 전략을 짜줘.

## 지원 정보
- 기업: {company}
- 직무: {role}

## 기업 분석 요약
{company_info[:2000]}

## JD 분석 결과
- 필수 기술: {jd_analysis.get("required_skills", [])}
- 우대 기술: {jd_analysis.get("preferred_skills", [])}
- 핵심 역량: {jd_analysis.get("key_competencies", [])}
- 컬처핏: {jd_analysis.get("culture_fit", [])}

## 내 핵심 경험 키워드
{", ".join(experience_tags)}

다음 항목을 JSON 형식으로 작성해줘:
1. matched_keywords: 내 경험과 JD가 겹치는 키워드 리스트
2. gap_keywords: JD에는 있는데 내 경험에 없는 키워드 리스트
3. appeal_points: 자소서에서 강조할 어필 포인트 리스트 (3~5개)
4. recommended_experiences: 각 어필 포인트별로 어떤 경험을 연결할지 설명
5. interview_questions: 예상 면접 질문 리스트 (3개)
{jasoseo_prompt}

JSON만 반환하고 다른 말은 하지 마.
"""

    from app.core.gemini import call_gemini, parse_json_response

    text = call_gemini(prompt)
    parsed = parse_json_response(text)

    return {
        "agent": "strategy",
        "company": company,
        "role": role,
        "strategy": parsed,
        "jasoseo_items": jasoseo_items,          # 항목도 함께 반환
    }
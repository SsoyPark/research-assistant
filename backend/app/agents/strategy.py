# backend/app/agents/strategy.py
from google import genai                          # Gemini API
from app.core.config import settings              # 환경변수
import json, re                                   # JSON 파싱, 정규식

# Gemini 클라이언트 초기화
client = genai.Client(api_key=settings.gemini_api_key)

async def strategy_agent(
    company: str,
    role: str,
    experience_tags: list[str],      # 사용자가 입력한 핵심 경험 키워드
    company_result: dict,            # company 에이전트 결과
    jd_result: dict,                 # jd 에이전트 결과
) -> dict:
    """자소서 전략 에이전트 — 내 경험 ↔ JD 갭 분석 + 어필 키워드 추천"""

    # 앞선 에이전트 결과에서 핵심 내용만 추출해서 프롬프트에 넣기
    jd_analysis = jd_result.get("analysis", {})
    company_summary = company_result.get("summary", {})
    company_info = f"""
    사업 도메인: {company_summary.get('business_domain', '')}
    AI 전략: {company_summary.get('ai_strategy', '')}
    핵심 정보: {', '.join(company_summary.get('key_info', []))}
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
4. recommended_experiences: 각 어필 포인트별로 어떤 경험을 연결할지 설명 (딕셔너리)
5. interview_questions: 예상 면접 질문 리스트 (3개)

JSON만 반환하고 다른 말은 하지 마.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text = response.text
    match = re.search(r'\{.*\}', text, re.DOTALL)        # JSON 블록 추출
    parsed = json.loads(match.group()) if match else {"raw": text}

    return {
        "agent": "strategy",
        "company": company,
        "role": role,
        "strategy": parsed                               # 전략 분석 결과
    }
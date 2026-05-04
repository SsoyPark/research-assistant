# backend/app/agents/draft.py
from app.core.gemini import call_gemini, parse_json_response

async def feedback_agent(
    company: str,
    role: str,
    jasoseo_item: str,               # 자소서 항목
    user_draft: str,                 # 사용자가 작성한 초안
    experience_tags: list[str],      # 내 경험 키워드
    appeal_points: list[str],        # 어필 포인트
    jasoseo_strategy: dict,          # 해당 항목 전략
    char_limit: int = 700,           # 글자수 제한
) -> dict:
    """자소서 첨삭 에이전트 — 초안 피드백 + 수정본 생성"""

    prompt = f"""
너는 자소서 첨삭 전문가야. 아래 정보를 바탕으로 자소서 초안을 첨삭해줘.

## 지원 정보
- 기업: {company}
- 직무: {role}

## 자소서 항목
{jasoseo_item}

## 글자수 제한
{char_limit}자 이내

## 사용자가 작성한 초안
{user_draft}

## 내 핵심 경험 키워드
{", ".join(experience_tags)}

## 이 항목의 전략
- 기업이 보려는 것: {jasoseo_strategy.get('intent', '')}
- 전략: {jasoseo_strategy.get('strategy', '')}
- 강조 키워드: {", ".join(jasoseo_strategy.get('keywords', []))}
- 주의할 점: {jasoseo_strategy.get('caution', '')}

## 어필 포인트
{chr(10).join([f"- {p}" for p in appeal_points[:3]])}

## 첨삭 기준
1. 두괄식 구조인지 (핵심 메시지가 앞에 오는지)
2. 구체적인 수치/성과가 포함됐는지
3. 항목의 의도에 맞게 작성됐는지
4. 강조해야 할 키워드가 자연스럽게 녹아있는지
5. {char_limit}자 제한을 지켰는지
6. 지원자 본인의 목소리가 살아있는지

다음 항목을 JSON 형식으로 반환해줘:
1. strengths: 잘된 점 리스트 (2~3개)
2. improvements: 보완할 점 리스트 (2~3개) — 구체적으로
3. keyword_usage: 강조 키워드 활용도 평가 (잘 쓴 것 / 빠진 것)
4. revised_draft: 수정본 ({char_limit}자 이내, 사용자 문체 최대한 유지)
5. change_summary: 주요 변경 포인트 리스트 (뭘 왜 바꿨는지)
6. char_count: 수정본 실제 글자수

JSON만 반환하고 다른 말은 하지 마.
"""

    result = parse_json_response(call_gemini(prompt))

    return {
        "agent": "feedback",
        "jasoseo_item": jasoseo_item,
        "user_draft": user_draft,
        "strengths": result.get("strengths", []),
        "improvements": result.get("improvements", []),
        "keyword_usage": result.get("keyword_usage", {}),
        "revised_draft": result.get("revised_draft", ""),
        "change_summary": result.get("change_summary", []),
        "char_count": result.get("char_count", 0),
    }
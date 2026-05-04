# backend/app/core/gemini.py
import time
import json
import re
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

def call_gemini(prompt: str, retries: int = 3) -> str:
    """Gemini 호출 + 자동 재시도"""
    for i in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str \
               or "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait = (i + 1) * 15
                print(f"Gemini 에러 — {wait}초 후 재시도 ({i+1}/{retries})")
                time.sleep(wait)
            else:
                raise e
    raise Exception("Gemini 재시도 횟수 초과 — 잠시 후 다시 시도해주세요.")

def parse_json_response(text: str, retries: int = 2) -> dict:
    """Gemini 응답에서 JSON 추출 + 실패시 재시도"""

    def extract(t: str) -> dict | None:
        # 1. ```json ... ``` 블록 먼저 시도
        code_match = re.search(r'```json\s*(.*?)\s*```', t, re.DOTALL)
        if code_match:
            try:
                return json.loads(code_match.group(1))
            except:
                pass

        # 2. { ... } 블록 시도
        json_match = re.search(r'\{.*\}', t, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass

        return None

    # 첫 번째 시도
    result = extract(text)
    if result:
        return result

    # 실패시 Gemini에게 JSON만 다시 요청
    for i in range(retries):
        print(f"JSON 파싱 실패 — JSON 재요청 ({i+1}/{retries})")
        retry_prompt = f"""
아래 텍스트에서 JSON 객체만 추출해서 반환해줘.
다른 설명 없이 JSON만 반환해야 해.

{text}
"""
        retry_text = call_gemini(retry_prompt)
        result = extract(retry_text)
        if result:
            return result

    # 최종 실패시 빈 딕셔너리 반환
    print(f"JSON 파싱 최종 실패: {text[:200]}")
    return {}
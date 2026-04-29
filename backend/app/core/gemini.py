# backend/app/core/gemini.py
import time
from google import genai
from app.core.config import settings

# 공통 Gemini 클라이언트 (모든 에이전트가 이걸 import해서 씀)
client = genai.Client(api_key=settings.gemini_api_key)

def call_gemini(prompt: str, retries: int = 3) -> str:
    """Gemini 호출 + 503 에러시 자동 재시도"""
    for i in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )
            return response.text
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str or "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait = (i + 1) * 15              # 15초, 30초, 45초 순서로 대기
                print(f"Gemini 503 에러 — {wait}초 후 재시도 ({i+1}/{retries})")
                time.sleep(wait)
            else:
                raise e                          # 503 아닌 에러는 바로 raise
    raise Exception("Gemini 재시도 횟수 초과 — 잠시 후 다시 시도해주세요.")
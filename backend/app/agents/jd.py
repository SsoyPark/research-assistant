# backend/app/agents/jd.py
import httpx                                      # HTTP 요청 라이브러리
from bs4 import BeautifulSoup                     # HTML 파싱
from google import genai                           # Gemini API
from app.core.config import settings              # 환경변수
import json, re                                   # JSON 파싱, 정규식
import io                                         # 바이트 스트림 처리

# Gemini 클라이언트 초기화
client = genai.Client(api_key=settings.gemini_api_key)

def extract_text_from_pdf(content: bytes) -> str:
    """PDF 바이트에서 텍스트 추출"""
    import pypdf                                          # PDF 파싱 라이브러리
    reader = pypdf.PdfReader(io.BytesIO(content))        # 바이트를 PDF로 읽기
    return "\n".join(page.extract_text() for page in reader.pages)  # 전 페이지 텍스트 합치기

def extract_text_from_docx(content: bytes) -> str:
    """Word 파일 바이트에서 텍스트 추출"""
    import docx                                          # Word 파싱 라이브러리
    doc = docx.Document(io.BytesIO(content))             # 바이트를 Word로 읽기
    return "\n".join(para.text for para in doc.paragraphs)  # 전 단락 텍스트 합치기

async def fetch_jd_text(url: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
    
    # URL 끝 대신 실제 응답 타입으로 판단
    content_type = response.headers.get("content-type", "")

    if "pdf" in content_type:
        return extract_text_from_pdf(response.content)
    elif "word" in content_type or "officedocument" in content_type:
        return extract_text_from_docx(response.content)
    else:
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text(separator="\n", strip=True)
    
async def jd_agent(company: str, role: str, jd_url: str = None) -> dict:
    """JD 분석 에이전트 — 핵심 역량, 기술스택, 우대사항 추출"""

    if jd_url:
        jd_text = await fetch_jd_text(jd_url)
        source = f"""
아래는 {company} 채용 관련 문서야.
이 문서에 여러 직무가 포함되어 있을 수 있어.
반드시 '{role}' 직무에 해당하는 내용만 찾아서 분석해줘.
'{role}' 직무 내용이 없으면 가장 유사한 직무를 찾아줘.

문서 내용:
{jd_text[:5000]}
"""                                                      # 5000자로 제한 (토큰 절약)
    else:
        source = f"{company}의 {role} 직무 채용공고를 기반으로 일반적인 요구사항을 분석해줘."

    prompt = f"""
{source}

다음 항목을 JSON 형식으로 추출해줘:
1. required_skills: 필수 기술스택 리스트
2. preferred_skills: 우대 기술스택 리스트
3. key_competencies: 핵심 역량 리스트 (기술 외 역량)
4. culture_fit: 컬처핏 키워드 리스트
5. summary: 이 직무 한 줄 요약

JSON만 반환하고 다른 말은 하지 마.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text = response.text
    match = re.search(r'\{.*\}', text, re.DOTALL)        # JSON 블록 추출
    parsed = json.loads(match.group()) if match else {"raw": text}  # 파싱 실패시 원문 반환

    return {
        "agent": "jd",
        "company": company,
        "role": role,
        "analysis": parsed
    }
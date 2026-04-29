# backend/app/agents/jd.py
import httpx
from bs4 import BeautifulSoup
from app.core.gemini import call_gemini
import json, re, io

def extract_text_from_pdf(content: bytes) -> str:
    """PDF에서 텍스트 추출"""
    import pypdf
    reader = pypdf.PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() for page in reader.pages)

def extract_text_from_docx(content: bytes) -> str:
    """Word 파일에서 텍스트 추출"""
    import docx
    doc = docx.Document(io.BytesIO(content))
    return "\n".join(para.text for para in doc.paragraphs)

async def fetch_jd_text(url: str) -> str:
    """URL 형식에 따라 자동으로 파싱 방식 분기"""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)

    content_type = response.headers.get("content-type", "")

    if "pdf" in content_type:
        return extract_text_from_pdf(response.content)
    elif "word" in content_type or "officedocument" in content_type:
        return extract_text_from_docx(response.content)
    else:
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text(separator="\n", strip=True)

async def jd_agent(
    company: str,
    role: str,
    jd_url: str = None,
    jd_file_text: str = None,        # 직무기술서 텍스트 추가
) -> dict:
    """JD 분석 에이전트"""

    if jd_file_text:
        # 직무기술서 파일이 있으면 우선 사용
        source = f"""
아래는 {company} {role} 직무기술서야.
반드시 '{role}' 직무에 해당하는 내용만 찾아서 분석해줘.
직무가 여러 개 있으면 '{role}'과 가장 유사한 것을 찾아줘.

{jd_file_text[:5000]}
"""
    elif jd_url:
        # URL이 있으면 스크래핑
        jd_text = await fetch_jd_text(jd_url)
        source = f"""
아래는 {company} 채용 관련 문서야.
반드시 '{role}' 직무에 해당하는 내용만 찾아서 분석해줘.

{jd_text[:5000]}
"""
    else:
        # 둘 다 없으면 일반적인 분석
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

    text = call_gemini(prompt)
    match = re.search(r'\{.*\}', text, re.DOTALL)
    parsed = json.loads(match.group()) if match else {"raw": text}

    return {
        "agent": "jd",
        "company": company,
        "role": role,
        "analysis": parsed
    }
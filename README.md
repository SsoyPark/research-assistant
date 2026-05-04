**# 취준 리서치 어시스턴트 🔍

> AI 에이전트 4개가 협업해서 기업 분석 + JD 분석 + 자소서 전략을 자동으로 생성해주는 취준 도구

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini](https://img.shields.io/badge/Gemini_API-2.0_flash-orange)

---

## 프로젝트 소개

취업 준비에서 겪는 반복작업(지원할 기업 탐색 → 채용공고 분석 → 내 경험과 JD 비교 → 자소서 키워드 추출)을 자동화하기 위해 만들었다.

기업명과 직무를 입력하면 멀티에이전트 파이프라인이 협업해서 기업 분석부터 자소서 전략까지 자동으로 뽑아준다.

---

## 주요 기능

- **멀티에이전트 파이프라인** — 경험 분석 → 기업/JD 분석(병렬) → 전략 생성 순차 실행
- **자소서 항목별 맞춤 전략** — 항목 입력 시 기업 의도 파악 + 경험 연결 전략 생성
- **파일 업로드** — 포트폴리오/발표자료 PDF·PPTX·DOCX 다중 업로드, 직무기술서 별도 첨부
- **SSE 스트리밍** — 에이전트 단계별 실시간 진행 상태 표시
- **히스토리 저장** — 분석 결과 자동 저장 + 재조회
- **PDF 다운로드** — 결과 화면 PDF 저장

---

## 아키텍처

```
사용자 입력 (기업 · 직무 · 경험)
        ↓
  오케스트레이터
        ↓
┌─────────────────────────────────────┐
│  경험 분석 에이전트                 │  → 핵심 키워드 추출
│  (PDF/PPTX/DOCX 파싱 + Gemini)      │
└─────────────────────────────────────┘
        ↓
┌──────────────────┐  ┌──────────────────┐
│기업 분석 에이전트│   │ JD 분석 에이전트 │  ← asyncio.gather 병렬 실행
│ (Tavily + Gemini)│  │  (스크래핑/파일  │
│                  │  │   + Gemini)      │
└──────────────────┘  └──────────────────┘
        ↓
┌─────────────────────────────────────┐
│  자소서 전략 에이전트               │    → 갭 분석 + 어필 포인트
│  (앞선 3개 결과 종합 + Gemini)      │     + 항목별 전략 + 면접 질문
└─────────────────────────────────────┘
        ↓
  SSE 스트리밍으로 실시간 전송
        ↓
  구조화 리포트 출력
```

### 에이전트 실행 전략
- **경험 분석** → 먼저 실행 (이후 모든 에이전트가 이 결과에 의존)
- **기업 분석 + JD 분석** → `asyncio.gather`로 병렬 실행 (독립적이라 시간 절약)
- **자소서 전략** → 반드시 마지막 (앞 두 결과를 종합해야 하므로)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18 · TypeScript · Vite |
| Backend | FastAPI · Python 3.13 · uvicorn |
| AI | Gemini API (google-genai) |
| 검색 | Tavily API |
| 파일 파싱 | pypdf · python-docx · python-pptx |
| 통신 | SSE (Server-Sent Events) · FormData |

---

## 실행 방법

### 사전 준비
- Python 3.11+
- Node.js 20+
- [Gemini API 키](https://aistudio.google.com)
- [Tavily API 키](https://tavily.com)

### 백엔드 실행

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 서버 실행
uvicorn app.main:app --reload
# http://localhost:8000
```

### 프론트엔드 실행

```bash
cd frontend

npm install
npm run dev
# http://localhost:5173
```

---

## 프로젝트 구조

```
research-assistant/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── orchestrator.py   # 에이전트 조율
│   │   │   ├── experience.py     # 경험 분석
│   │   │   ├── company.py        # 기업 분석
│   │   │   ├── jd.py             # JD 분석
│   │   │   └── strategy.py       # 자소서 전략
│   │   ├── api/
│   │   │   └── research.py       # SSE 엔드포인트
│   │   ├── core/
│   │   │   ├── config.py         # 환경변수
│   │   │   └── gemini.py         # Gemini 공통 모듈
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ResearchInput.tsx  # 입력 폼
    │   │   ├── ResultView.tsx     # 결과 화면
    │   │   └── HistoryPanel.tsx   # 히스토리
    │   ├── hooks/
    │   │   ├── useResearch.ts     # API + 상태 관리
    │   │   └── useHistory.ts      # 히스토리 관리
    │   └── api/
    │       └── client.ts          # SSE 클라이언트
    └── package.json
```

---

## 개발 과정

[클로드로 개발하기] 시리즈로 개발 과정을 기록하고 있습니다.

- [1편 — 멀티에이전트 파이프라인 설계 및 구현](https://velog.io/@ssoypark)
- [2편 — 자소서 항목별 전략 + 파일 업로드](https://velog.io/@ssoypark)
- [3편 — SSE 스트리밍 + UX 개선](https://velog.io/@ssoypark)

---

## 개발자

**박소영** · AI/ML Engineer

- GitHub: [@SsoyPark](https://github.com/SsoyPark)
- Velog: [@ssoypark](https://velog.io/@ssoypark)**

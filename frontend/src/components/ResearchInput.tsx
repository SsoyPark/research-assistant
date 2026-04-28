// frontend/src/components/ResearchInput.tsx
import { useState, useRef } from 'react'


// 파일 업로드가 추가되서 ResearchRequest 대신 별도 타입 사용
interface FormData {
  company: string
  role: string
  jdUrl: string
  experienceText: string   // 직접 입력한 경험 텍스트
  file: File | null        // 첨부 파일
  depth: 'quick' | 'standard' | 'deep'
}

interface Props {
  onSubmit: (formData: FormData) => void
  loading: boolean
}

export default function ResearchInput({ onSubmit, loading }: Props) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [experienceText, setExperienceText] = useState('')  // 경험 직접 입력
  const [file, setFile] = useState<File | null>(null)       // 첨부 파일
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const fileInputRef = useRef<HTMLInputElement>(null)        // 파일 input 참조

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)   // 선택된 파일 저장
  }

  const handleSubmit = () => {
    if (!company || !role) return
    if (!experienceText && !file) {
      alert('경험 텍스트를 입력하거나 파일을 첨부해주세요.')
      return
    }
    onSubmit({ company, role, jdUrl, experienceText, file, depth })
  }

  const depthLabels = { quick: '빠른 요약', standard: '표준', deep: '심층 분석' }

  return (
    <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '1.5rem' }}>

      {/* 기업 */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>지원 기업</label>
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="예: 카카오, 삼성전자, 네이버"
          style={inputStyle}
        />
      </div>

      {/* 직무 */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>직무</label>
        <input
          value={role}
          onChange={e => setRole(e.target.value)}
          placeholder="예: AI 엔지니어, LLM 엔지니어"
          style={inputStyle}
        />
      </div>

      {/* JD URL */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>JD URL <span style={{ color: '#aaa' }}>(선택)</span></label>
        <input
          value={jdUrl}
          onChange={e => setJdUrl(e.target.value)}
          placeholder="채용공고 링크 붙여넣기"
          style={inputStyle}
        />
      </div>

      {/* 경험 입력 — 텍스트 + 파일 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>내 경험 입력 <span style={{ color: '#c00', fontSize: '0.75rem' }}>*둘 중 하나 필수</span></label>

        {/* 텍스트 직접 입력 */}
        <textarea
          value={experienceText}
          onChange={e => setExperienceText(e.target.value)}
          placeholder={`경험을 자유롭게 입력해줘. 길수록 좋아!\n\n예시:\n- SKT AICC 프로젝트에서 RAG 기반 검색 품질 평가 담당. 대화 로그 확장 및 오류 패턴 분류 수행.\n- GPAA 프로젝트에서 에이전트 메모리 모듈(Facet) 평가 및 LLM 비교 평가. 레시피 검색 MRR 0.907→0.943 개선.\n- KT AIVLE Re:WEAR 팀 리더. AI 기반 의류 리폼 플랫폼 개발. 우수상 수상.`}
          rows={7}
          style={{ ...inputStyle, resize: 'vertical' }}   // 세로 크기 조절 가능
        />

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
          <span style={{ fontSize: '0.75rem', color: '#aaa' }}>또는 파일 첨부</span>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
        </div>

        {/* 파일 첨부 */}
        <div
          onClick={() => fileInputRef.current?.click()}   // 클릭시 파일 선택창 열기
          style={{
            border: '1.5px dashed #ddd', borderRadius: '8px', padding: '16px',
            textAlign: 'center', cursor: 'pointer', background: 'white',
            color: file ? '#1a73e8' : '#aaa', fontSize: '0.875rem'
          }}
        >
          {file ? `📎 ${file.name}` : '📎 PDF / PPTX / DOCX 파일을 클릭해서 첨부'}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx,.docx"                      // 허용 파일 형식
          onChange={handleFileChange}
          style={{ display: 'none' }}                    // 숨김 처리 (위 div로 대체)
        />
        {/* 파일 선택 취소 */}
        {file && (
          <button
            onClick={() => setFile(null)}
            style={{ marginTop: '6px', fontSize: '0.75rem', color: '#c00',
              background: 'none', border: 'none', cursor: 'pointer' }}
          >
            파일 제거
          </button>
        )}
      </div>

      {/* 리서치 깊이 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>리서치 깊이</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['quick', 'standard', 'deep'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                borderColor: depth === d ? '#1a73e8' : '#ddd',
                background: depth === d ? '#e8f0fe' : 'white',
                color: depth === d ? '#1a73e8' : '#666',
                cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              {depthLabels[d]}
            </button>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={!company || !role || loading}
        style={{
          width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
          background: !company || !role || loading ? '#ccc' : '#1a73e8',
          color: 'white', fontWeight: '600',
          cursor: !company || !role || loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '분석 중...' : '리서치 시작 →'}
      </button>
    </div>
  )
}

// 공통 스타일
const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '8px',
  border: '1px solid #ddd', boxSizing: 'border-box',
  fontSize: '0.875rem', fontFamily: 'inherit'
}
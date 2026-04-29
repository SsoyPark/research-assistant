// frontend/src/components/ResearchInput.tsx
import { useState, useRef } from 'react'

interface ResearchFormData {
  company: string
  role: string
  jdUrl: string
  experienceText: string
  files: File[]
  jdFile: File | null
  depth: 'quick' | 'standard' | 'deep'
  jasoseoItems: string[]
}

interface Props {
  onSubmit: (formData: ResearchFormData) => void
  loading: boolean
}

export default function ResearchInput({ onSubmit, loading }: Props) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [experienceText, setExperienceText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [jasoseoItems, setJasoseoItems] = useState<string[]>([''])
  const fileInputRef = useRef<HTMLInputElement>(null)   // 경험 파일
  const jdFileRef = useRef<HTMLInputElement>(null)      // 직무기술서 파일

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJdFile(e.target.files?.[0] || null)
  }

  const addJasoseoItem = () => {
    setJasoseoItems(prev => [...prev, ''])
  }

  const removeJasoseoItem = (idx: number) => {
    setJasoseoItems(prev => prev.filter((_, i) => i !== idx))
  }

  const updateJasoseoItem = (idx: number, value: string) => {
    setJasoseoItems(prev => prev.map((item, i) => i === idx ? value : item))
  }

  const handleSubmit = () => {
    if (!company || !role) return
    if (!experienceText && files.length === 0) {
      alert('경험 텍스트를 입력하거나 파일을 첨부해주세요.')
      return
    }
    onSubmit({
      company, role, jdUrl, experienceText,
      files, jdFile, depth,
      jasoseoItems: jasoseoItems.filter(item => item.trim() !== '')
    })
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
        <label style={labelStyle}>채용공고 URL <span style={{ color: '#aaa' }}>(선택)</span></label>
        <input
          value={jdUrl}
          onChange={e => setJdUrl(e.target.value)}
          placeholder="채용공고 링크 붙여넣기"
          style={inputStyle}
        />
      </div>

      {/* 직무기술서 파일 첨부 */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>직무기술서 파일 <span style={{ color: '#aaa' }}>(선택)</span></label>
        <div
          onClick={() => jdFileRef.current?.click()}
          style={{
            border: '1.5px dashed #ddd', borderRadius: '8px', padding: '12px',
            textAlign: 'center', cursor: 'pointer', background: 'white',
            color: jdFile ? '#1a73e8' : '#aaa', fontSize: '0.875rem'
          }}
        >
          {jdFile ? `📄 ${jdFile.name}` : '📄 직무기술서 PDF / DOCX 첨부'}
        </div>
        <input
          ref={jdFileRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleJdFileChange}
          style={{ display: 'none' }}
        />
        {jdFile && (
          <button
            onClick={() => setJdFile(null)}
            style={{ marginTop: '4px', fontSize: '0.75rem', color: '#c00',
              background: 'none', border: 'none', cursor: 'pointer' }}
          >
            파일 제거
          </button>
        )}
      </div>      

      {/* 경험 입력 */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>
          내 경험 입력 <span style={{ color: '#c00', fontSize: '0.75rem' }}>*텍스트 또는 파일 필수</span>
        </label>
        <textarea
          value={experienceText}
          onChange={e => setExperienceText(e.target.value)}
          placeholder={`경험을 자유롭게 입력해줘. 길수록 좋아!\n\n예시:\n- SKT AICC 프로젝트에서 RAG 기반 검색 품질 평가 담당.\n- GPAA 프로젝트에서 에이전트 메모리 모듈(Facet) 평가. MRR 0.907→0.943 개선.\n- KT AIVLE Re:WEAR 팀 리더. AI 기반 의류 리폼 플랫폼 개발. 우수상 수상.`}
          rows={7}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
          <span style={{ fontSize: '0.75rem', color: '#aaa' }}>또는 파일 첨부</span>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
        </div>

        {/* 경험 파일 첨부 — 여러 개 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '1.5px dashed #ddd', borderRadius: '8px', padding: '16px',
            textAlign: 'center', cursor: 'pointer', background: 'white',
            color: '#aaa', fontSize: '0.875rem'
          }}
        >
          📎 포트폴리오 · 발표자료 PDF / PPTX / DOCX (여러 개 가능)
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx,.docx"
          multiple
          onChange={handleFilesChange}
          style={{ display: 'none' }}
        />

        {/* 첨부된 경험 파일 목록 */}
        {files.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '6px 10px', background: '#f0f4ff',
                borderRadius: '6px', fontSize: '0.8rem', color: '#1a73e8' }}>
                📎 {f.name}
                <button
                  onClick={() => removeFile(i)}
                  style={{ background: 'none', border: 'none', color: '#c00',
                    cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* 자소서 항목 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          자소서 항목 <span style={{ color: '#aaa' }}>(선택)</span>
        </label>
        <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '0 0 8px' }}>
          항목을 입력하면 항목별 맞춤 전략을 생성해줍니다
        </p>
        {jasoseoItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input
              value={item}
              onChange={e => updateJasoseoItem(idx, e.target.value)}
              placeholder="예: 지원동기를 작성하시오 / 본인의 강점과 경험을 인재상과 연결하여 서술하시오"
              style={{ ...inputStyle, flex: 1 }}
            />
            {jasoseoItems.length > 1 && (
              <button
                onClick={() => removeJasoseoItem(idx)}
                style={{ padding: '0 10px', borderRadius: '8px', border: '1px solid #ddd',
                  background: 'white', color: '#c00', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addJasoseoItem}
          style={{ marginTop: '4px', fontSize: '0.8rem', color: '#1a73e8',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          + 항목 추가
        </button>
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

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '8px',
  border: '1px solid #ddd', boxSizing: 'border-box',
  fontSize: '0.875rem', fontFamily: 'inherit'
}
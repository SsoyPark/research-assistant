// frontend/src/components/DraftView.tsx
import { useState } from 'react'
import { createFeedback } from '../api/client'
import type { FeedbackRequest } from '../api/client'

interface Props {
  data: any
}

export default function DraftView({ data }: Props) {
  const strategy = data.strategy?.strategy
  const experience = data.experience_analysis
  const jasoseoItems: string[] = data.strategy?.jasoseo_items || []

  const [selectedIdx, setSelectedIdx] = useState(0)
  const [userDrafts, setUserDrafts] = useState<Record<number, string>>({})
  const [results, setResults] = useState<Record<number, any>>({})
  const [charLimit, setCharLimit] = useState(700)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userDraft = userDrafts[selectedIdx] || ''
  const result = results[selectedIdx] || null

  if (jasoseoItems.length === 0) return null

  const handleFeedback = async () => {
    if (!userDraft.trim()) {
      alert('초안을 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const jasoseoStrategy = strategy?.jasoseo_strategies?.[String(selectedIdx + 1)] || {}
      const req: FeedbackRequest = {
        company: data.company,
        role: data.role,
        jasoseo_item: jasoseoItems[selectedIdx],
        user_draft: userDraft,
        experience_tags: experience?.keywords || [],
        appeal_points: strategy?.appeal_points || [],
        jasoseo_strategy: jasoseoStrategy,
        char_limit: charLimit,
      }
      const res = await createFeedback(req)
      setResults(prev => ({ ...prev, [selectedIdx]: res }))
    } catch (e: any) {
      setError(e.message || '첨삭 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(prev => ({ ...prev, [selectedIdx]: null }))
    setUserDrafts(prev => ({ ...prev, [selectedIdx]: '' }))
    setError(null)
  }

  return (
    <div className="draft-result-hidden" style={{ background: 'white', borderRadius: '12px', padding: '1.25rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginTop: '1rem' }}>

      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>✏️ 자소서 첨삭</h3>

      {/* 항목 선택 */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 6px' }}>첨삭할 항목 선택</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {jasoseoItems.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedIdx === i ? '#1a73e8' : '#eee',
                background: selectedIdx === i ? '#e8f0fe' : 'white',
                fontSize: '0.8rem', color: selectedIdx === i ? '#1a73e8' : '#444',
                lineHeight: 1.5,
              }}
            >
              {results[i] ? '✅ ' : ''}{i + 1}. {item.length > 60 ? item.slice(0, 60) + '...' : item}
            </div>
          ))}
        </div>
      </div>

      {/* 글자수 설정 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>글자수 제한</p>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[500, 700, 1000, 1500].map(n => (
            <button
              key={n}
              onClick={() => setCharLimit(n)}
              style={{
                padding: '4px 12px', borderRadius: '20px', border: '1px solid',
                borderColor: charLimit === n ? '#1a73e8' : '#ddd',
                background: charLimit === n ? '#e8f0fe' : 'white',
                color: charLimit === n ? '#1a73e8' : '#666',
                cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              {n}자
            </button>
          ))}
        </div>
      </div>

      {/* 초안 입력 */}
      {!result && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '6px' }}>
              <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>내 초안 입력</p>
              <span style={{ fontSize: '0.75rem',
                color: userDraft.length > charLimit ? '#c00' : '#aaa' }}>
                {userDraft.length} / {charLimit}자
              </span>
            </div>
            <textarea
              value={userDraft}
              onChange={e => setUserDrafts(prev => ({ ...prev, [selectedIdx]: e.target.value }))}
              placeholder={`${jasoseoItems[selectedIdx].slice(0, 30)}...\n\n여기에 작성한 자소서 초안을 붙여넣어줘.`}
              rows={10}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', boxSizing: 'border-box',
                fontSize: '0.875rem', lineHeight: 1.8, resize: 'vertical',
                fontFamily: 'inherit' }}
            />
          </div>

          <button
            onClick={handleFeedback}
            disabled={loading || !userDraft.trim()}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
              background: loading || !userDraft.trim() ? '#ccc' : '#1a73e8',
              color: 'white', fontWeight: '600',
              cursor: loading || !userDraft.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {loading ? '첨삭 중...' : '✏️ 첨삭받기'}
          </button>

          {error && (
            <p style={{ color: '#c00', fontSize: '0.8rem', margin: '8px 0 0' }}>{error}</p>
          )}
        </>
      )}

      {/* 첨삭 결과 */}
      {result && (
        <div className="draft-result-hidden">
          <div style={{ marginBottom: '1.25rem', padding: '1rem',
            background: '#f9f9f9', borderRadius: '10px' }}>

            <p style={{ fontSize: '0.8rem', fontWeight: '600',
              color: '#060', margin: '0 0 6px' }}>✅ 잘된 점</p>
            {result.strengths?.map((s: string, i: number) => (
              <p key={i} style={{ fontSize: '0.85rem', color: '#444',
                margin: '0 0 4px', lineHeight: 1.6 }}>• {s}</p>
            ))}

            <p style={{ fontSize: '0.8rem', fontWeight: '600',
              color: '#c00', margin: '1rem 0 6px' }}>⚠️ 보완할 점</p>
            {result.improvements?.map((s: string, i: number) => (
              <p key={i} style={{ fontSize: '0.85rem', color: '#444',
                margin: '0 0 4px', lineHeight: 1.6 }}>• {s}</p>
            ))}

            {result.keyword_usage && (
              <>
                <p style={{ fontSize: '0.8rem', fontWeight: '600',
                  color: '#555', margin: '1rem 0 6px' }}>🔑 키워드 활용도</p>
                {result.keyword_usage.well_used?.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#444', margin: '0 0 4px' }}>
                    잘 활용: {result.keyword_usage.well_used?.join(', ')}
                  </p>
                )}
                {result.keyword_usage.missing?.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#c00', margin: 0 }}>
                    미활용: {result.keyword_usage.missing?.join(', ')}
                  </p>
                )}
              </>
            )}
          </div>

          {/* 수정본 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '600',
                color: '#1a73e8', margin: 0 }}>📝 수정본</p>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {result.char_count}자
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#1a1a1a', margin: '0 0 10px',
              lineHeight: 1.8, whiteSpace: 'pre-wrap', padding: '12px',
              background: '#f0f4ff', borderRadius: '8px' }}>
              {result.revised_draft}
            </p>

            {result.change_summary?.length > 0 && (
              <div style={{ padding: '10px 12px', background: '#f9f9f9',
                borderRadius: '8px', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: '600',
                  color: '#555', margin: '0 0 6px' }}>주요 변경 포인트</p>
                {result.change_summary.map((c: string, i: number) => (
                  <p key={i} style={{ fontSize: '0.8rem', color: '#666',
                    margin: '0 0 3px', lineHeight: 1.5 }}>• {c}</p>
                ))}
              </div>
            )}

            <CopyButton text={result.revised_draft} />
          </div>

          <button
            onClick={handleReset}
            style={{ width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid #ddd', background: 'white',
              color: '#555', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            ↺ 다시 첨삭받기
          </button>
        </div>
      )}

      {/* 전체 결과 복사 — 결과가 하나라도 있을 때 */}
      {Object.keys(results).some(k => results[Number(k)]) && (
        <CopyAllButton
          jasoseoItems={jasoseoItems}
          results={results}
          company={data.company}
          role={data.role}
        />
      )}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{ width: '100%', padding: '8px', borderRadius: '8px',
        border: '1px solid #ddd',
        background: copied ? '#e8f0fe' : 'white',
        color: copied ? '#1a73e8' : '#555',
        cursor: 'pointer', fontSize: '0.875rem' }}
    >
      {copied ? '✓ 복사됨' : '📋 수정본 복사'}
    </button>
  )
}

function CopyAllButton({ jasoseoItems, results, company, role }: {
  jasoseoItems: string[]
  results: Record<number, any>
  company: string
  role: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = () => {
    const lines: string[] = []
    lines.push(`${company} · ${role} 자소서 첨삭 결과`)
    lines.push('='.repeat(40))

    Object.entries(results).forEach(([key, result]) => {
      if (!result) return
      const idx = Number(key)
      lines.push('')
      lines.push(`[항목 ${idx + 1}] ${jasoseoItems[idx]}`)
      lines.push('-'.repeat(40))

      lines.push('✅ 잘된 점')
      result.strengths?.forEach((s: string) => lines.push(`• ${s}`))

      lines.push('')
      lines.push('⚠️ 보완할 점')
      result.improvements?.forEach((s: string) => lines.push(`• ${s}`))

      lines.push('')
      lines.push('📝 수정본')
      lines.push(result.revised_draft || '')
      lines.push(`(${result.char_count}자)`)

      if (result.change_summary?.length > 0) {
        lines.push('')
        lines.push('주요 변경 포인트')
        result.change_summary.forEach((c: string) => lines.push(`• ${c}`))
      }

      lines.push('='.repeat(40))
    })

    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopyAll}
      style={{ width: '100%', marginTop: '1rem', padding: '10px',
        borderRadius: '8px', border: '1px solid #1a73e8',
        background: copied ? '#e8f0fe' : 'white',
        color: '#1a73e8', cursor: 'pointer',
        fontSize: '0.875rem', fontWeight: '600' }}
    >
      {copied ? '✓ 전체 복사됨' : '📋 전체 첨삭 결과 복사'}
    </button>
  )
}
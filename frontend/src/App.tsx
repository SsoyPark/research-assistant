// frontend/src/App.tsx
import { useState } from 'react'
import ResearchInput from './components/ResearchInput'
import ResultView from './components/ResultView'
import { createResearch } from './api/client'
import type { ResearchRequest } from './api/client'

export default function App() {
  const [data, setData] = useState<any>(null)          // 리서치 결과
  const [loading, setLoading] = useState(false)        // 로딩 상태
  const [error, setError] = useState<string | null>(null)  // 에러 메시지

  const handleSubmit = async (formData: ResearchRequest) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await createResearch(formData)    // API 호출
      setData(result)                                  // 결과 저장
    } catch (e: any) {
      setError(e.response?.data?.detail || '오류가 발생했습니다.')
    } finally {
      setLoading(false)                                // 로딩 종료
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

      {/* 헤더 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 4px' }}>
          취준 리서치 어시스턴트
        </h1>
        <p style={{ color: '#888', fontSize: '0.875rem', margin: 0 }}>
          기업 + JD 분석 → 자소서 전략 자동 생성
        </p>
      </div>

      {/* 입력 폼 */}
      <ResearchInput onSubmit={handleSubmit} loading={loading} />

      {/* 로딩 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <p>에이전트 분석 중이에요...</p>
          <p style={{ fontSize: '0.8rem' }}>
            경험 분석 + 기업 분석 + JD 분석 + 전략 생성 (30~40초 소요)
          </p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff0f0',
          borderRadius: '8px', color: '#c00' }}>
          {error}
        </div>
      )}

      {/* 결과 */}
      {data && !loading && <ResultView data={data} />}

    </div>
  )
}
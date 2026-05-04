// frontend/src/App.tsx
import ResearchInput from './components/ResearchInput'
import ResultView from './components/ResultView'
import { useResearch } from './hooks/useResearch'
import HistoryPanel from './components/HistoryPanel'


export default function App() {
  const { data, loading, error, status, runResearch, reset, loadHistory } = useResearch()


  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>

      {/* 헤더 */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee',
        padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100,
        textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
          취준 리서치 어시스턴트
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', margin: '2px 0 0' }}>
          기업 + JD 분석 → 자소서 전략 자동 생성
        </p>
      </div>

      {/* 로딩 오버레이 */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', width: '360px' }}>
            <div style={{
              width: '48px', height: '48px', margin: '0 auto 1.5rem',
              border: '4px solid #e8f0fe',
              borderTop: '4px solid #1a73e8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '600',
              margin: '0 0 8px', color: '#1a1a1a' }}>
              {status?.message || '분석 준비 중...'}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 1.5rem' }}>
              AI 에이전트가 분석하고 있어요
            </p>
            <div style={{ background: '#eee', borderRadius: '20px', height: '8px' }}>
              <div style={{
                background: '#1a73e8', borderRadius: '20px', height: '8px',
                width: `${((status?.step || 0) / (status?.total || 4)) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              marginTop: '8px', fontSize: '0.75rem' }}>
              {['경험 분석', '기업·JD 분석', '전략 생성', '완료'].map((s, i) => (
                <span key={i} style={{
                  color: (status?.step || 0) > i ? '#1a73e8' : '#ccc',
                  fontWeight: (status?.step || 0) > i ? '600' : '400',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 메인 콘텐츠 */}
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>

        {/* 입력 화면 — 결과 없을 때만 */}
        {!data && (
          <>
            <ResearchInput onSubmit={runResearch} loading={loading} />
            {error && (
              <div style={{ marginTop: '1rem', padding: '1rem',
                background: '#fff0f0', borderRadius: '8px',
                color: '#c00', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            {/* 히스토리 패널 추가 */}
            <HistoryPanel onSelect={loadHistory} />
          </>
        )}

        {/* 결과 화면 — 결과 있을 때만 */}
        {data && !loading && (
          <>
            <ResultView data={data} />
            <div style={{ textAlign: 'center', marginTop: '2rem',
              paddingBottom: '2rem', display: 'flex',
              justifyContent: 'center', gap: '12px' }}>

              {/* PDF 저장 */}
              <button
                onClick={() => window.print()}
                style={{ padding: '10px 24px', borderRadius: '8px',
                  border: 'none', background: '#1a73e8',
                  color: 'white', cursor: 'pointer', fontSize: '0.875rem',
                  fontWeight: '600' }}
              >
                📄 PDF로 저장
              </button>

              {/* 다시 분석하기 */}
              <button
                onClick={reset}
                style={{ padding: '10px 24px', borderRadius: '8px',
                  border: '1px solid #ddd', background: 'white',
                  color: '#555', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                ↻ 다시 분석하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
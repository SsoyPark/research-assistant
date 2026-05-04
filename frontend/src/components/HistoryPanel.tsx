// frontend/src/components/HistoryPanel.tsx
import { useState, useEffect } from 'react'
import { useHistory } from '../hooks/useHistory'
import type { HistoryItem } from '../hooks/useHistory'

interface Props {
  onSelect: (data: any) => void    // 히스토리 항목 클릭시 결과 화면으로 이동
}

export default function HistoryPanel({ onSelect }: Props) {
  const { getHistory, deleteHistory, clearHistory } = useHistory()
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    setHistory(getHistory())       // 컴포넌트 마운트시 히스토리 로드
  }, [])

  const handleDelete = (id: string) => {
    deleteHistory(id)
    setHistory(getHistory())       // 삭제 후 목록 갱신
  }

  const handleClear = () => {
    if (!confirm('히스토리를 전부 삭제할까요?')) return
    clearHistory()
    setHistory([])
  }

  if (history.length === 0) return null  // 히스토리 없으면 표시 안 함

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: '600',
          color: '#555', margin: 0 }}>최근 분석 히스토리</p>
        <button
          onClick={handleClear}
          style={{ fontSize: '0.75rem', color: '#aaa', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0 }}
        >
          전체 삭제
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {history.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center',
            gap: '8px', padding: '10px 12px', background: 'white',
            borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            cursor: 'pointer' }}
            onClick={() => onSelect(item.data)}
          >
            {/* 클릭 영역 */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontSize: '0.875rem',
                fontWeight: '500', color: '#1a1a1a' }}>
                {item.company} · {item.role}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>
                {item.createdAt}
              </p>
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
              style={{ background: 'none', border: 'none', color: '#ccc',
                cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
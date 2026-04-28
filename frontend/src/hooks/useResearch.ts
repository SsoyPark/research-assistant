// frontend/src/hooks/useResearch.ts
import { useState } from 'react'
import { createResearch } from '../api/client'  // API 클라이언트
import type { ResearchRequest } from '../api/client'

export function useResearch() {
  const [data, setData] = useState<any>(null)       // 리서치 결과 데이터
  const [loading, setLoading] = useState(false)     // 로딩 상태
  const [error, setError] = useState<string | null>(null)  // 에러 메시지

  const runResearch = async (req: ResearchRequest) => {
    setLoading(true)   // 로딩 시작
    setError(null)     // 이전 에러 초기화
    setData(null)      // 이전 결과 초기화

    try {
      const result = await createResearch(req)  // API 호출
      setData(result)                           // 결과 저장
    } catch (e: any) {
      setError(e.response?.data?.detail || '오류가 발생했습니다.')  // 에러 저장
    } finally {
      setLoading(false)  // 로딩 종료 (성공/실패 무관)
    }
  }

  return { data, loading, error, runResearch }  // 컴포넌트에서 사용할 값들 반환
}
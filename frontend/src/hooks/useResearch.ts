// frontend/src/hooks/useResearch.ts
import { useState } from 'react'
import { streamResearch } from '../api/client'
import type { ResearchRequest } from '../api/client'
import { useHistory } from './useHistory'                

export interface ResearchStatus {
  message: string
  step: number
  total: number
}

export function useResearch() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ResearchStatus | null>(null)
  const { saveHistory } = useHistory()                   

  const runResearch = async (req: ResearchRequest) => {
    setLoading(true)
    setError(null)
    setData(null)
    setStatus(null)

    try {
      await streamResearch(req, (event, eventData) => {
        switch (event) {
          case 'status':
            setStatus(eventData)
            break
          case 'done':
            setData(eventData)
            setStatus(null)
            saveHistory(eventData)                       // 완료되면 자동 저장
            break
          case 'error':
            setError(eventData.message)
            break
        }
      })
    } catch (e: any) {
      setError(e.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setStatus(null)
  }

  const loadHistory = (historyData: any) => {
    setData(historyData)           // 히스토리 데이터를 결과로 바로 표시
  }

  return { data, loading, error, status, runResearch, reset, loadHistory }
}
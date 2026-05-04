// frontend/src/hooks/useHistory.ts

export interface HistoryItem {
  id: string
  company: string
  role: string
  createdAt: string
  data: any
}

const STORAGE_KEY = 'research_history'
const MAX_ITEMS = 10                                    // 최대 10개까지 저장

export function useHistory() {

  const getHistory = (): HistoryItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const saveHistory = (data: any) => {
    try {
      const history = getHistory()
      const newItem: HistoryItem = {
        id: Date.now().toString(),                      // 타임스탬프로 고유 ID 생성
        company: data.company,
        role: data.role,
        createdAt: new Date().toLocaleString('ko-KR'),  // 한국 시간 형식
        data,
      }
      // 최신 항목이 앞에 오도록 + 최대 개수 제한
      const updated = [newItem, ...history].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      console.error('히스토리 저장 실패')
    }
  }

  const deleteHistory = (id: string) => {
    const updated = getHistory().filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  return { getHistory, saveHistory, deleteHistory, clearHistory }
}
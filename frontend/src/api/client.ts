// frontend/src/api/client.ts

export interface ResearchRequest {
  company: string
  role: string
  jdUrl: string
  experienceText: string
  files: File[]
  jdFile: File | null
  depth: string
  jasoseoItems: string[]
}

export const streamResearch = async (
  formData: ResearchRequest,
  onEvent: (event: string, data: any) => void   // 이벤트 수신 콜백
) => {
  const data = new FormData()
  data.append('company', formData.company)
  data.append('role', formData.role)
  data.append('depth', formData.depth)
  if (formData.jdUrl) data.append('jd_url', formData.jdUrl)
  if (formData.experienceText) data.append('experience_text', formData.experienceText)
  if (formData.jasoseoItems.length > 0)
    data.append('jasoseo_items', JSON.stringify(formData.jasoseoItems))
  formData.files.forEach(f => data.append('files', f))
  if (formData.jdFile) data.append('jd_file', formData.jdFile)

  const response = await fetch('http://localhost:8000/api/research', {
    method: 'POST',
    body: data,
  })

  if (!response.body) throw new Error('스트리밍 응답 없음')

  const reader = response.body.getReader()          // 스트림 리더
  const decoder = new TextDecoder()                 // 바이트 → 텍스트 변환
  let buffer = ''                                   // 불완전한 데이터 버퍼

  while (true) {
    const { done, value } = await reader.read()     // 스트림에서 청크 읽기
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE는 \n\n으로 이벤트 구분
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''                      // 마지막 불완전한 줄 버퍼에 보관

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6))  // 'data: ' 제거 후 파싱
          onEvent(parsed.event, parsed.data)         // 콜백 호출
        } catch {
          console.error('SSE 파싱 오류:', line)
        }
      }
    }
  }
}

export interface FeedbackRequest {
  company: string
  role: string
  jasoseo_item: string
  user_draft: string
  experience_tags: string[]
  appeal_points: string[]
  jasoseo_strategy: Record<string, any>
  char_limit: number
}

export const createFeedback = async (req: FeedbackRequest) => {
  const response = await fetch('http://localhost:8000/api/draft/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || '첨삭 실패')
  }
  return response.json()
}
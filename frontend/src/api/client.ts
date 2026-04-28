// frontend/src/api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export interface ResearchRequest {
  company: string
  role: string
  jdUrl: string
  experienceText: string
  file: File | null
  depth: string
}

export const createResearch = async (formData: ResearchRequest) => {
  const data = new FormData()                              // multipart/form-data 형식
  data.append('company', formData.company)                 // 기업명
  data.append('role', formData.role)                       // 직무
  data.append('depth', formData.depth)                     // 리서치 깊이
  if (formData.jdUrl) data.append('jd_url', formData.jdUrl)           // JD URL (선택)
  if (formData.experienceText) data.append('experience_text', formData.experienceText)  // 경험 텍스트
  if (formData.file) data.append('file', formData.file)   // 첨부 파일 (선택)

  const response = await apiClient.post('/api/research', data)
  return response.data
}
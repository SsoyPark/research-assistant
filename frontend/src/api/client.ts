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
  files: File[]              // 경험 파일 여러 개
  jdFile: File | null        // 직무기술서 파일
  depth: string
  jasoseoItems: string[]
}

export const createResearch = async (formData: ResearchRequest) => {
  const data = new FormData()
  data.append('company', formData.company)
  data.append('role', formData.role)
  data.append('depth', formData.depth)
  if (formData.jdUrl) data.append('jd_url', formData.jdUrl)
  if (formData.experienceText) data.append('experience_text', formData.experienceText)
  if (formData.jasoseoItems.length > 0)
    data.append('jasoseo_items', JSON.stringify(formData.jasoseoItems))

  // 경험 파일 여러 개 — 같은 키로 여러 번 append
  formData.files.forEach(f => data.append('files', f))

  // 직무기술서 파일
  if (formData.jdFile) data.append('jd_file', formData.jdFile)

  const response = await apiClient.post('/api/research', data)
  return response.data
}
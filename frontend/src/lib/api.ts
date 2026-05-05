import axios from 'axios'

export function getApiBaseUrl(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8000/portfolio/v1/api'
}

export function normalizeMediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  const normalizedPath = url.startsWith('/media/')
    ? url
    : (url.startsWith('/') ? `/media${url}` : `/media/${url}`)
  try {
    const origin = new URL(getApiBaseUrl()).origin
    return `${origin}${normalizedPath}`
  } catch { return normalizedPath }
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

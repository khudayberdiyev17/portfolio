const ABSOLUTE_URL_REGEX = /^(?:https?:)?\/\//i
const DATA_OR_BLOB_REGEX = /^(?:data:|blob:)/i
const MEDIA_PREFIX = '/media/'

export function normalizeMediaPath(value?: string | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (ABSOLUTE_URL_REGEX.test(trimmed) || DATA_OR_BLOB_REGEX.test(trimmed)) return trimmed
  if (trimmed.startsWith(MEDIA_PREFIX)) return trimmed
  if (trimmed.startsWith('/')) return `/media${trimmed}`
  return `/media/${trimmed}`
}

export function resolveMediaUrl(value?: string | null): string {
  return normalizeMediaPath(value)
}

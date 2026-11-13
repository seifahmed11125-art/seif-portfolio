export const PROJECT_IMAGE_BUCKET = 'images'
export const PROJECT_VIDEO_BUCKET = 'project-videos'
export const MAX_PROJECT_VIDEO_MB = 50
export const MAX_PROJECT_VIDEO_BYTES = MAX_PROJECT_VIDEO_MB * 1_000_000
export const MAX_PROJECT_COVER_BYTES = 3_000_000
export const PROJECT_MEDIA_CACHE_SECONDS = '31536000'

const videoExtensions = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
} as const

export type ProjectVideoType = keyof typeof videoExtensions

export function isProjectVideoType(type: unknown): type is ProjectVideoType {
  return type === 'video/mp4' || type === 'video/webm'
}

export function projectVideoType(file: File): ProjectVideoType | undefined {
  if (isProjectVideoType(file.type)) return file.type
  if (file.type && file.type !== 'application/octet-stream') return

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'mp4') return 'video/mp4'
  if (extension === 'webm') return 'video/webm'
}

export function isProjectId(id: unknown): id is string {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export function projectVideoPath(id: string, type: ProjectVideoType) {
  return id + '.' + videoExtensions[type]
}

export function parseProjectLink(value: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)
    if ((url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password) {
      return url
    }
  } catch {
    // Some older projects have no usable external link.
  }

  return null
}

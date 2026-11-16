import 'server-only'
import type { JourneyProject } from './types'

interface ProjectRow {
  id: string
  title: string | null
  category: string | null
  description: string | null
  external_link: string | null
  image: string | null
  video_path: string | null
}

function httpUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

function objectPath(value: string) {
  return value.split('/').filter(Boolean).map(encodeURIComponent).join('/')
}

export async function loadPortfolioProjects(coverWidth: 750 | 1080 = 1080): Promise<{ projects: JourneyProject[]; unavailable: boolean }> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!base || !key) return { projects: [], unavailable: true }
  try {
    const url = new URL('/rest/v1/projects', base)
    url.searchParams.set('select', 'id,title,category,description,external_link,image,video_path')
    url.searchParams.set('order', 'created_at.desc')
    // A fresh public read keeps admin edits visible on the next page request.
    // Only the existing public key is used; no privileged client reaches the browser.
    const response = await fetch(url, {
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) }, cache: 'no-store', signal: AbortSignal.timeout(7000),
    })
    if (!response.ok) throw new Error('Project read failed')
    const rows = await response.json() as ProjectRow[]
    if (!Array.isArray(rows)) throw new Error('Invalid project response')
    const projects = rows.map(row => {
      const imagePath = row.image?.replace(/^\/+/, '') || ''
      const original = httpUrl(row.image) || (imagePath
        ? `${base}/storage/v1/object/public/images/${objectPath(imagePath.startsWith('projects/') ? imagePath : `projects/${imagePath}`)}`
        : null)
      const cover = original && new URL(original).hostname === new URL(base).hostname
        ? `/_next/image?url=${encodeURIComponent(original)}&w=${coverWidth}&q=80`
        : original || '/journey/logo.webp'
      return {
        id: row.id, title: row.title || '', category: row.category || '',
        description: row.description || '', external_link: httpUrl(row.external_link), cover,
        video_url: row.video_path ? `${base}/storage/v1/object/public/project-videos/${objectPath(row.video_path)}` : null,
      }
    })
    return { projects, unavailable: false }
  } catch {
    // A project-service outage must not hide the hero, services or contact links.
    return { projects: [], unavailable: true }
  }
}

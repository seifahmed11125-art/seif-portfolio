export const AI_VIDEOS_CATEGORY = 'AI Videos'

export const categories = [
  'All',
  'Brand Identity',
  'Social Media Designs',
  'Motion Graphics',
  AI_VIDEOS_CATEGORY,
  'Print Designs',
  'Presentation Designs',
] as const

export type Category = (typeof categories)[number]

export interface Project {
  id: string
  title: string | null
  category: string | null
  description?: string | null
  external_link: string | null
  image?: string | null
  video_url?: string | null
  created_at?: string | null
}

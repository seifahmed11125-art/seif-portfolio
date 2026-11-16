import copy from './copy.json'

export interface JourneyProject {
  id: string
  title: string
  category: string
  description: string
  external_link: string | null
  cover: string
  video_url: string | null
}

export type JourneyData = typeof copy & { projects: JourneyProject[] }

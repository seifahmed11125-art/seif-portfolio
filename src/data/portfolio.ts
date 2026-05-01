export type Category = 'All' | 'Brand Identity' | 'Social Media Designs' | 'Motion Graphics' | 'Print Designs' | 'Presentation Designs'

export interface Project {
  id: string
  title: string | null
  category: string | null
  description?: string | null
  image?: string | null
  created_at?: string | null
}

export const categories: Category[] = ['All', 'Brand Identity', 'Social Media Designs', 'Motion Graphics', 'Print Designs', 'Presentation Designs']

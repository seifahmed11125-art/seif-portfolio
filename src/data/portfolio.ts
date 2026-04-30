export type Category = 'All' | 'Brand Identity' | 'Social Media Designs' | 'Motion Graphics' | 'Print Designs' | 'Presentation Designs'

export interface Project {
  id: number
  title: string
  category: Category
  image: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'Luxury Brand Identity',
    category: 'Brand Identity',
    image: 'brand-1',
    featured: true,
  },
  {
    id: 2,
    title: 'Fashion Social Campaign',
    category: 'Social Media Designs',
    image: 'social-1',
    featured: true,
  },
  {
    id: 3,
    title: 'Corporate Brochure',
    category: 'Print Designs',
    image: 'print-1',
  },
  {
    id: 4,
    title: 'Startup Logo Design',
    category: 'Brand Identity',
    image: 'brand-2',
    featured: true,
  },
  {
    id: 5,
    title: 'Restaurant Menu Design',
    category: 'Print Designs',
    image: 'print-2',
  },
  {
    id: 6,
    title: 'Tech Startup Visuals',
    category: 'Social Media Designs',
    image: 'social-2',
    featured: true,
  },
]

export const categories: Category[] = ['All', 'Brand Identity', 'Social Media Designs', 'Motion Graphics', 'Print Designs', 'Presentation Designs']

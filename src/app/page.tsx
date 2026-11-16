import PortfolioShell from '@/components/journey/PortfolioShell'
import type { Viewport } from 'next'
import copy from '@/lib/journey/copy.json'
import { loadPortfolioProjects } from '@/lib/journey/loadProjects'
import '@/styles/journey-entry.css'

export const dynamic = 'force-dynamic'
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default async function Home() {
  const { projects, unavailable } = await loadPortfolioProjects(750)
  return <PortfolioShell data={{ ...copy, projects }} unavailable={unavailable} />
}

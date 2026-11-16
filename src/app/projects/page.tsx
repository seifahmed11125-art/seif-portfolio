import PortfolioShell from '@/components/journey/PortfolioShell'
import copy from '@/lib/journey/copy.json'
import { loadPortfolioProjects } from '@/lib/journey/loadProjects'
import '@/styles/journey.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'All Projects — Seif El-Din' }

export default async function Projects({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ projects, unavailable }, params] = await Promise.all([loadPortfolioProjects(), searchParams])
  return <PortfolioShell data={{ ...copy, projects }} page="projects" unavailable={unavailable} category={params.category} />
}

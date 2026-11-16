import PortfolioShell from '@/components/journey/PortfolioShell'
import copy from '@/lib/journey/copy.json'
import { loadPortfolioProjects } from '@/lib/journey/loadProjects'
import '@/styles/journey.css'
import '@/styles/journey-hero.css'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { projects, unavailable } = await loadPortfolioProjects(750)
  return <PortfolioShell data={{ ...copy, projects }} unavailable={unavailable} />
}

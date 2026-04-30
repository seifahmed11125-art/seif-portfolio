'use client'

import PortfolioGrid from '@/components/PortfolioGrid'

export default function Projects() {
  return (
    <main className="pt-32">
      <PortfolioGrid 
        showFilters={true} 
        title="All Projects" 
        label="Projects" 
      />
    </main>
  )
}

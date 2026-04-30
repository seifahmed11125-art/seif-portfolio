'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Cursor from '@/components/Cursor'
import LoadingScreen from '@/components/LoadingScreen'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import PortfolioGrid from '@/components/PortfolioGrid'
import Contact from '@/components/Contact'
import { useLenis } from '@/hooks/useLenis'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  
  useLenis()

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isLoading])

  return (
    <div className="relative min-h-screen bg-bg-dark selection:bg-accent selection:text-primary">
      <div className="noise-overlay" />
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      
      {!isLoading && (
        <>
          <Cursor />
          <Navbar />
          <main>
            <Hero />
            <About />
            <Services />
            <PortfolioGrid limit={6} showFilters={true} title="Selected Works" label="Portfolio" showCTA={true} />
            <Contact />
          </main>
        </>
      )}
    </div>
  )
}

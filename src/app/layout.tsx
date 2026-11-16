import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Seif El Din Ahmed — Portfolio',
  description: 'Seif El Din — Graphic Designer & Visual Creator. Brand identity, social media designs, motion graphics and AI videos.',
  icons: {
    icon: '/journey/logo.webp',
    shortcut: '/journey/logo.webp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/mochi.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

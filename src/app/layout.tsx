import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Seif El-Din Ahmed — Portfolio',
  description: 'Portfolio of Seif El-Din - Creative Designer specializing in brand identity, social media design, and visual storytelling.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

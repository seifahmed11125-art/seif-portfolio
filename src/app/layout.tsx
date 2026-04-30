import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Providers from './providers'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700']
})

export const metadata: Metadata = {
  title: 'Seif El-Din Ahmed — Portfolio',
  description: 'Portfolio of Seif El-Din - Creative Designer specializing in brand identity, social media design, and visual storytelling.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <head>
        <link
          rel="preload"
          href="/fonts/MochiBoomDEMO.ttf"
          as="font"
          type="font/ttf"
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

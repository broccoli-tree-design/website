import type { Metadata } from 'next'
import { Source_Serif_4, Work_Sans, Montserrat_Alternates, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from './site'

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--serif',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const sans = Work_Sans({
  subsets: ['latin'],
  variable: '--sans',
  weight: ['400', '500', '600', '700'],
})

const display = Montserrat_Alternates({
  subsets: ['latin'],
  variable: '--display',
  weight: ['500', '600', '700'],
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'Aiqi Li', url: SITE_URL }],
  creator: 'Aiqi Li',
  alternates: { canonical: '/' },
  icons: { icon: '/logo-text.svg' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}

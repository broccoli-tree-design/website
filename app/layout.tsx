import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Work_Sans, Montserrat_Alternates } from 'next/font/google'
import './globals.css'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from './site'

const serif = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--serif',
  axes: ['opsz'],
  style: ['normal', 'italic'],
})

const sans = Work_Sans({
  subsets: ['latin'],
  variable: '--sans',
  weight: ['400', '500', '600'],
})

const display = Montserrat_Alternates({
  subsets: ['latin'],
  variable: '--display',
  weight: ['600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'Aiqi Li', url: SITE_URL }],
  creator: 'Aiqi Li',
  alternates: { canonical: '/' },
  icons: { icon: '/logo-text.svg', apple: '/apple-icon.png' },
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

export const viewport: Viewport = {
  themeColor: '#173f35', // --green-800; meta tags can't read CSS variables
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}

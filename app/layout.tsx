import type { Metadata } from 'next'
import { Source_Serif_4, Work_Sans, Montserrat_Alternates } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  title: 'Aiqi Li — UX for Legal Tech',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}

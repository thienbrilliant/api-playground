import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'API Playground',
  description: 'A focused browser-native HTTP client for building requests and inspecting responses.',
  applicationName: 'API Playground',
  metadataBase: new URL('https://api-playground.vercel.app'),
  openGraph: {
    title: 'API Playground',
    description: 'Build requests, inspect responses, and debug HTTP APIs directly in your browser.',
    type: 'website'
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className={`${inter.variable} ${mono.variable}`}>{children}</body></html>
}

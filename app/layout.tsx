import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'API Playground',
  description: 'A focused browser-native HTTP client for building requests and inspecting responses.',
  applicationName: 'API Playground',
  openGraph: {
    title: 'API Playground',
    description: 'Build requests, inspect responses, and debug HTTP APIs directly in your browser.',
    type: 'website'
  }
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>
}

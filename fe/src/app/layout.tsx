import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'e-SIH'} | Portal INL`,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Sistem Informasi Highlight & Laporan Aktivitas',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/esih-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/esih-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  )
}

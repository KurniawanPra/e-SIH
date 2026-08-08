import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Aplikasi Internal'} | Portal INL`,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION
    || 'Aplikasi internal terintegrasi Portal INL',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './globals.css'

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Aplikasi Internal'} | Portal INL`,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION
    || 'Aplikasi internal terintegrasi Portal INL',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}

'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalPortalProps {
  children: ReactNode
}

let openPortals = 0
let previousOverflow = ''

export default function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (openPortals++ === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    return () => {
      if (--openPortals === 0) document.body.style.overflow = previousOverflow
    }
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}

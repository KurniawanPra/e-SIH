'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void
    error: (message: string, title?: string, duration?: number) => void
    warning: (message: string, title?: string, duration?: number) => void
    info: (message: string, title?: string, duration?: number) => void
  }
  showToast: (item: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type, title, message, duration = 3500 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const newItem: ToastItem = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newItem])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const toast = {
    success: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'success', title: title || 'Berhasil', message, duration }),
    error: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'error', title: title || 'Gagal', message, duration }),
    warning: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'warning', title: title || 'Peringatan', message, duration }),
    info: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'info', title: title || 'Informasi', message, duration }),
  }

  return (
    <ToastContext.Provider value={{ toast, showToast, removeToast }}>
      {children}

      {/* Top-Right Toast Container */}
      <div
        aria-live="assertive"
        className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              t.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400/20'
                : t.type === 'error'
                ? 'bg-red-50/95 border-red-300 text-red-950 ring-1 ring-red-400/20'
                : t.type === 'warning'
                ? 'bg-amber-50/95 border-amber-300 text-amber-950 ring-1 ring-amber-400/20'
                : 'bg-sky-50/95 border-sky-300 text-sky-950 ring-1 ring-sky-400/20'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="text-emerald-700" size={18} />}
              {t.type === 'error' && <XCircle className="text-red-700" size={18} />}
              {t.type === 'warning' && <AlertTriangle className="text-amber-700" size={18} />}
              {t.type === 'info' && <Info className="text-sky-700" size={18} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-xs font-bold leading-tight text-slate-900 mb-0.5">
                  {t.title}
                </h4>
              )}
              <p className="text-xs font-medium text-slate-700 leading-relaxed break-words">
                {t.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
              title="Tutup Notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface YearContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  availableYears: number[]
}

const YearContext = createContext<YearContextType>({
  selectedYear: new Date().getFullYear(),
  setSelectedYear: () => {},
  availableYears: [2024, 2025, 2026, 2027],
})

export function YearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const saved = localStorage.getItem('esih_selected_year')
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (parsed >= 1900 && parsed <= 9999) setSelectedYearState(parsed)
    }
  }, [])

  const setSelectedYear = (year: number) => {
    setSelectedYearState(year)
    localStorage.setItem('esih_selected_year', year.toString())
  }

  const availableYears = Array.from(new Set([...Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i), selectedYear])).sort((a, b) => a - b)

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}

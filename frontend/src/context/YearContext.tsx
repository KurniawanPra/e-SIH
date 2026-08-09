'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface YearContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  availableYears: number[]
}

const YearContext = createContext<YearContextType>({
  selectedYear: 2026,
  setSelectedYear: () => {},
  availableYears: [2024, 2025, 2026, 2027],
})

export function YearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<number>(2026)

  useEffect(() => {
    const saved = localStorage.getItem('esih_selected_year')
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed)) setSelectedYearState(parsed)
    }
  }, [])

  const setSelectedYear = (year: number) => {
    setSelectedYearState(year)
    localStorage.setItem('esih_selected_year', year.toString())
  }

  const availableYears = [2024, 2025, 2026, 2027]

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}

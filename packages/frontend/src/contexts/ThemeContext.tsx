'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedMode = localStorage.getItem('flowxchange-theme-mode') as ThemeMode
    if (savedMode) {
      setModeState(savedMode)
    } else {
      setModeState('light')
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false

      if (mode === 'dark') {
        shouldBeDark = true
      } else if (mode === 'auto') {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      setIsDark(shouldBeDark)
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    updateTheme()

    // Listen for system theme changes when in auto mode
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => updateTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [mode])

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem('flowxchange-theme-mode', newMode)
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Segment } from './api/types'
import { customerQuery } from './features/dashboard/queries'

export function useAppPreferences() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.dataset.theme as 'light' | 'dark')
  const [segmentOverride, setSegmentOverride] = useState<Segment | undefined>(() => document.documentElement.dataset.segmentOverride as Segment | undefined)
  const { data } = useQuery(customerQuery)
  const segment = segmentOverride ?? data?.customer.segment ?? 'retail'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.segment = segment
  }, [theme, segment])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    try { localStorage.setItem('meridian:theme:v1', next) } catch { /* Keep the in-memory choice. */ }
  }
  const setSegment = (next: Segment) => {
    setSegmentOverride(next)
    try { localStorage.setItem('meridian:segment:v1', next) } catch { /* Keep the in-memory choice. */ }
  }
  return { theme, segment, toggleTheme, setSegment, customer: data?.customer }
}

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Segment } from './api/types'
import { customerQuery } from './features/dashboard/queries'

export function useAppPreferences() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [segmentOverride, setSegmentOverride] = useState<Segment>()
  const { data } = useQuery(customerQuery)
  const segment = segmentOverride ?? data?.customer.segment ?? 'retail'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.segment = segment
    return () => {
      delete document.documentElement.dataset.theme
      delete document.documentElement.dataset.segment
    }
  }, [theme, segment])

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light')
  return { theme, segment, toggleTheme, setSegment: setSegmentOverride, customer: data?.customer }
}

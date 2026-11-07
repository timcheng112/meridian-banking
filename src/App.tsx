import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Segment } from './api/types'
import { Header } from './components/layout/Header'
import { SegmentSwitch } from './components/layout/SegmentSwitch'
import { Dashboard } from './features/dashboard/Dashboard'
import { customerQuery } from './features/dashboard/queries'

export default function App() {
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

  return (
    <>
      <Header theme={theme} segment={segment} onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} onSegmentChange={setSegmentOverride} />
      <main id="main-content" className="dashboard">
        <Dashboard mobilePreferences={<SegmentSwitch segment={segment} onChange={setSegmentOverride} />} />
      </main>
    </>
  )
}

import type { Segment } from './api/types'
import { Header } from './components/layout/Header'
import { HeaderControls } from './components/layout/HeaderControls'
import { SegmentSwitch } from './components/layout/SegmentSwitch'
import { Dashboard } from './features/dashboard/Dashboard'
import { useAppPreferences } from './useAppPreferences'

const brand = { mark: 'M', name: 'Meridian' }
const navigation = [
  { label: 'Overview', href: '#main-content', current: true },
  { label: 'Cards' },
  { label: 'Payments' },
  { label: 'Insights' },
]
const segmentOptions: ReadonlyArray<{ value: Segment; label: string }> = [
  { value: 'retail', label: 'Retail' },
  { value: 'premium', label: 'Premium' },
]

export default function App() {
  const { theme, segment, toggleTheme, setSegment, customer } = useAppPreferences()
  const headerCustomer = {
    name: customer ? `${customer.firstName} ${customer.lastName}` : 'Customer',
    initials: customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}` : '',
  }

  return (
    <>
      <Header
        brand={brand}
        navigation={navigation}
        customer={headerCustomer}
        controls={
          <HeaderControls
            segmentOptions={segmentOptions}
            segment={segment}
            theme={theme}
            onSegmentChange={setSegment}
            onThemeToggle={toggleTheme}
          />
        }
      />
      <main id="main-content" className="dashboard">
        <Dashboard mobilePreferences={<SegmentSwitch options={segmentOptions} segment={segment} onChange={setSegment} />} />
      </main>
    </>
  )
}

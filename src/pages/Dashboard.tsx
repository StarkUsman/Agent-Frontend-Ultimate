import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsRow from '../components/dashboard/StatsRow'
import LiveCallsSection from '../components/dashboard/LiveCallsSection'
import AgentsGrid from '../components/dashboard/AgentsGrid'

const Dashboard = () => {
  const navigate = useNavigate()

  // Guard: redirect unauthenticated users to login
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Left: fixed sidebar */}
      <Sidebar />

      {/* Right: scrollable main content */}
      <main className="flex-1 overflow-y-auto">

        {/* Step 2 ✓ */}
        <DashboardHeader />

        {/* Steps 3–7 will stack here inside this padding wrapper */}
        <div className="px-8 pb-8 space-y-8">

          {/* Step 3 ✓ */}
          <StatsRow />

          {/* Step 4 ✓ */}
          <LiveCallsSection />

          {/* Step 5 ✓ */}
          <AgentsGrid />

        </div>
      </main>

    </div>
  )
}

export default Dashboard

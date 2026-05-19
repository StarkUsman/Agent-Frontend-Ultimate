import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'

const Dashboard = () => {
  const navigate = useNavigate()

  // Guard: send unauthenticated users back to login
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

        {/* ── Steps 2–7 will be added here one by one ── */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-300">Dashboard shell ready</p>
            <p className="text-sm text-slate-400 mt-1">Step 2 will add the header →</p>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Dashboard

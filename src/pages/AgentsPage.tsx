import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdOutlineWarningAmber, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import AgentTableRow, { type AgentRowData } from '../components/agents/AgentTableRow'

// ── Mock data (12 rows — 2 pages of 6) ────────────────────────────────────
const AGENTS: AgentRowData[] = [
  {
    id: 1,
    name: 'Customer support',
    description: 'Helps callers with billing questions and account issues',
    voice: { initial: 'C', name: 'Clara', color: '#6366f1' },
    calls: 584, avgTtfb: '720ms', interruptions: '9%',
    flow: { nodes: 4 }, status: 'Active',
  },
  {
    id: 2,
    name: 'Sales assistant',
    description: 'Qualifies new leads before connecting to a sales rep',
    voice: { initial: 'J', name: 'James', color: '#64748b' },
    calls: 312, avgTtfb: '840ms', interruptions: '14%',
    flow: { nodes: 6 }, status: 'Active',
  },
  {
    id: 3,
    name: 'Appointment booking',
    description: 'Books and reschedules appointments automatically',
    voice: { initial: 'S', name: 'Sophie', color: '#0891b2' },
    calls: 241, avgTtfb: '680ms', interruptions: '6%',
    flow: { nodes: 5 }, status: 'Active',
  },
  {
    id: 4,
    name: 'IT helpdesk',
    description: 'Handles common IT questions and password resets',
    voice: { initial: 'M', name: 'Marcus', color: '#475569' },
    calls: 147, avgTtfb: '410ms', interruptions: '11%',
    flow: { nodes: 3 }, status: 'Inactive',
  },
  {
    id: 5,
    name: 'Complaint handler',
    description: 'Manages escalated complaints with empathy',
    voice: { initial: 'A', name: 'Aria', color: '#8b5cf6' },
    calls: 63, avgTtfb: null, interruptions: null,
    flow: null, status: 'Inactive',
  },
  {
    id: 6,
    name: 'Post-call survey',
    description: 'Collects customer satisfaction scores after each call',
    voice: { initial: 'E', name: 'Emma', color: '#0284c7' },
    calls: 208, avgTtfb: '750ms', interruptions: '3%',
    flow: { nodes: 2 }, status: 'Active',
  },
  {
    id: 7,
    name: 'Onboarding guide',
    description: 'Walks new customers through product setup step by step',
    voice: { initial: 'L', name: 'Lily', color: '#0d9488' },
    calls: 95, avgTtfb: '610ms', interruptions: '4%',
    flow: { nodes: 7 }, status: 'Active',
  },
  {
    id: 8,
    name: 'Billing support',
    description: 'Resolves invoice disputes and payment failures',
    voice: { initial: 'R', name: 'Ryan', color: '#b45309' },
    calls: 178, avgTtfb: '730ms', interruptions: '8%',
    flow: { nodes: 4 }, status: 'Active',
  },
  {
    id: 9,
    name: 'Technical support',
    description: 'Diagnoses and resolves product technical issues',
    voice: { initial: 'N', name: 'Nova', color: '#7c3aed' },
    calls: 224, avgTtfb: '790ms', interruptions: '10%',
    flow: { nodes: 6 }, status: 'Active',
  },
  {
    id: 10,
    name: 'Lead qualifier',
    description: 'Scores inbound leads before routing to sales team',
    voice: { initial: 'D', name: 'Dan', color: '#0369a1' },
    calls: 410, avgTtfb: '660ms', interruptions: '5%',
    flow: { nodes: 3 }, status: 'Active',
  },
  {
    id: 11,
    name: 'Return handler',
    description: 'Processes product return and refund requests',
    voice: { initial: 'Z', name: 'Zara', color: '#be185d' },
    calls: 89, avgTtfb: null, interruptions: null,
    flow: null, status: 'Inactive',
  },
  {
    id: 12,
    name: 'Renewal reminder',
    description: 'Reminds customers of upcoming subscription renewals',
    voice: { initial: 'O', name: 'Oscar', color: '#15803d' },
    calls: 301, avgTtfb: '540ms', interruptions: '2%',
    flow: { nodes: 5 }, status: 'Active',
  },
    {
    id: 13,
    name: 'Return handler',
    description: 'Processes product return and refund requests',
    voice: { initial: 'Z', name: 'Zara', color: '#be185d' },
    calls: 89, avgTtfb: null, interruptions: null,
    flow: null, status: 'Inactive',
  },
  {
    id: 14,
    name: 'Renewal reminder',
    description: 'Reminds customers of upcoming subscription renewals',
    voice: { initial: 'O', name: 'Oscar', color: '#15803d' },
    calls: 301, avgTtfb: '540ms', interruptions: '2%',
    flow: { nodes: 5 }, status: 'Active',
  },
]

// ── Config ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6

const COLUMNS = [
  { label: 'Agent name',        width: 'w-[35%]' },
  { label: 'Voice',             width: 'w-[12%]' },
  { label: 'Calls',             width: 'w-[8%]'  },
  { label: 'Avg TTFB',          width: 'w-[10%]' },
  { label: 'Interruptions',     width: 'w-[10%]' },
  { label: 'Conversation flow', width: 'w-[15%]' },
  { label: 'Status',            width: 'w-[10%]' },
]

// ── Page ───────────────────────────────────────────────────────────────────
const AgentsPage = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  const totalPages  = Math.ceil(AGENTS.length / ITEMS_PER_PAGE)
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated   = AGENTS.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const startItem   = startIndex + 1
  const endItem     = Math.min(startIndex + ITEMS_PER_PAGE, AGENTS.length)

  // Warning counts from ALL agents (not just current page)
  const noFlowCount = AGENTS.filter((a) => a.flow === null).length

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Sticky top bar ── */}
        <div className="flex items-center justify-between px-8 pt-5 pb-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My agents</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage and configure your voice agents.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ backgroundColor: '#6366f1' }}
          >
            <MdAdd className="text-lg" />
            Create agent
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            <table className="w-full">
              {/* Sticky column headers */}
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      className={`${col.width} py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-6 last:pr-6 px-4`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginated.map((agent) => (
                  <AgentTableRow key={agent.id} {...agent} />
                ))}
              </tbody>
            </table>

            {/* Warning banner */}
            {noFlowCount > 0 && (
              <div className="flex items-center gap-3 mx-6 mt-2 mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <MdOutlineWarningAmber className="text-amber-500 text-lg shrink-0" />
                <p className="text-sm text-slate-600">
                  {noFlowCount} agent{noFlowCount > 1 ? 's have' : ' has'} no conversation flow
                  and cannot handle calls.{' '}
                  <a href="#" className="font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-700">
                    Add a flow →
                  </a>
                </p>
              </div>
            )}

            {/* ── Pagination bar ── */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">

              {/* Info */}
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{startItem}–{endItem}</span> of{' '}
                <span className="font-semibold text-slate-600">{AGENTS.length}</span> agents
              </p>

              {/* Controls */}
              <div className="flex items-center gap-1">

                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === currentPage
                        ? 'text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    style={page === currentPage ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronRight className="text-lg" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default AgentsPage

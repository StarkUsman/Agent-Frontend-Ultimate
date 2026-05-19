import { TbGitFork } from 'react-icons/tb'
import { MdOutlineWarningAmber } from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
export interface AgentRowData {
  id: number
  name: string
  description: string
  voice: { initial: string; name: string; color: string }
  calls: number
  avgTtfb: string | null       // null = no data yet ("—")
  interruptions: string | null // null = no data yet ("—")
  flow: { nodes: number } | null // null = no flow configured
  status: 'Active' | 'Inactive'
}

// ── Sub-components ─────────────────────────────────────────────────────────
const VoiceCell = ({ initial, name, color }: AgentRowData['voice']) => (
  <div className="flex items-center gap-2">
    <span
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
    <span className="text-sm text-slate-600">{name}</span>
  </div>
)

const FlowCell = ({ flow }: { flow: AgentRowData['flow'] }) => {
  if (flow) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium whitespace-nowrap">
        <TbGitFork className="text-sm" />
        {flow.nodes} nodes · <span className="underline cursor-pointer">edit</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium whitespace-nowrap">
      <MdOutlineWarningAmber className="text-sm" />
      No flow — add one
    </span>
  )
}

const StatusBadge = ({ status }: { status: AgentRowData['status'] }) => {
  const isActive = status === 'Active'
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        isActive
          ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
          : 'border-slate-200 text-slate-400 bg-white'
      }`}
    >
      {status}
    </span>
  )
}

// ── Row component ──────────────────────────────────────────────────────────
const AgentTableRow = ({
  name,
  description,
  voice,
  calls,
  avgTtfb,
  interruptions,
  flow,
  status,
}: AgentRowData) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">

      {/* Agent name + description */}
      <td className="py-4 pl-6 pr-4">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </td>

      {/* Voice */}
      <td className="py-4 px-4">
        <VoiceCell {...voice} />
      </td>

      {/* Calls */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700">
          {calls.toLocaleString()}
        </span>
      </td>

      {/* Avg TTFB */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700">
          {avgTtfb ?? '—'}
        </span>
      </td>

      {/* Interruptions */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700">
          {interruptions ?? '—'}
        </span>
      </td>

      {/* Conversation flow */}
      <td className="py-4 px-4">
        <FlowCell flow={flow} />
      </td>

      {/* Status */}
      <td className="py-4 pl-4 pr-6">
        <StatusBadge status={status} />
      </td>

    </tr>
  )
}

export default AgentTableRow

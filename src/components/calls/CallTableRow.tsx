// ── Types ──────────────────────────────────────────────────────────────────
export type CallResult = 'Completed' | 'Escalated' | 'On a call' | 'Failed'

export interface CallRecord {
  id: string
  topic: string
  agent: string
  platform: string
  result: CallResult
  duration: string | null // null = still active ("—")
  time: string
}

// ── Result cell — each status has its own colour treatment ────────────────
const ResultCell = ({ result }: { result: CallResult }) => {
  if (result === 'On a call') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-600">
        On a call
      </span>
    )
  }

  const style: Record<Exclude<CallResult, 'On a call'>, string> = {
    Completed: 'text-emerald-600',
    Escalated:  'text-amber-500',
    Failed:     'text-red-500',
  }

  return (
    <span className={`text-sm font-semibold ${style[result as keyof typeof style]}`}>
      {result}
    </span>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────
const CallTableRow = ({
  id,
  topic,
  agent,
  platform,
  result,
  duration,
  time,
}: CallRecord) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">

      {/* Call ID */}
      <td className="py-4 pl-6 pr-4">
        <span className="text-xs font-mono font-medium text-slate-400">{id}</span>
      </td>

      {/* Topic / Agent */}
      <td className="py-4 px-4">
        <p className="text-sm font-semibold text-slate-900">{topic}</p>
        <p className="text-xs text-slate-400 mt-0.5">{agent}</p>
      </td>

      {/* Platform */}
      <td className="py-4 px-4">
        <span className="text-sm text-slate-500">{platform}</span>
      </td>

      {/* Result */}
      <td className="py-4 px-4">
        <ResultCell result={result} />
      </td>

      {/* Duration */}
      <td className="py-4 px-4">
        <span className="text-sm text-slate-600">{duration ?? '—'}</span>
      </td>

      {/* Time */}
      <td className="py-4 pl-4 pr-6">
        <span className="text-sm text-slate-400">{time}</span>
      </td>

    </tr>
  )
}

export default CallTableRow

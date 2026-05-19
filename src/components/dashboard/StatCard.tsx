// ── Types ──────────────────────────────────────────────────────────────────
export interface StatCardProps {
  label: string
  value: string
  sub: string
  subType: 'positive' | 'neutral' | 'indigo'
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

// ── Component ──────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  subType,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl px-4 py-3.5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">

      {/* Top row: label + icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="text-sm" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-slate-900 leading-none mb-1">
        {value}
      </p>

      {/* Sub text */}
      <p
        className={`text-xs font-medium ${
          subType === 'positive' ? 'text-emerald-500'
          : subType === 'indigo'   ? 'text-indigo-500'
          : 'text-slate-400'
        }`}
      >
        {sub}
      </p>

    </div>
  )
}

export default StatCard

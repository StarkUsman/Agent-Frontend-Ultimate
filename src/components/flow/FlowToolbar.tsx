import { useNavigate } from 'react-router-dom'
import {
  MdOutlinePets,
  MdArrowBack,
  MdOutlineNoteAdd,
  MdOutlineUndo,
  MdOutlineRedo,
  MdOutlineUpload,
  MdOutlineDownload,
  MdOutlinePlayCircle,
  MdOutlineMoreHoriz,
} from 'react-icons/md'
import { TbLayoutGridAdd } from 'react-icons/tb'

// ── Types ──────────────────────────────────────────────────────────────────
export interface FlowToolbarProps {
  agentName: string
  canUndo?: boolean
  canRedo?: boolean
  onNewFlow?:      () => void
  onUndo?:         () => void
  onRedo?:         () => void
  onImport?:       () => void
  onExport?:       () => void
  onLoadExample?:  () => void
}

// ── Small reusable toolbar button ──────────────────────────────────────────
interface ToolbarBtnProps {
  icon: React.ElementType
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary'
}

const ToolbarBtn = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
}: ToolbarBtnProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
      transition-all cursor-pointer select-none
      disabled:opacity-40 disabled:cursor-not-allowed
      ${variant === 'primary'
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
      }
    `}
  >
    <Icon className="text-base shrink-0" />
    {label}
  </button>
)

// ── Vertical divider between button groups ─────────────────────────────────
const Divider = () => (
  <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
)

// ── Toolbar ────────────────────────────────────────────────────────────────
const FlowToolbar = ({
  agentName,
  canUndo  = false,
  canRedo  = false,
  onNewFlow,
  onUndo,
  onRedo,
  onImport,
  onExport,
  onLoadExample,
}: FlowToolbarProps) => {
  const navigate = useNavigate()

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 pr-4 border-r border-slate-200 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#6366f1' }}
        >
          <MdOutlinePets className="text-white text-sm" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-slate-800 tracking-tight">PipCat Studio</p>
          <p className="text-[10px] text-slate-400">Voice AI Platform</p>
        </div>
      </div>

      {/* ── Breadcrumb: Flow editor · Agent name ── */}
      <div className="flex items-center gap-1.5 pr-4 border-r border-slate-200 shrink-0">
        <span className="text-xs text-slate-400">Flow editor</span>
        <span className="text-slate-300 text-xs">·</span>
        <span className="text-xs font-semibold text-slate-700 max-w-[140px] truncate">
          {agentName}
        </span>
      </div>

      {/* ── Button group 1: New Flow ── */}
      <ToolbarBtn
        icon={MdOutlineNoteAdd}
        label="New Flow"
        variant="primary"
        onClick={onNewFlow}
      />

      <Divider />

      {/* ── Button group 2: Undo / Redo ── */}
      <ToolbarBtn
        icon={MdOutlineUndo}
        label="Undo"
        disabled={!canUndo}
        onClick={onUndo}
      />
      <ToolbarBtn
        icon={MdOutlineRedo}
        label="Redo"
        disabled={!canRedo}
        onClick={onRedo}
      />

      <Divider />

      {/* ── Button group 3: Import / Export ── */}
      <ToolbarBtn icon={MdOutlineUpload}   label="Import" onClick={onImport} />
      <ToolbarBtn icon={MdOutlineDownload} label="Export" onClick={onExport} />

      <Divider />

      {/* ── Button group 4: Load Example ── */}
      <ToolbarBtn
        icon={TbLayoutGridAdd}
        label="Load Example"
        onClick={onLoadExample}
      />

      {/* ── More (overflow menu placeholder) ── */}
      <ToolbarBtn icon={MdOutlineMoreHoriz} label="More" />

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right: Preview + Back ── */}
      <ToolbarBtn icon={MdOutlinePlayCircle} label="Preview" />

      <Divider />

      <button
        onClick={() => navigate('/agents')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <MdArrowBack className="text-base" />
        Agents
      </button>

    </div>
  )
}

export default FlowToolbar

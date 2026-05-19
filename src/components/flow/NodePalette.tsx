import { MdPlayArrow, MdOutlineCircle, MdOutlineStopCircle, MdDragIndicator } from 'react-icons/md'

// ── Palette node definitions ───────────────────────────────────────────────
// Exported so FlowCanvas can register the same types
export interface PaletteNodeDef {
  type: string
  label: string
  description: string
  icon: React.ElementType
  accentColor: string
  iconBg: string
}

export const PALETTE_NODES: PaletteNodeDef[] = [
  {
    type: 'initial',
    label: 'Initial',
    description: 'Entry point of your flow',
    icon: MdPlayArrow,
    accentColor: '#6366f1',
    iconBg: '#ede9fe',
  },
  {
    type: 'step',
    label: 'Node',
    description: 'A conversation step',
    icon: MdOutlineCircle,
    accentColor: '#64748b',
    iconBg: '#f1f5f9',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Terminates the flow',
    icon: MdOutlineStopCircle,
    accentColor: '#ef4444',
    iconBg: '#fef2f2',
  },
]

// ── Single draggable palette item ──────────────────────────────────────────
interface PaletteItemProps {
  node: PaletteNodeDef
}

const PaletteItem = ({ node }: PaletteItemProps) => {
  const { type, label, description, icon: Icon, accentColor, iconBg } = node

  // On drag start: store the node type in dataTransfer
  // FlowCanvas reads this in its onDrop handler (Step 5)
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow/type', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex items-center gap-3 px-3 py-3 mx-2 rounded-xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing active:scale-95 active:shadow-md"
    >
      {/* Coloured icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="text-base" style={{ color: accentColor }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 leading-none mb-0.5">
          {label}
        </p>
        <p className="text-[10px] text-slate-400 truncate">{description}</p>
      </div>

      {/* Drag handle hint — shows on hover */}
      <MdDragIndicator className="text-slate-300 group-hover:text-slate-400 text-base shrink-0 transition-colors" />
    </div>
  )
}

// ── Palette ────────────────────────────────────────────────────────────────
const NodePalette = () => {
  return (
    <aside className="w-52 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Nodes
        </p>
      </div>

      {/* Draggable node list */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {PALETTE_NODES.map((node) => (
          <PaletteItem key={node.type} node={node} />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <p className="text-[10px] text-slate-400 leading-relaxed text-center">
          Drag a node onto<br />the canvas to add it
        </p>
      </div>

    </aside>
  )
}

export default NodePalette

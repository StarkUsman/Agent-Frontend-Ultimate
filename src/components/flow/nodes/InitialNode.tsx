import { useState, useRef } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { MdPlayArrow } from 'react-icons/md'

// ── Shared handle style — imported by StepNode and EndNode too ─────────────
export const handleStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#ffffff',
  border: '2px solid #94a3b8',
}

// ── Inline editable label ──────────────────────────────────────────────────
interface EditableLabelProps {
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
  className?: string
  placeholder?: string
}

export const EditableLabel = ({
  value,
  onChange,
  onCommit,
  onCancel,
  className = '',
  placeholder = 'Label...',
}: EditableLabelProps) => (
  <input
    autoFocus
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    // Stop React Flow from treating clicks inside the input as drag starts
    onMouseDown={(e) => e.stopPropagation()}
    onBlur={onCommit}
    onKeyDown={(e) => {
      if (e.key === 'Enter') { e.preventDefault(); onCommit() }
      if (e.key === 'Escape') { e.preventDefault(); onCancel() }
    }}
    className={`bg-transparent border-none outline-none w-full ${className}`}
  />
)

// ── InitialNode ────────────────────────────────────────────────────────────
const InitialNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow()
  const originalLabel = useRef((data?.label as string) ?? 'Initial')
  const [draft, setDraft]       = useState(originalLabel.current)
  const [isEditing, setIsEditing] = useState(false)

  const startEdit = () => {
    originalLabel.current = (data?.label as string) ?? 'Initial'
    setDraft(originalLabel.current)
    setIsEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim() || originalLabel.current
    setDraft(trimmed)
    updateNodeData(id, { label: trimmed })
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(originalLabel.current)
    setIsEditing(false)
  }

  return (
    <div
      className={`
        min-w-25 bg-white rounded px-2 py-1
        border-2 shadow-sm transition-all
        ${selected
          ? 'border-indigo-500 shadow-indigo-100 shadow-md'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
      `}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
          <MdPlayArrow className="text-indigo-600 text-xs" />
        </div>

        {isEditing ? (
          <EditableLabel
            value={draft}
            onChange={setDraft}
            onCommit={commit}
            onCancel={cancel}
            className="text-xs font-semibold text-slate-800"
            placeholder="Node label..."
          />
        ) : (
          <span
            onDoubleClick={startEdit}
            title="Double-click to rename"
            className="text-xs font-semibold text-slate-800 cursor-text select-none"
          >
            {(data?.label as string) ?? 'Initial'}
          </span>
        )}
      </div>

      <p className="text-[8px] text-slate-400 mt-0.25 ml-6">initial</p>

      {/* No target handle — nothing flows INTO the start node */}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export default InitialNode

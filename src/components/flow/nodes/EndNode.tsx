import { useState, useRef } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { MdOutlineStopCircle } from 'react-icons/md'
import { handleStyle, EditableLabel } from './InitialNode'

// ── EndNode ────────────────────────────────────────────────────────────────
// Terminal node — only has a target handle (flow stops here).
const EndNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow()
  const originalLabel      = useRef((data?.label as string) ?? 'End')
  const [draft, setDraft]         = useState(originalLabel.current)
  const [isEditing, setIsEditing] = useState(false)

  const startEdit = () => {
    originalLabel.current = (data?.label as string) ?? 'End'
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
        min-w-32 bg-white rounded-lg px-3 py-2
        border-2 shadow-sm transition-all
        ${selected
          ? 'border-red-400 shadow-red-100 shadow-md'
          : 'border-slate-200 hover:border-red-300 hover:shadow-md'}
      `}
    >
      {/* In-handle — flow arrives here */}
      <Handle type="target" position={Position.Top} style={handleStyle} />

      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-red-50 flex items-center justify-center shrink-0">
          <MdOutlineStopCircle className="text-red-500 text-xs" />
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
            {(data?.label as string) ?? 'End'}
          </span>
        )}
      </div>

      <p className="text-[9px] text-slate-400 mt-0.5 ml-6.5">end</p>

      {/* No source handle — nothing flows OUT of the end node */}
    </div>
  )
}

export default EndNode

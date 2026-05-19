import { useState, useRef } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { MdOutlineCircle } from 'react-icons/md'
import { handleStyle, EditableLabel } from './InitialNode'

// ── StepNode ───────────────────────────────────────────────────────────────
// Mid-flow conversation step — has both target and source handles.
// Both the label and instructions textarea are editable inline.
const StepNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow()

  // ── Label editing ────────────────────────────────────────────────────
  const originalLabel      = useRef((data?.label as string) ?? 'Node')
  const [labelDraft, setLabelDraft]         = useState(originalLabel.current)
  const [isEditingLabel, setIsEditingLabel] = useState(false)

  const startLabelEdit = () => {
    originalLabel.current = (data?.label as string) ?? 'Node'
    setLabelDraft(originalLabel.current)
    setIsEditingLabel(true)
  }
  const commitLabel = () => {
    const trimmed = labelDraft.trim() || originalLabel.current
    setLabelDraft(trimmed)
    updateNodeData(id, { label: trimmed })
    setIsEditingLabel(false)
  }
  const cancelLabel = () => {
    setLabelDraft(originalLabel.current)
    setIsEditingLabel(false)
  }

  // ── Instructions editing ─────────────────────────────────────────────
  const originalInstructions      = useRef((data?.instructions as string) ?? '')
  const [instrDraft, setInstrDraft]              = useState(originalInstructions.current)
  const [isEditingInstr, setIsEditingInstr] = useState(false)

  const startInstrEdit = () => {
    originalInstructions.current = (data?.instructions as string) ?? ''
    setInstrDraft(originalInstructions.current)
    setIsEditingInstr(true)
  }
  const commitInstr = () => {
    updateNodeData(id, { instructions: instrDraft })
    setIsEditingInstr(false)
  }
  const cancelInstr = () => {
    setInstrDraft(originalInstructions.current)
    setIsEditingInstr(false)
  }

  const instructions = (data?.instructions as string) ?? ''

  return (
    <div
      className={`
        min-w-44 bg-white rounded-xl border-2 shadow-sm transition-all
        ${selected
          ? 'border-indigo-500 shadow-indigo-100 shadow-md'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
      `}
    >
      {/* In-handle — flow arrives here */}
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* ── Header: icon + editable label ── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
          <MdOutlineCircle className="text-slate-500 text-sm" />
        </div>

        {isEditingLabel ? (
          <EditableLabel
            value={labelDraft}
            onChange={setLabelDraft}
            onCommit={commitLabel}
            onCancel={cancelLabel}
            className="text-sm font-semibold text-slate-800"
            placeholder="Step name..."
          />
        ) : (
          <span
            onDoubleClick={startLabelEdit}
            title="Double-click to rename"
            className="text-sm font-semibold text-slate-800 cursor-text select-none"
          >
            {(data?.label as string) ?? 'Node'}
          </span>
        )}
      </div>

      {/* ── Body: editable instructions ── */}
      <div
        className="px-4 py-2.5 cursor-text"
        onDoubleClick={() => !isEditingInstr && startInstrEdit()}
      >
        {isEditingInstr ? (
          <textarea
            autoFocus
            value={instrDraft}
            onChange={(e) => setInstrDraft(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onBlur={commitInstr}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); cancelInstr() }
              // Shift+Enter adds newline; plain Enter commits
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitInstr() }
            }}
            placeholder="Enter instructions... (Enter to save, Shift+Enter for newline)"
            rows={3}
            className="w-full text-[11px] text-slate-600 leading-relaxed resize-none bg-transparent border-none outline-none placeholder-slate-300"
          />
        ) : instructions ? (
          <p
            className="text-[11px] text-slate-500 leading-relaxed line-clamp-3"
            title="Double-click to edit"
          >
            {instructions}
          </p>
        ) : (
          <p className="text-[11px] text-slate-300 italic" title="Double-click to add instructions">
            Double-click to add instructions...
          </p>
        )}
      </div>

      <p className="text-[10px] text-slate-400 px-4 pb-2.5">node</p>

      {/* Out-handle — flow exits here */}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export default StepNode

import { useState } from 'react'
import { type Node } from '@xyflow/react'
import { MdAdd, MdOutlineDeleteOutline, MdKeyboardArrowDown } from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
type ActionType = 'function' | 'end_conversation' | 'tts_say'

export interface Action {
  id: string
  type: ActionType
  handler: string  // function name for 'function', speech text for 'tts_say'
}

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'function',         label: 'Function'         },
  { value: 'end_conversation', label: 'End Conversation' },
  { value: 'tts_say',         label: 'TTS Say'          },
]

// ── Single action card ─────────────────────────────────────────────────────
const ActionCard = ({
  action,
  onChange,
  onDelete,
}: {
  action: Action
  onChange: (a: Action) => void
  onDelete: () => void
}) => {
  const showHandler = action.type !== 'end_conversation'
  const handlerPlaceholder =
    action.type === 'function' ? 'Handler' : 'Text to say...'

  return (
    <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-3 bg-white">

      {/* Type dropdown */}
      <div className="relative shrink-0 w-36">
        <select
          value={action.type}
          onChange={(e) =>
            onChange({ ...action, type: e.target.value as ActionType, handler: '' })
          }
          className="w-full appearance-none border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-all pr-7"
        >
          {ACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base" />
      </div>

      {/* Handler / text input */}
      {showHandler ? (
        <input
          value={action.handler}
          onChange={(e) => onChange({ ...action, handler: e.target.value })}
          placeholder={handlerPlaceholder}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 transition-all min-w-0"
        />
      ) : (
        /* End Conversation has no extra input — fill space */
        <div className="flex-1" />
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <MdOutlineDeleteOutline className="text-base" />
      </button>

    </div>
  )
}

// ── Section (Pre or Post) ──────────────────────────────────────────────────
const ActionSection = ({
  title,
  actions,
  onChange,
}: {
  title: string
  actions: Action[]
  onChange: (actions: Action[]) => void
}) => {
  const add = () =>
    onChange([
      ...actions,
      { id: `action-${Date.now()}`, type: 'function', handler: '' },
    ])
  const update = (i: number, updated: Action) => {
    const next = [...actions]; next[i] = updated; onChange(next)
  }
  const remove = (i: number) => onChange(actions.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">{title}</p>
        <button
          onClick={add}
          className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
        >
          <MdAdd className="text-sm" />
          Add
        </button>
      </div>

      {/* Action cards */}
      {actions.length === 0 ? (
        <p className="text-[11px] text-slate-300 italic">
          No actions. Click "Add" to create one.
        </p>
      ) : (
        <div className="space-y-2">
          {actions.map((action, i) => (
            <ActionCard
              key={action.id}
              action={action}
              onChange={(updated) => update(i, updated)}
              onDelete={() => remove(i)}
            />
          ))}
        </div>
      )}

    </div>
  )
}

// ── ActionsTab ─────────────────────────────────────────────────────────────
interface ActionsTabProps {
  node: Node
  onUpdate: (patch: Record<string, unknown>) => void
}

const ActionsTab = ({ node, onUpdate }: ActionsTabProps) => {
  const [preActions,  setPreActions]  = useState<Action[]>(
    (node.data?.pre_actions  as Action[]) ?? []
  )
  const [postActions, setPostActions] = useState<Action[]>(
    (node.data?.post_actions as Action[]) ?? []
  )

  const handlePre  = (actions: Action[]) => {
    setPreActions(actions)
    onUpdate({ pre_actions: actions })
  }
  const handlePost = (actions: Action[]) => {
    setPostActions(actions)
    onUpdate({ post_actions: actions })
  }

  return (
    <div className="p-4 space-y-6">
      <ActionSection title="Pre Actions"  actions={preActions}  onChange={handlePre}  />
      <div className="h-px bg-slate-100" />
      <ActionSection title="Post Actions" actions={postActions} onChange={handlePost} />
    </div>
  )
}

export default ActionsTab

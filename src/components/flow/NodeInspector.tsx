import { useState } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import {
  MdOutlineDeleteOutline,
  MdKeyboardArrowDown,
  MdAdd,
} from 'react-icons/md'
import FunctionsTab from './inspector/FunctionsTab'
import ActionsTab   from './inspector/ActionsTab'

// ── Types ──────────────────────────────────────────────────────────────────
interface InspectorProps {
  node: Node | null
}

type Tab = 'General' | 'Messages' | 'Functions' | 'Actions'
const TABS: Tab[] = ['General', 'Messages', 'Functions', 'Actions']

export interface Msg {
  role: string
  content: string
}

const ROLE_OPTIONS = ['system', 'developer', 'user', 'assistant']

const CONTEXT_STRATEGIES = [
  { value: 'APPEND',  label: 'APPEND (default)' },
  { value: 'PREPEND', label: 'PREPEND' },
  { value: 'RESET',   label: 'RESET' },
]

// ── Shared form field wrapper ──────────────────────────────────────────────
const Field = ({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-600">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 leading-relaxed">{hint}</p>}
  </div>
)

// ── Single message card ────────────────────────────────────────────────────
const MessageCard = ({
  msg,
  onChange,
  onDelete,
}: {
  msg: Msg
  onChange: (updated: Msg) => void
  onDelete: () => void
}) => (
  <div className="border border-slate-200 rounded-xl p-3 space-y-2.5 bg-white">

    {/* Top row: role dropdown + delete */}
    <div className="flex items-center justify-between">
      <div className="relative">
        <select
          value={msg.role}
          onChange={(e) => onChange({ ...msg, role: e.target.value })}
          className="appearance-none text-xs font-medium text-slate-700 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm" />
      </div>

      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Delete message"
      >
        <MdOutlineDeleteOutline className="text-base" />
      </button>
    </div>

    {/* Content textarea */}
    <textarea
      value={msg.content}
      onChange={(e) => onChange({ ...msg, content: e.target.value })}
      rows={3}
      placeholder="Enter message content..."
      className="w-full text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-2 resize-y leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-400 placeholder-slate-300 transition-all"
    />
  </div>
)

// ── Messages section (Role Messages or Task Messages) ──────────────────────
const MessageSection = ({
  title,
  messages,
  onChange,
}: {
  title: string
  messages: Msg[]
  onChange: (msgs: Msg[]) => void
}) => {
  const add    = () => onChange([...messages, { role: 'system', content: '' }])
  const update = (i: number, updated: Msg) => {
    const next = [...messages]; next[i] = updated; onChange(next)
  }
  const remove = (i: number) => onChange(messages.filter((_, idx) => idx !== i))

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

      {/* Message cards */}
      {messages.length === 0 ? (
        <p className="text-[10px] text-slate-300 italic px-1">
          No messages yet — click + Add to create one.
        </p>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <MessageCard
              key={i}
              msg={msg}
              onChange={(updated) => update(i, updated)}
              onDelete={() => remove(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Messages tab ───────────────────────────────────────────────────────────
// key={node.id} on this component resets local state when a new node is selected
const MessagesTab = ({
  node,
  onUpdate,
}: {
  node: Node
  onUpdate: (patch: Record<string, unknown>) => void
}) => {
  const [roleMessages, setRoleMessages] = useState<Msg[]>(
    (node.data?.role_messages as Msg[]) ?? []
  )
  const [taskMessages, setTaskMessages] = useState<Msg[]>(
    (node.data?.task_messages as Msg[]) ?? []
  )

  const handleRoleChange = (msgs: Msg[]) => {
    setRoleMessages(msgs)
    onUpdate({ role_messages: msgs })
  }
  const handleTaskChange = (msgs: Msg[]) => {
    setTaskMessages(msgs)
    onUpdate({ task_messages: msgs })
  }

  return (
    <div className="p-4 space-y-6">
      <MessageSection
        title="Role Messages"
        messages={roleMessages}
        onChange={handleRoleChange}
      />
      <div className="h-px bg-slate-100" />
      <MessageSection
        title="Task Messages"
        messages={taskMessages}
        onChange={handleTaskChange}
      />
    </div>
  )
}

// ── General tab ────────────────────────────────────────────────────────────
const GeneralTab = ({
  node,
  onUpdate,
}: {
  node: Node
  onUpdate: (patch: Record<string, unknown>) => void
}) => {
  const label              = (node.data?.label             as string)  ?? ''
  const instructions       = (node.data?.instructions      as string)  ?? ''
  const respondImmediately = (node.data?.respondImmediately as boolean) ?? true
  const contextStrategy    = (node.data?.contextStrategy   as string)  ?? 'APPEND'

  return (
    <div className="space-y-5 p-4">
      <Field label="Label">
        <input
          defaultValue={label}
          onBlur={(e)    => onUpdate({ label: e.target.value.trim() || label })}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
          placeholder="Node label"
        />
      </Field>

      <Field label="Type">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-xs font-mono text-slate-600">
          {node.type}
        </span>
      </Field>

      {node.type === 'step' && (
        <Field label="Instructions" hint="Tell the AI what to say or do at this step.">
          <textarea
            defaultValue={instructions}
            rows={4}
            onBlur={(e)    => onUpdate({ instructions: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur() }}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            placeholder="e.g. Greet the caller and ask how you can help them today."
          />
        </Field>
      )}

      {node.type !== 'end' && (
        <div className="flex items-start gap-3">
          <input
            id={`ri-${node.id}`}
            type="checkbox"
            defaultChecked={respondImmediately}
            onChange={(e) => onUpdate({ respondImmediately: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
          />
          <div>
            <label htmlFor={`ri-${node.id}`} className="text-sm font-medium text-slate-700 cursor-pointer">
              Respond Immediately
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Speak as soon as this node is entered.
            </p>
          </div>
        </div>
      )}

      {node.type !== 'end' && (
        <Field
          label="Context Strategy"
          hint={contextStrategy === 'APPEND'
            ? 'APPEND is the default. Remove this configuration to use the default.'
            : undefined}
        >
          <div className="relative">
            <select
              defaultValue={contextStrategy}
              onChange={(e) => onUpdate({ contextStrategy: e.target.value })}
              className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-all"
            >
              {CONTEXT_STRATEGIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <MdKeyboardArrowDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </Field>
      )}

      <Field label="Data (JSON)">
        <pre className="w-full px-3 py-2 text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-lg overflow-x-auto leading-relaxed">
          {JSON.stringify(node.data, null, 2)}
        </pre>
      </Field>
    </div>
  )
}


// ── No selection state ─────────────────────────────────────────────────────
const NoSelection = () => (
  <div className="flex-1 flex items-center justify-center p-6">
    <p className="text-xs text-slate-300 text-center leading-relaxed">
      Click a node on the canvas<br />to inspect its properties.
    </p>
  </div>
)

// ── NodeInspector ──────────────────────────────────────────────────────────
const NodeInspector = ({ node }: InspectorProps) => {
  const { updateNodeData, deleteElements } = useReactFlow()
  const [activeTab, setActiveTab] = useState<Tab>('General')

  const handleDelete = () => {
    if (!node) return
    deleteElements({ nodes: [{ id: node.id }] })
  }

  const patch = (data: Record<string, unknown>) => {
    if (node) updateNodeData(node.id, data)
  }

  return (
    <aside className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Inspector{node ? `: ${node.type}` : ''}
        </p>
      </div>

      {node ? (
        <>
          {/* Tabs — segmented pill control */}
          <div className="px-3 py-2.5 border-b border-slate-100 shrink-0">
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 font-semibold shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'General' && (
              <GeneralTab key={node.id} node={node} onUpdate={patch} />
            )}
            {activeTab === 'Messages' && (
              <MessagesTab key={node.id} node={node} onUpdate={patch} />
            )}
            {activeTab === 'Functions' && (
              <FunctionsTab key={node.id} node={node} onUpdate={patch} />
            )}
            {activeTab === 'Actions' && (
              <ActionsTab key={node.id} node={node} onUpdate={patch} />
            )}
          </div>

          {/* Delete button */}
          <div className="px-4 py-3 border-t border-slate-100 shrink-0">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <MdOutlineDeleteOutline className="text-base" />
              Delete node
            </button>
          </div>
        </>
      ) : (
        <NoSelection />
      )}
    </aside>
  )
}

export default NodeInspector

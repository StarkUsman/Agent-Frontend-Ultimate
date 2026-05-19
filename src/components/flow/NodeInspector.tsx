import { useState } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import { MdOutlineDeleteOutline, MdKeyboardArrowDown } from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
interface InspectorProps {
  node: Node | null
}

type Tab = 'General' | 'Messages' | 'Functions' | 'Actions'
const TABS: Tab[] = ['General', 'Messages', 'Functions', 'Actions']

const CONTEXT_STRATEGIES = [
  { value: 'APPEND',  label: 'APPEND (default)' },
  { value: 'PREPEND', label: 'PREPEND' },
  { value: 'RESET',   label: 'RESET' },
]

// ── Reusable form field wrapper ────────────────────────────────────────────
const Field = ({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-600">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 leading-relaxed">{hint}</p>}
  </div>
)

// ── General tab — fields differ slightly by node type ──────────────────────
// key={node.id} on this component forces a full remount when a new
// node is selected, which resets all local form state automatically.
const GeneralTab = ({
  node,
  onUpdate,
}: {
  node: Node
  onUpdate: (patch: Record<string, unknown>) => void
}) => {
  const label             = (node.data?.label            as string)  ?? ''
  const instructions      = (node.data?.instructions     as string)  ?? ''
  const respondImmediately= (node.data?.respondImmediately as boolean) ?? true
  const contextStrategy   = (node.data?.contextStrategy  as string)  ?? 'APPEND'

  return (
    <div className="space-y-5 p-4">

      {/* Label */}
      <Field label="Label">
        <input
          defaultValue={label}
          onBlur={(e)    => onUpdate({ label: e.target.value.trim() || label })}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
          placeholder="Node label"
        />
      </Field>

      {/* Type — read-only */}
      <Field label="Type">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-xs font-mono text-slate-600">
          {node.type}
        </span>
      </Field>

      {/* Instructions — StepNode only */}
      {node.type === 'step' && (
        <Field
          label="Instructions"
          hint="Tell the AI what to say or do at this step."
        >
          <textarea
            defaultValue={instructions}
            rows={4}
            onBlur={(e)    => onUpdate({ instructions: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur()
            }}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            placeholder="e.g. Greet the caller and ask how you can help them today."
          />
        </Field>
      )}

      {/* Respond Immediately — Initial + Step only */}
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
            <label
              htmlFor={`ri-${node.id}`}
              className="text-sm font-medium text-slate-700 cursor-pointer"
            >
              Respond Immediately
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Speak as soon as this node is entered.
            </p>
          </div>
        </div>
      )}

      {/* Context Strategy — Initial + Step only */}
      {node.type !== 'end' && (
        <Field
          label="Context Strategy"
          hint={
            contextStrategy === 'APPEND'
              ? 'APPEND is the default strategy. Remove this configuration to use the default.'
              : undefined
          }
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

      {/* Data (JSON) preview */}
      <Field label="Data (JSON)">
        <pre className="w-full px-3 py-2 text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-lg overflow-x-auto leading-relaxed">
          {JSON.stringify(node.data, null, 2)}
        </pre>
      </Field>

    </div>
  )
}

// ── Placeholder for future tabs ────────────────────────────────────────────
const EmptyTab = ({ tab }: { tab: Tab }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
    <p className="text-xs font-semibold text-slate-400">{tab}</p>
    <p className="text-[10px] text-slate-300">
      No {tab.toLowerCase()} configured for this node.
    </p>
  </div>
)

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

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Inspector{node ? `: ${node.type}` : ''}
        </p>
      </div>

      {node ? (
        <>
          {/* ── Tabs ── */}
          <div className="flex border-b border-slate-100 px-1 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-3 py-2.5 text-xs font-medium transition-all relative cursor-pointer
                  ${activeTab === tab
                    ? 'text-indigo-600'
                    : 'text-slate-400 hover:text-slate-600'}
                `}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content (scrollable) ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'General' ? (
              // key={node.id} resets all form state when a different node is selected
              <GeneralTab
                key={node.id}
                node={node}
                onUpdate={(patch) => updateNodeData(node.id, patch)}
              />
            ) : (
              <EmptyTab tab={activeTab} />
            )}
          </div>

          {/* ── Delete button ── */}
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

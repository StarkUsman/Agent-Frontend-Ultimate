import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import FlowToolbar   from '../components/flow/FlowToolbar'
import NodePalette   from '../components/flow/NodePalette'
import FlowCanvas    from '../components/flow/FlowCanvas'
import NodeInspector from '../components/flow/NodeInspector'
import { AGENTS } from '../data/agents'

// ── Example flow loaded when "Load Example" is clicked ─────────────────────
const EXAMPLE_NODES: Node[] = [
  { id: 'ex-1', type: 'initial', position: { x: 240, y: 40  }, data: { label: 'Initial' } },
  { id: 'ex-2', type: 'step',    position: { x: 200, y: 200 }, data: { label: 'Greet caller',    instructions: 'Welcome the caller warmly and ask how you can help them today.' } },
  { id: 'ex-3', type: 'step',    position: { x: 200, y: 380 }, data: { label: 'Identify issue',  instructions: 'Ask the caller to describe their issue in more detail.' } },
  { id: 'ex-4', type: 'step',    position: { x: 200, y: 560 }, data: { label: 'Resolve issue',   instructions: 'Provide the solution or escalate to a human agent if needed.' } },
  { id: 'ex-5', type: 'end',     position: { x: 240, y: 740 }, data: { label: 'End' } },
]

const EXAMPLE_EDGES: Edge[] = [
  { id: 'ex-e1', source: 'ex-1', target: 'ex-2', type: 'smoothstep' },
  { id: 'ex-e2', source: 'ex-2', target: 'ex-3', type: 'smoothstep' },
  { id: 'ex-e3', source: 'ex-3', target: 'ex-4', type: 'smoothstep' },
  { id: 'ex-e4', source: 'ex-4', target: 'ex-5', type: 'smoothstep' },
]

const NEW_FLOW_NODES: Node[] = [
  { id: '1', type: 'initial', position: { x: 240, y: 60 }, data: { label: 'Initial' } },
]

// ── Toast notification ─────────────────────────────────────────────────────
const Toast = ({ message }: { message: string }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl pointer-events-none">
    {message}
  </div>
)

// ── Inner component — lives INSIDE ReactFlowProvider ──────────────────────
// This allows useReactFlow() to access the canvas store for export/import.
interface InnerProps {
  agentName: string
}

const FlowEditorInner = ({ agentName }: InnerProps) => {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [toast, setToast]               = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  // ── New Flow ─────────────────────────────────────────────────────────────
  const handleNewFlow = useCallback(() => {
    if (
      getNodes().length > 1 &&
      !window.confirm('This will clear the current flow. Continue?')
    ) return
    setNodes(NEW_FLOW_NODES)
    setEdges([])
    showToast('New flow created')
  }, [getNodes, setNodes, setEdges, showToast])

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const flow = { nodes: getNodes(), edges: getEdges() }
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${agentName.replace(/\s+/g, '-').toLowerCase()}-flow.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Flow exported')
  }, [getNodes, getEdges, agentName, showToast])

  // ── Import ───────────────────────────────────────────────────────────────
  const handleImport = useCallback(() => {
    const input    = document.createElement('input')
    input.type     = 'file'
    input.accept   = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const { nodes, edges } = JSON.parse(e.target?.result as string)
          setNodes(nodes ?? [])
          setEdges(edges ?? [])
          showToast('Flow imported')
        } catch {
          showToast('Invalid flow file — check the JSON format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setNodes, setEdges, showToast])

  // ── Load Example ─────────────────────────────────────────────────────────
  const handleLoadExample = useCallback(() => {
    setNodes(EXAMPLE_NODES)
    setEdges(EXAMPLE_EDGES)
    showToast('Example flow loaded')
  }, [setNodes, setEdges, showToast])

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      <FlowToolbar
        agentName={agentName}
        canUndo={false}
        canRedo={false}
        onNewFlow={handleNewFlow}
        onUndo={() => {}}
        onRedo={() => {}}
        onImport={handleImport}
        onExport={handleExport}
        onLoadExample={handleLoadExample}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <FlowCanvas onNodeSelect={setSelectedNode} />
        <NodeInspector node={selectedNode} />
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
const FlowEditorPage = () => {
  const { id } = useParams<{ id: string }>()

  // Resolve real agent name from the shared data
  const agent     = AGENTS.find((a) => a.id === Number(id))
  const agentName = agent?.name ?? `Agent #${id}`

  return (
    // ReactFlowProvider must be the PARENT of any component using useReactFlow()
    <ReactFlowProvider>
      <FlowEditorInner agentName={agentName} />
    </ReactFlowProvider>
  )
}

export default FlowEditorPage

import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './nodes'

// ── Initial canvas state — gives the user something to see right away ──────
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'initial',
    position: { x: 240, y: 60 },
    data: { label: 'Initial' },
  },
  {
    id: '2',
    type: 'step',
    position: { x: 200, y: 220 },
    data: {
      label: 'Greet caller',
      instructions: 'Welcome the caller and ask how you can help them today.',
    },
  },
  {
    id: '3',
    type: 'end',
    position: { x: 240, y: 420 },
    data: { label: 'End' },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
]

// ── Props ──────────────────────────────────────────────────────────────────
export interface FlowCanvasProps {
  onNodeSelect?: (node: Node | null) => void
}

// ── Component ──────────────────────────────────────────────────────────────
// NOTE: This component MUST be rendered inside a <ReactFlowProvider>
// so that useReactFlow() can access the flow context.
const FlowCanvas = ({ onNodeSelect }: FlowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { screenToFlowPosition } = useReactFlow()
  const idRef = useRef(initialNodes.length)

  // ── Connect two handles with a smoothstep edge ─────────────────────────
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, type: 'smoothstep' }, eds)
      ),
    [setEdges]
  )

  // ── Tell the inspector which node is selected ──────────────────────────
  const onSelectionChange = useCallback(
    ({ nodes: selected }: OnSelectionChangeParams) => {
      onNodeSelect?.(selected.length === 1 ? selected[0] : null)
    },
    [onNodeSelect]
  )

  // ── Allow items to be dragged over the canvas ──────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // ── Drop a palette node onto the canvas ────────────────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow/type')
      if (!type) return

      // Convert screen coords to flow-space coords
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      idRef.current += 1

      const label = type.charAt(0).toUpperCase() + type.slice(1)
      const newNode: Node = {
        id: `node-${idRef.current}`,
        type,
        position,
        data: {
          label,
          ...(type === 'step' ? { instructions: '' } : {}),
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes]
  )

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        {/* Dotted grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#d1d5db"
        />

        {/* Zoom / fit-view controls — bottom left */}
        <Controls showInteractive={false} />

        {/* Mini-map — bottom right */}
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'initial') return '#6366f1'
            if (node.type === 'end')     return '#ef4444'
            return '#94a3b8'
          }}
          maskColor="rgba(248,250,252,0.7)"
          style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  )
}

export default FlowCanvas

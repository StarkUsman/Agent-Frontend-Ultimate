import { useCallback, useEffect, useRef } from 'react'
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

// ── Fallback when no saved flow exists for this agent ──────────────────────
const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    type: 'initial',
    position: { x: 240, y: 200 },
    data: { label: 'Initial' },
  },
]

const DEFAULT_EDGES: Edge[] = []

// ── Props ──────────────────────────────────────────────────────────────────
export interface FlowCanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodeSelect?:  (node: Node | null) => void
  onFlowChange?:  (nodes: Node[], edges: Edge[]) => void
}

// ── Component ──────────────────────────────────────────────────────────────
const FlowCanvas = ({
  initialNodes: propNodes,
  initialEdges: propEdges,
  onNodeSelect,
  onFlowChange,
}: FlowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(propNodes ?? DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(propEdges ?? DEFAULT_EDGES)
  const { screenToFlowPosition } = useReactFlow()
  const idRef        = useRef((propNodes ?? DEFAULT_NODES).length)
  const isFirstMount = useRef(true)

  // Notify parent of changes for auto-save — skip the very first render
  // so loading a flow doesn't immediately trigger a redundant save
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return }
    onFlowChange?.(nodes, edges)
  }, [nodes, edges]) // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds)),
    [setEdges]
  )

  const onSelectionChange = useCallback(
    ({ nodes: selected }: OnSelectionChangeParams) =>
      onNodeSelect?.(selected.length === 1 ? selected[0] : null),
    [onNodeSelect]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow/type')
      if (!type) return

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      idRef.current += 1

      const label = type.charAt(0).toUpperCase() + type.slice(1)
      setNodes((nds) => [
        ...nds,
        {
          id: `node-${idRef.current}`,
          type,
          position,
          data: { label, ...(type === 'step' ? { instructions: '' } : {}) },
        },
      ])
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
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#d1d5db" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) =>
            n.type === 'initial' ? '#6366f1' : n.type === 'end' ? '#ef4444' : '#94a3b8'
          }
          maskColor="rgba(248,250,252,0.7)"
          style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  )
}

export default FlowCanvas

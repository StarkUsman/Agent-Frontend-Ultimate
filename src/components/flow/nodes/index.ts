import InitialNode from './InitialNode'
import StepNode from './StepNode'
import EndNode from './EndNode'

// Passed directly to <ReactFlow nodeTypes={nodeTypes} /> in FlowCanvas
// Keys must match the 'type' strings used in PALETTE_NODES and node data
export const nodeTypes = {
  initial: InitialNode,
  step:    StepNode,
  end:     EndNode,
}

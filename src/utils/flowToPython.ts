import type { Node, Edge } from '@xyflow/react'
import type { FlowFunction, FnProperty, DecisionCondition } from '../components/flow/inspector/FunctionsTab'
import type { Action } from '../components/flow/inspector/ActionsTab'
import type { Msg } from '../components/flow/NodeInspector'

// ── Safe array coercion ────────────────────────────────────────────────────
// Handles cases where data loaded from localStorage has {} instead of []

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// ── Naming helpers ─────────────────────────────────────────────────────────

function toSnakeCase(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'node'
  )
}

function toPascalCase(str: string): string {
  return str
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

function createFuncName(label: string): string {
  return `create_${toSnakeCase(label)}_node`
}

function resultClassName(funcName: string): string {
  return `${toPascalCase(funcName)}Result`
}

// ── Type mapping ───────────────────────────────────────────────────────────

function pyTypeAnnotation(type: string): string {
  switch (type) {
    case 'string':  return 'str'
    case 'number':  return 'float'
    case 'boolean': return 'bool'
    case 'array':   return 'list'
    case 'object':  return 'dict'
    default:        return 'Any'
  }
}

function pyDefaultValue(type: string): string {
  switch (type) {
    case 'string':  return '""'
    case 'number':  return '0.0'
    case 'boolean': return 'False'
    case 'array':   return '[]'
    case 'object':  return '{}'
    default:        return 'None'
  }
}

// ── BFS ordering ───────────────────────────────────────────────────────────

function bfsOrder(
  nodes: Node[],
  nodeMap: Map<string, Node>,
  edgeMap: Map<string, string[]>,
): Node[] {
  const initialNode = nodes.find((n) => n.type === 'initial')
  if (!initialNode) return nodes

  const visited = new Set<string>()
  const queue = [initialNode.id]
  const ordered: Node[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    const node = nodeMap.get(id)
    if (node) ordered.push(node)
    for (const target of edgeMap.get(id) ?? []) {
      if (!visited.has(target)) queue.push(target)
    }
  }

  // Append disconnected nodes at the end
  for (const n of nodes) {
    if (!visited.has(n.id)) ordered.push(n)
  }

  return ordered
}

// ── Resolve next-node call ─────────────────────────────────────────────────

function resolveNextNodeCall(nextNodeId: string | null, nodeMap: Map<string, Node>): string {
  if (!nextNodeId) return 'None  # TODO: connect to next node'
  const target = nodeMap.get(nextNodeId)
  if (!target) return 'None  # TODO: connect to next node'
  const label = (target.data?.label as string | undefined) ?? target.id
  return `${createFuncName(label)}()`
}

// ── Condition expression ───────────────────────────────────────────────────

function conditionExpr(cond: DecisionCondition): string {
  const val = cond.value !== '' && !isNaN(Number(cond.value)) ? cond.value : `"${cond.value}"`
  switch (cond.operator) {
    case '==':          return `result == ${val}`
    case '!=':          return `result != ${val}`
    case '>':           return `result > ${val}`
    case '<':           return `result < ${val}`
    case '>=':          return `result >= ${val}`
    case '<=':          return `result <= ${val}`
    case 'contains':    return `${val} in result`
    case 'not_contains':return `${val} not in result`
    default:            return `result == ${val}`
  }
}

// ── Action object literal ──────────────────────────────────────────────────

function actionLiteral(action: Action): string {
  switch (action.type) {
    case 'end_conversation':
      return '{"type": "end_conversation"}'
    case 'tts_say':
      return `{"type": "tts_say", "text": ${JSON.stringify(action.handler)}}`
    case 'function':
      return `{"type": "function", "handler": "${action.handler}"}`
    default:
      return `{"type": "${action.type}"}`
  }
}

// ── Property schema dict ───────────────────────────────────────────────────

function propertySchemaLines(prop: FnProperty, indent: string): string[] {
  const lines: string[] = []
  lines.push(`${indent}"${prop.name}": {`)
  lines.push(`${indent}    "type": "${prop.type}",`)
  lines.push(`${indent}    "description": "${prop.name}"`)
  if (prop.validation === 'enum' && prop.enumValues) {
    const enums = prop.enumValues
      .split(/[\n,]+/)
      .map((v) => v.trim())
      .filter(Boolean)
    lines[lines.length - 1] += ','   // add comma after description line
    lines.push(`${indent}    "enum": [${enums.map((v) => JSON.stringify(v)).join(', ')}]`)
  } else if (prop.validation === 'pattern' && prop.pattern) {
    lines[lines.length - 1] += ','
    lines.push(`${indent}    "pattern": ${JSON.stringify(prop.pattern)}`)
  }
  lines.push(`${indent}},`)
  return lines
}

// ── Handler function ───────────────────────────────────────────────────────

function handlerLines(fn: FlowFunction, nodeMap: Map<string, Node>, indent: string): string[] {
  const namedProps = (asArray(fn.properties)).filter((p) => p.name)
  const hasResult  = namedProps.length > 0
  const resultType = hasResult ? resultClassName(fn.name) : 'None'
  const retType    = hasResult
    ? `tuple[${resultType} | None, NodeConfig]`
    : 'tuple[None, NodeConfig]'

  const lines: string[] = []
  lines.push(`${indent}async def handle_${fn.name}(args: FlowArgs, flow_manager: FlowManager) -> ${retType}:`)
  lines.push(`${indent}    """Handler for ${fn.name} function"""`)

  // Arg extraction
  for (const prop of namedProps) {
    lines.push(`${indent}    ${prop.name}: ${pyTypeAnnotation(prop.type)} = args.get("${prop.name}", ${pyDefaultValue(prop.type)})`)
  }

  const buildReturn = (nextCall: string): string => {
    if (hasResult) {
      const kwargs = namedProps.map((p) => `${p.name}=${p.name}`).join(', ')
      return `${indent}    return ${resultType}(${kwargs}), ${nextCall}`
    }
    return `${indent}    return None, ${nextCall}`
  }

  const decision = fn.decision
  if (decision && (decision.conditions ?? []).length > 0) {
    // Emit custom action block
    if (decision.action?.trim()) {
      for (const actionLine of decision.action.split('\n')) {
        lines.push(`${indent}    ${actionLine}`)
      }
    }
    // Condition branches
    ;(decision.conditions ?? []).forEach((cond, idx) => {
      const keyword = idx === 0 ? 'if' : 'elif'
      lines.push(`${indent}    ${keyword} ${conditionExpr(cond)}:`)
      lines.push(`${indent}        ` + buildReturn(resolveNextNodeCall(cond.next_node, nodeMap)).trimStart())
    })
    // Fallback
    lines.push(`${indent}    # TODO: Implement function logic`)
    lines.push(`${indent}    # Update flow_manager.state as needed`)
    lines.push(buildReturn(resolveNextNodeCall(fn.next_node, nodeMap)))
  } else {
    lines.push(`${indent}    # TODO: Implement function logic`)
    lines.push(`${indent}    # Update flow_manager.state as needed`)
    lines.push(buildReturn(resolveNextNodeCall(fn.next_node, nodeMap)))
  }

  return lines
}

// ── FlowsFunctionSchema block ──────────────────────────────────────────────

function schemaLines(fn: FlowFunction, indent: string): string[] {
  const namedProps = (asArray(fn.properties)).filter((p) => p.name)
  const required   = (asArray(fn.properties)).filter((p) => p.name && p.required)

  const lines: string[] = []
  lines.push(`${indent}${fn.name}_func = FlowsFunctionSchema(`)
  lines.push(`${indent}    name="${fn.name}",`)
  lines.push(`${indent}    handler=handle_${fn.name},`)
  lines.push(`${indent}    description="${fn.description}",`)

  if (namedProps.length > 0) {
    lines.push(`${indent}    properties={`)
    for (const prop of namedProps) {
      lines.push(...propertySchemaLines(prop, `${indent}        `))
    }
    lines.push(`${indent}    },`)
  } else {
    lines.push(`${indent}    properties={},`)
  }

  if (required.length > 0) {
    lines.push(`${indent}    required=[${required.map((p) => JSON.stringify(p.name)).join(', ')}]`)
  } else {
    lines.push(`${indent}    required=[]`)
  }
  lines.push(`${indent})`)
  return lines
}

// ── Node creation function ─────────────────────────────────────────────────

function generateNodeFunction(node: Node, nodeMap: Map<string, Node>): string {
  const label        = (node.data?.label as string | undefined) ?? 'Node'
  const funcName     = createFuncName(label)
  const nodeName     = toSnakeCase(label)
  const functions    = ((node.data?.functions as FlowFunction[] | undefined) ?? []).filter((fn) => fn.name)
  const roleMessages = (node.data?.role_messages as Msg[] | undefined) ?? []
  const preActions   = (node.data?.pre_actions   as Action[]  | undefined) ?? []
  const postActions  = (node.data?.post_actions  as Action[]  | undefined) ?? []
  const instructions = (node.data?.instructions  as string    | undefined) ?? ''
  const strategy     = node.data?.contextStrategy as string | undefined
  const respondImmediately = node.data?.respondImmediately as boolean | undefined

  // task_messages: prefer explicit array, fall back to instructions field
  const rawTaskMessages = (node.data?.task_messages as Msg[] | undefined) ?? []
  const taskMessages: Msg[] =
    rawTaskMessages.length > 0
      ? rawTaskMessages
      : instructions
      ? [{ role: 'system', content: instructions }]
      : []

  // end nodes always have end_conversation in post_actions
  const effectivePost = [...postActions]
  if (node.type === 'end' && !effectivePost.some((a) => a.type === 'end_conversation')) {
    effectivePost.push({ id: 'auto-end', type: 'end_conversation', handler: '' })
  }

  const I = '    '  // 4-space indent
  const lines: string[] = []

  lines.push(`def ${funcName}() -> NodeConfig:`)
  lines.push(`${I}"""Create the ${label} node."""`)

  if (functions.length > 0) {
    lines.push('')
    functions.forEach((fn, idx) => {
      lines.push(...handlerLines(fn, nodeMap, I))
      // blank line between handlers
      if (idx < functions.length - 1) lines.push('')
    })
    lines.push('')
    functions.forEach((fn) => {
      lines.push(...schemaLines(fn, I))
    })
  }

  // NodeConfig
  lines.push(`${I}return NodeConfig(`)
  lines.push(`${I}    name="${nodeName}",`)

  if (roleMessages.length > 0) {
    lines.push(`${I}    role_messages=[`)
    for (const msg of roleMessages) {
      lines.push(`${I}        {`)
      lines.push(`${I}            "role": "${msg.role}",`)
      lines.push(`${I}            "content": ${JSON.stringify(msg.content)}`)
      lines.push(`${I}        }`)
    }
    lines.push(`${I}    ],`)
  }

  if (taskMessages.length > 0) {
    lines.push(`${I}    task_messages=[`)
    for (const msg of taskMessages) {
      lines.push(`${I}        {`)
      lines.push(`${I}            "role": "${msg.role}",`)
      lines.push(`${I}            "content": ${JSON.stringify(msg.content)}`)
      lines.push(`${I}        }`)
    }
    lines.push(`${I}    ],`)
  }

  if (functions.length > 0) {
    lines.push(`${I}    functions=[${functions.map((fn) => `${fn.name}_func`).join(', ')}],`)
  }

  if (preActions.length > 0) {
    lines.push(`${I}    pre_actions=[`)
    for (const a of preActions) lines.push(`${I}        ${actionLiteral(a)},`)
    lines.push(`${I}    ],`)
  }

  if (effectivePost.length > 0) {
    lines.push(`${I}    post_actions=[`)
    for (const a of effectivePost) lines.push(`${I}        ${actionLiteral(a)},`)
    lines.push(`${I}    ],`)
  }

  if (strategy && strategy !== 'APPEND') {
    lines.push(`${I}    context_strategy="${strategy}",`)
  }

  if (respondImmediately === true) {
    lines.push(`${I}    respond_immediately=True,`)
  }

  lines.push(`${I})`)

  return lines.join('\n')
}

// ── Result type classes ────────────────────────────────────────────────────

function generateResultClasses(orderedNodes: Node[]): string {
  const blocks: string[] = []

  for (const node of orderedNodes) {
    const functions = ((node.data?.functions as FlowFunction[] | undefined) ?? []).filter(
      (fn) => fn.name && (asArray(fn.properties)).some((p) => p.name),
    )
    for (const fn of functions) {
      const namedProps = fn.properties.filter((p) => p.name)
      const className  = resultClassName(fn.name)
      const lines = [
        `class ${className}(FlowResult):`,
        `    """Result type for ${fn.name} function"""`,
        ...namedProps.map((p) => `    ${p.name}: ${pyTypeAnnotation(p.type)}`),
      ]
      blocks.push(lines.join('\n'))
    }
  }

  return blocks.join('\n\n')
}

// ── FlowManager setup comment ──────────────────────────────────────────────

const FLOW_MANAGER_COMMENT_TEMPLATE = `# FlowManager Setup
#
# Initialize the FlowManager in your bot setup:
#
# async def run_bot(transport: BaseTransport, runner_args: RunnerArguments):
#     stt = DeepgramSTTService(api_key=os.getenv("DEEPGRAM_API_KEY"))
#     tts = CartesiaTTSService(api_key=os.getenv("CARTESIA_API_KEY"))
#     llm = create_llm()  # Your LLM service
#
#     context = LLMContext()
#     context_aggregator = LLMContextAggregatorPair(context)
#
#     pipeline = Pipeline([
#         transport.input(),
#         stt,
#         context_aggregator.user(),
#         llm,
#         tts,
#         transport.output(),
#         context_aggregator.assistant(),
#     ])
#
#     task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))
#
#     # Initialize FlowManager
#     flow_manager = FlowManager(
#         task=task,
#         llm=llm,
#         context_aggregator=context_aggregator,
#         transport=transport,
#         # global_functions=[],
#     )
#
#     @transport.event_handler("on_client_connected")
#     async def on_client_connected(transport, client):
#         logger.info("Client connected")
#         # Start the flow with the initial node
#         await flow_manager.initialize({{INITIAL_FUNC}}())`

// ── Public entry point ─────────────────────────────────────────────────────

export function flowToPython(nodes: Node[], edges: Edge[], agentName: string): string {
  const nodeMap = new Map<string, Node>()
  nodes.forEach((n) => nodeMap.set(n.id, n))

  const edgeMap = new Map<string, string[]>()
  edges.forEach((e) => {
    if (!edgeMap.has(e.source)) edgeMap.set(e.source, [])
    edgeMap.get(e.source)!.push(e.target)
  })

  const orderedNodes = bfsOrder(nodes, nodeMap, edgeMap)

  const sections: string[] = []

  // Docstring
  sections.push(
    `"""Generated Pipecat Flow: ${agentName}\n\nThis file was generated from the visual flow editor.\nCustomize the function handlers to implement your flow logic.\n"""`,
  )

  // Imports
  sections.push(
    `from pipecat_flows import (\n    FlowArgs,\n    FlowManager,\n    FlowResult,\n    FlowsFunctionSchema,\n    NodeConfig,\n)`,
  )

  // Result type classes
  const resultBlock = generateResultClasses(orderedNodes)
  if (resultBlock) {
    sections.push(`# Type definitions\n${resultBlock}`)
  }

  // Node functions
  sections.push(`# Node creation functions`)
  for (const node of orderedNodes) {
    sections.push(generateNodeFunction(node, nodeMap))
  }

  // FlowManager comment
  const initialNode = nodes.find((n) => n.type === 'initial')
  const initialLabel = (initialNode?.data?.label as string | undefined) ?? 'initial'
  sections.push(FLOW_MANAGER_COMMENT_TEMPLATE.replace('{{INITIAL_FUNC}}', createFuncName(initialLabel)))

  return sections.join('\n\n\n') + '\n'
}

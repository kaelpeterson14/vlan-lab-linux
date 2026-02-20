import { ReactFlow, Background, Controls, type Node } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { nodes as topoNodes, edges as topoEdges } from "../data/topology"
import { useLabStore } from "../store/labstore"
import { phases, type NetworkNode } from "../data/topology"
import NetworkNodeComponent from "./NetworkNode"
import BridgeNode from "./BridgeNode"

const nodeTypes = {
    namespace: NetworkNodeComponent,
    bridge: BridgeNode,
}

const positions: Record<string, { x: number; y: number }> = {
    host1: { x: 100, y: 0 },
    host2: { x: 400, y: 0 },
    guest1: { x: 700, y: 0 },
    mgmt1: { x: 1000, y: 0 },
    br10: { x: 100, y: 200 },
    br20: { x: 400, y: 200 },
    br30: { x: 700, y: 200 },
    br99: { x: 1000, y: 200 },
    router: { x: 500, y: 400 },
}

// ReactFlow expects data to be Record<string, unknown> (have an index signature)
type FlowNetworkNode = NetworkNode & Record<string, unknown>

export default function TopologyCanvas() {
    const { currentPhase, setSelectedNodeId } = useLabStore()
    const activePhase = phases[currentPhase]

    const visibleNodes: Node<FlowNetworkNode>[] = topoNodes
        .filter(n => activePhase.nodeIds.includes(n.id))
        .map(n => ({
            id: n.id,
            type: n.kind,
            position: positions[n.id],
            data: n as FlowNetworkNode,
        }))

    const visibleEdges = topoEdges
        .filter(e => activePhase.edgeIds.includes(e.id))
        .map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
        }))

    return (
        <div className="w-full h-full">
            <ReactFlow<Node<FlowNetworkNode>>
                nodes={visibleNodes}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}
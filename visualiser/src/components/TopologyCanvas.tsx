import { ReactFlow, Background, Controls, type Node } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { nodes as topoNodes, edges as topoEdges, phases } from "../data/topology"
import type { NetworkNode } from "../data/topology"
import { useLabStore } from "../store/labStore"
import NetworkNodeComponent from "./NetworkNode"
import BridgeNode from "./BridgeNode"
import VethEdge from "./VethEdge"

export type FlowNode = Node<NetworkNode>

const nodeTypes = {
    namespace: NetworkNodeComponent,
    bridge: BridgeNode,
}

const edgeTypes = {
    veth: VethEdge,
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

export default function TopologyCanvas() {
    const { currentPhase, setSelectedNodeId } = useLabStore()
    const activePhase = phases[currentPhase]

    const visibleNodes: FlowNode[] = topoNodes
        .filter(n => activePhase.nodeIds.includes(n.id))
        .map(n => ({
            id: n.id,
            type: n.kind,
            position: positions[n.id],
            data: n,
        }))

    const visibleEdges = topoEdges
        .filter(e => activePhase.edgeIds.includes(e.id))
        .map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: "veth",
            data: { description: e.description },
        }))

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={visibleNodes}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}
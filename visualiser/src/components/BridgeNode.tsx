import { Handle, Position } from "@xyflow/react"
import type { NetworkNode } from "../data/topology"

interface Props {
    data: NetworkNode
}

export default function BridgeNode({ data }: Props) {
    return (
        <div className="border border-slate-500 bg-slate-800 rounded-full px-5 py-1 text-white font-mono text-xs">
            <Handle type="target" position={Position.Top} />
            <div className="font-bold">{data.label}</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}
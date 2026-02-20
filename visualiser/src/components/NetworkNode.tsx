import { Handle, Position } from "@xyflow/react"
import type { NetworkNode } from "../data/topology"

interface Props {
    data: NetworkNode
}

const zoneColors: Record<string, string> = {
    users: "border-blue-500 bg-blue-950",
    servers: "border-green-500 bg-green-950",
    guest: "border-orange-500 bg-orange-950",
    management: "border-purple-500 bg-purple-950",
    router: "border-gray-400 bg-gray-800",
}

export default function NetworkNode({ data }: Props) {
    return (
        <div className={`border rounded-lg px-4 py-2 min-w-32 text-white font-mono text-sm ${zoneColors[data.zone]}`}>
            <Handle type="target" position={Position.Top} />
            <div className="font-bold text-base mb-1">{data.label}</div>
            {data.interfaces.filter(i => i.ip).map(iface => (
                <div key={iface.name} className="text-xs text-gray-300">
                    {iface.name}: {iface.ip}
                </div>
            ))}
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}
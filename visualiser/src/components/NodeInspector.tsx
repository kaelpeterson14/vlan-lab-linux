import { useLabStore } from "../store/labstore"
import { nodes } from "../data/topology"

export default function NodeInspector() {
    const { selectedNodeId, setSelectedNodeId } = useLabStore()
    const node = nodes.find(n => n.id === selectedNodeId)

    if (!node) return null

    return (
        <div className="absolute top-4 left-4 w-72 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm z-10">
            <div className="flex justify-between items-center mb-3">
                <span className="text-white font-bold">{node.label}</span>
                <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-gray-500 hover:text-white text-xs"
                >
                    ✕
                </button>
            </div>
            <div className="text-gray-500 text-xs mb-3">{node.description}</div>
            <div className="text-gray-400 text-xs font-bold mb-2">Interfaces</div>
            <div className="flex flex-col gap-1">
                {node.interfaces.map(iface => (
                    <div key={iface.name} className="flex justify-between text-xs">
                        <span className="text-gray-400">{iface.name}</span>
                        <span className="text-green-400">{iface.ip ?? "—"}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
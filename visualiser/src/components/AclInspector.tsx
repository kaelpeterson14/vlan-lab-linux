import { aclRules } from "../data/topology"
import { useLabStore } from "../store/labstore"
import Collapsible from "./Collapsible"

const actionColors: Record<string, string> = {
    ACCEPT: "text-green-400 border-green-700",
    DROP: "text-red-400 border-red-700",
}

export default function AclInspector() {
    const { lastMatchedRule } = useLabStore()

    return (
        <div className="w-80 h-full overflow-y-auto border-l border-gray-800 bg-gray-950">
            <Collapsible title="ACL Rules — FORWARD Chain">
                <div className="flex flex-col gap-3 px-4 pb-4">
                    {aclRules.map(rule => (
                        <div
                            key={rule.id}
                            className={`border rounded p-3 text-xs transition-colors font-mono ${lastMatchedRule?.id === rule.id
                                    ? "border-yellow-400 bg-yellow-950"
                                    : "border-gray-700 bg-gray-900"
                                }`}
                        >
                            <div className={`font-bold mb-1 ${actionColors[rule.action]}`}>
                                {rule.action} {rule.protocol ? `(${rule.protocol})` : ""}
                            </div>
                            <div className="text-gray-400 mb-1">{rule.src} → {rule.dst}</div>
                            <div className="text-gray-500 mb-2">{rule.description}</div>
                            <code className="text-gray-600 text-xs break-all">{rule.iptablesCmd}</code>
                        </div>
                    ))}
                    <div className="border border-red-900 rounded p-3 text-xs bg-gray-900 font-mono">
                        <div className="font-bold text-red-400 mb-1">DROP (default policy)</div>
                        <div className="text-gray-400 mb-1">any → any</div>
                        <div className="text-gray-500">No rule matched. Packet dropped by default FORWARD policy.</div>
                        <code className="text-gray-600 text-xs">iptables -P FORWARD DROP</code>
                    </div>
                </div>
            </Collapsible>
        </div>
    )
}
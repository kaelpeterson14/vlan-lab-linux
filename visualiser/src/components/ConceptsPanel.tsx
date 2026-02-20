const concepts = [
    { linux: "Network namespace", real: "Physical host / PC" },
    { linux: "Linux bridge", real: "Ethernet switch / VLAN" },
    { linux: "veth pair", real: "Ethernet cable" },
    { linux: "Router namespace (ip_forward=1)", real: "Router / Layer 3 switch" },
    { linux: "iptables FORWARD chain", real: "Stateful firewall / ACL" },
    { linux: "conntrack", real: "Connection tracking (stateful firewall state)" },
]

export default function ConceptsPanel() {
    return (
        <div className="border-t border-gray-800 bg-gray-950 p-4 font-mono">
            <h2 className="text-white text-sm font-bold mb-3">Linux → Real Network</h2>
            <div className="flex flex-wrap gap-2">
                {concepts.map(c => (
                    <div key={c.linux} className="flex gap-2 items-center text-xs border border-gray-700 rounded px-3 py-1 bg-gray-900">
                        <span className="text-blue-400">{c.linux}</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-gray-300">{c.real}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
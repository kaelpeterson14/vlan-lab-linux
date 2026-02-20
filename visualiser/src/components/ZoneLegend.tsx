const zones = [
    { label: "Users", color: "bg-blue-500" },
    { label: "Servers", color: "bg-green-500" },
    { label: "Guest", color: "bg-orange-500" },
    { label: "Management", color: "bg-purple-500" },
    { label: "Router", color: "bg-gray-400" },
    { label: "Bridge", color: "bg-slate-500" },
]

export default function ZoneLegend() {
    return (
        <div className="flex items-center gap-4">
            {zones.map(z => (
                <div key={z.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${z.color}`} />
                    <span className="text-gray-400 font-mono text-xs">{z.label}</span>
                </div>
            ))}
        </div>
    )
}
import { useLabStore } from "../store/labstore"
import type { Phase } from "../store/labstore"

const labels: Record<Phase, string> = {
    2: "Phase 2 — Layer 2 Only",
    3: "Phase 3 — Routing",
    4: "Phase 4 — ACL",
}

export default function PhaseToggle() {
    const { currentPhase, setPhase } = useLabStore()

    return (
        <div className="flex gap-2">
            {([2, 3, 4] as Phase[]).map(phase => (
                <button
                    key={phase}
                    onClick={() => setPhase(phase)}
                    className={`px-4 py-2 rounded font-mono text-sm border transition-colors ${currentPhase === phase
                        ? "bg-white text-gray-950 border-white"
                        : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400 hover:text-white"
                        }`}
                >
                    {labels[phase]}
                </button>
            ))}
        </div>
    )
}
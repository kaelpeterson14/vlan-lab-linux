import { useState } from "react"
import { useLabStore } from "../store/labstore"
import { matchAcl } from "../utils/matchAcl"
import type { ActivePacket } from "../store/labstore"
import Collapsible from "./Collapsible"

const hosts = ["host1", "host2", "guest1", "mgmt1"]
const protocols = ["tcp", "icmp"] as const

export default function PacketSimulator() {
    const { setActivePacket, setLastMatchedRule } = useLabStore()
    const [src, setSrc] = useState("host1")
    const [dst, setDst] = useState("host2")
    const [protocol, setProtocol] = useState<"tcp" | "icmp">("tcp")
    const [result, setResult] = useState<"ACCEPT" | "DROP" | null>(null)

    function simulate() {
        const packet: ActivePacket = { srcId: src, dstId: dst, protocol }
        setActivePacket(packet)
        const matched = matchAcl(packet)
        setLastMatchedRule(matched)
        setResult(matched ? matched.action : "DROP")
    }

    return (
        <Collapsible title="Packet Simulator">
            <div className="px-4 pb-4 flex gap-3 items-end flex-wrap">
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-xs">Source</label>
                    <select
                        value={src}
                        onChange={e => setSrc(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                        {hosts.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-xs">Destination</label>
                    <select
                        value={dst}
                        onChange={e => setDst(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                        {hosts.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-xs">Protocol</label>
                    <select
                        value={protocol}
                        onChange={e => setProtocol(e.target.value as "tcp" | "icmp")}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                        {protocols.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <button
                    onClick={simulate}
                    className="px-4 py-1 bg-white text-gray-950 rounded font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                    Send Packet
                </button>
                {result && (
                    <div className={`text-sm font-bold px-3 py-1 rounded border ${result === "ACCEPT"
                        ? "text-green-400 border-green-700 bg-green-950"
                        : "text-red-400 border-red-700 bg-red-950"
                        }`}>
                        {result}
                    </div>
                )}
            </div>
        </Collapsible>
    )
}
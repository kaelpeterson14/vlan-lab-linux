import { create } from "zustand"
import type { AclRule } from "../data/topology"

export type Phase = 2 | 3 | 4

export interface ActivePacket {
    srcId: string
    dstId: string
    protocol: "tcp" | "icmp"
}

interface LabState {
    currentPhase: Phase
    selectedNodeId: string | null
    activePacket: ActivePacket | null
    lastMatchedRule: AclRule | null
    setPhase: (phase: Phase) => void
    setSelectedNodeId: (id: string | null) => void
    setActivePacket: (packet: ActivePacket | null) => void
    setLastMatchedRule: (rule: AclRule | null) => void
}

export const useLabStore = create<LabState>((set) => ({
    currentPhase: 2,
    selectedNodeId: null,
    activePacket: null,
    lastMatchedRule: null,
    setPhase: (phase) => set({ currentPhase: phase }),
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    setActivePacket: (packet) => set({ activePacket: packet }),
    setLastMatchedRule: (rule) => set({ lastMatchedRule: rule }),
}))
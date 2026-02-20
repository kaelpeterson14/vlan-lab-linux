import { aclRules, type AclRule } from "../data/topology"
import type { ActivePacket } from "../store/labStore"

const cidrToPrefix = (cidr: string): string => cidr.split("/")[0].slice(0, cidr.indexOf(".") > 0 ? 7 : 7)

const subnetMap: Record<string, string> = {
    "host1": "192.168.10.0/24",
    "host2": "192.168.20.0/24",
    "guest1": "192.168.30.0/24",
    "mgmt1": "192.168.99.0/24",
}

function matchesCidr(subnet: string, cidr: string): boolean {
    if (cidr === "any") return true
    return subnet === cidr
}

export function matchAcl(packet: ActivePacket): AclRule | null {
    const srcCidr = subnetMap[packet.srcId]
    const dstCidr = subnetMap[packet.dstId]

    for (const rule of aclRules) {
        if (rule.stateful) continue
        if (!matchesCidr(srcCidr, rule.src) && rule.src !== "any") continue
        if (!matchesCidr(dstCidr, rule.dst) && rule.dst !== "any") continue
        if (rule.protocol && rule.protocol !== packet.protocol) continue
        return rule
    }

    return null
}
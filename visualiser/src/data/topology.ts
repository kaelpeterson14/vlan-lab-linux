export type Zone = "users" | "servers" | "guest" | "management" | "router" | "bridge"
export type NodeKind = "namespace" | "bridge"

export interface NetworkInterface {
    name: string
    ip?: string
    cidr?: string
}

export interface NetworkNode {
    id: string
    label: string
    kind: NodeKind
    zone: Zone
    interfaces: NetworkInterface[]
    description: string
    [key: string]: unknown
}
export interface VethPair {
    id: string
    source: string
    target: string
    sourceHandle: string
    targetHandle: string
    description: string
}

export interface AclRule {
    id: string
    src: string
    dst: string
    action: "ACCEPT" | "DROP"
    stateful: boolean
    protocol?: string
    description: string
    iptablesCmd: string
}

export const nodes: NetworkNode[] = [
    {
        id: "host1",
        label: "host1",
        kind: "namespace",
        zone: "users",
        interfaces: [
            { name: "lo" },
            { name: "veth-host1", ip: "192.168.10.2", cidr: "192.168.10.0/24" }
        ],
        description: "A network namespace simulating a user workstation. Lives on the Users subnet. Can reach Servers but cannot be reached by them for new connections."
    },

    {
        id: "host2",
        label: "host2",
        kind: "namespace",
        zone: "servers",
        interfaces: [
            { name: "lo" },
            { name: "veth-host2", ip: "192.168.20.2", cidr: "192.168.20.0/24" }
        ],
        description: "A network namespace simulating a backend server. Lives on the Servers subnet. Users can initiate connections to it but it cannot initiate new connections back to Users."
    },
    {
        id: "guest1",
        label: "guest1",
        kind: "namespace",
        zone: "guest",
        interfaces: [
            { name: "lo" },
            { name: "veth-guest", ip: "192.168.30.2", cidr: "192.168.30.0/24" }
        ],
        description: "A network namespace simulating an untrusted guest device. Completely blocked from initiating connections to any internal network by the ACL."
    },
    {
        id: "mgmt1",
        label: "mgmt1",
        kind: "namespace",
        zone: "management",
        interfaces: [
            { name: "lo" },
            { name: "veth-mgmt", ip: "192.168.99.2", cidr: "192.168.99.0/24" }
        ],
        description: "A network namespace simulating an IT admin machine. Privileged zone — can reach any subnet in the network. No restrictions."
    },
    {
        id: "router",
        label: "router",
        kind: "namespace",
        zone: "router",
        interfaces: [
            { name: "lo" },
            { name: "veth-r10", ip: "192.168.10.1", cidr: "192.168.10.0/24" },
            { name: "veth-r20", ip: "192.168.20.1", cidr: "192.168.20.0/24" },
            { name: "veth-r30", ip: "192.168.30.1", cidr: "192.168.30.0/24" },
            { name: "veth-r99", ip: "192.168.99.1", cidr: "192.168.99.0/24" }
        ],
        description: "The router namespace. Has one interface on every subnet, acting as the default gateway for all hosts. IP forwarding is enabled. iptables FORWARD rules live here."
    },
    {
        id: "br10",
        label: "br10",
        kind: "bridge",
        zone: "bridge",
        interfaces: [
            { name: "veth-host1-br" },
            { name: "veth-r10-br" }
        ],
        description: "Linux bridge acting as a Layer 2 switch for the Users network (192.168.10.0/24). Keeps broadcast traffic isolated to this domain. Has two ports — one for host1, one for the router."
    },
    {
        id: "br20",
        label: "br20",
        kind: "bridge",
        zone: "bridge",
        interfaces: [
            { name: "veth-host2-br" },
            { name: "veth-r20-br" }
        ],
        description: "Linux bridge acting as a Layer 2 switch for the Servers network (192.168.20.0/24). Isolates server traffic. Has two ports — one for host2, one for the router."
    },
    {
        id: "br30",
        label: "br30",
        kind: "bridge",
        zone: "bridge",
        interfaces: [
            { name: "veth-guest-br" },
            { name: "veth-r30-br" }
        ],
        description: "Linux bridge acting as a Layer 2 switch for the Guest network (192.168.30.0/24). Guest traffic is completely isolated here and blocked at the router by ACL."
    },
    {
        id: "br99",
        label: "br99",
        kind: "bridge",
        zone: "bridge",
        interfaces: [
            { name: "veth-mgmt-br" },
            { name: "veth-r99-br" }
        ],
        description: "Linux bridge acting as a Layer 2 switch for the Management network (192.168.99.0/24). Admin traffic only. Router allows this zone to reach anywhere."
    },
]

export const edges: VethPair[] = [
    {
        id: "veth-host1--br10",
        source: "host1",
        target: "br10",
        sourceHandle: "veth-host1",
        targetHandle: "veth-host1-br",
        description: "Virtual cable connecting host1 to the Users bridge. One end (veth-host1) lives inside the host1 namespace as its NIC. The other end (veth-host1-br) is plugged into br10 as a switch port."
    },
    {
        id: "veth-host2--br20",
        source: "host2",
        target: "br20",
        sourceHandle: "veth-host2",
        targetHandle: "veth-host2-br",
        description: "Virtual cable connecting host2 to the Servers bridge. One end lives inside host2 namespace, the other is a port on br20."
    },
    {
        id: "veth-guest--br30",
        source: "guest1",
        target: "br30",
        sourceHandle: "veth-guest",
        targetHandle: "veth-guest-br",
        description: "Virtual cable connecting guest1 to the Guest bridge. One end lives inside guest1 namespace, the other is a port on br30."
    },
    {
        id: "veth-mgmt--br99",
        source: "mgmt1",
        target: "br99",
        sourceHandle: "veth-mgmt",
        targetHandle: "veth-mgmt-br",
        description: "Virtual cable connecting mgmt1 to the Management bridge. One end lives inside mgmt1 namespace, the other is a port on br99."
    },
    {
        id: "veth-r10--br10",
        source: "router",
        target: "br10",
        sourceHandle: "veth-r10",
        targetHandle: "veth-r10-br",
        description: "Virtual cable connecting the router to the Users bridge. Gives the router a presence on the Users subnet with IP 192.168.10.1 — the default gateway for host1."
    },
    {
        id: "veth-r20--br20",
        source: "router",
        target: "br20",
        sourceHandle: "veth-r20",
        targetHandle: "veth-r20-br",
        description: "Virtual cable connecting the router to the Servers bridge. Gives the router IP 192.168.20.1 — the default gateway for host2."
    },
    {
        id: "veth-r30--br30",
        source: "router",
        target: "br30",
        sourceHandle: "veth-r30",
        targetHandle: "veth-r30-br",
        description: "Virtual cable connecting the router to the Guest bridge. Gives the router IP 192.168.30.1 — the default gateway for guest1."
    },
    {
        id: "veth-r99--br99",
        source: "router",
        target: "br99",
        sourceHandle: "veth-r99",
        targetHandle: "veth-r99-br",
        description: "Virtual cable connecting the router to the Management bridge. Gives the router IP 192.168.99.1 — the default gateway for mgmt1."
    },
]
export const aclRules: AclRule[] = [
    {
        id: "rule-established",
        src: "any",
        dst: "any",
        action: "ACCEPT",
        stateful: true,
        description: "Allow return traffic for connections that were already permitted. This is what makes the firewall stateful — once a flow is allowed, replies come back automatically.",
        iptablesCmd: "iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT"
    },
    {
        id: "rule-mgmt-any",
        src: "192.168.99.0/24",
        dst: "any",
        action: "ACCEPT",
        stateful: false,
        description: "Allow the Management zone to initiate new connections to any destination. Mgmt is a privileged zone — admins can reach everything.",
        iptablesCmd: "iptables -A FORWARD -s 192.168.99.0/24 -j ACCEPT"
    },
    {
        id: "rule-users-servers",
        src: "192.168.10.0/24",
        dst: "192.168.20.0/24",
        action: "ACCEPT",
        stateful: false,
        description: "Allow Users to initiate new connections to Servers. The reverse — Servers initiating new flows to Users — has no allow rule and will be dropped.",
        iptablesCmd: "iptables -A FORWARD -s 192.168.10.0/24 -d 192.168.20.0/24 -j ACCEPT"
    },
    {
        id: "rule-icmp-request",
        src: "192.168.10.0/24",
        dst: "192.168.20.0/24",
        action: "ACCEPT",
        stateful: false,
        protocol: "icmp",
        description: "Explicitly allow ICMP echo-request (ping) from Users to Servers. Redundant with the Users->Servers rule above, but included for educational clarity.",
        iptablesCmd: "iptables -A FORWARD -p icmp --icmp-type echo-request -s 192.168.10.0/24 -d 192.168.20.0/24 -j ACCEPT"
    },
    {
        id: "rule-icmp-reply",
        src: "192.168.20.0/24",
        dst: "192.168.10.0/24",
        action: "ACCEPT",
        stateful: false,
        protocol: "icmp",
        description: "Explicitly allow ICMP echo-reply (ping response) from Servers back to Users. Typically covered by the ESTABLISHED rule, but made explicit here for demo clarity.",
        iptablesCmd: "iptables -A FORWARD -p icmp --icmp-type echo-reply -s 192.168.20.0/24 -d 192.168.10.0/24 -j ACCEPT"
    },]
export const phases = {
    2: {
        nodeIds: ["host1", "host2", "guest1", "mgmt1", "br10", "br20", "br30", "br99"],
        edgeIds: ["veth-host1--br10", "veth-host2--br20", "veth-guest--br30", "veth-mgmt--br99"],
        description: "Phase 2: Layer 2 only. Hosts and bridges exist but there is no router. Each subnet is a completely isolated broadcast domain. No traffic can cross between subnets."
    },
    3: {
        nodeIds: ["host1", "host2", "guest1", "mgmt1", "br10", "br20", "br30", "br99", "router"],
        edgeIds: ["veth-host1--br10", "veth-host2--br20", "veth-guest--br30", "veth-mgmt--br99", "veth-r10--br10", "veth-r20--br20", "veth-r30--br30", "veth-r99--br99"],
        description: "Phase 3: Router namespace added. IP forwarding enabled. All hosts have a default route. All subnets can now reach each other freely — no firewall yet."
    },
    4: {
        nodeIds: ["host1", "host2", "guest1", "mgmt1", "br10", "br20", "br30", "br99", "router"],
        edgeIds: ["veth-host1--br10", "veth-host2--br20", "veth-guest--br30", "veth-mgmt--br99", "veth-r10--br10", "veth-r20--br20", "veth-r30--br30", "veth-r99--br99"],
        description: "Phase 4: ACL applied. Default FORWARD policy is DROP. Only permitted flows are: Management to anywhere, Users to Servers, and established return traffic. Guest is fully blocked."
    },
}

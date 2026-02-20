# VLAN Segmentation and Inter-VLAN Routing Lab (Linux-Based)

## Overview

This project implements VLAN-style network segmentation and inter-VLAN routing using native Linux networking primitives instead of physical networking hardware or network simulators.

The lab runs entirely inside a browser-based Linux environment (GitHub Codespaces) and demonstrates how Layer 2 switching, Layer 3 routing, and stateful firewall policies operate in a segmented network architecture.

The goal is to model enterprise-style network trust zones while building practical understanding of Linux networking and packet flow behavior.

---

## Objectives

This project demonstrates:

- OSI Layer 2 switching behavior
- Broadcast domain isolation
- OSI Layer 3 routing between subnets
- Default gateway behavior
- Network segmentation and trust zoning
- Stateful ACL enforcement
- Linux-based networking infrastructure concepts

The implementation mirrors networking concepts commonly used in:

- Enterprise networks
- Cloud VPC architectures
- Container networking

---

## Architecture

The lab simulates four network zones:

| Network     | Purpose             | Subnet           | Bridge | Router IP       |
|-------------|----------------------|------------------|--------|-----------------|
| Users       | Client network       | 192.168.10.0/24  | br10   | 192.168.10.1    |
| Servers     | Backend systems      | 192.168.20.0/24  | br20   | 192.168.20.1    |
| Guest       | Restricted network   | 192.168.30.0/24  | br30   | 192.168.30.1    |
| Management  | Admin network        | 192.168.99.0/24  | br99   | 192.168.99.1    |

Topology diagram:
```text
            (router namespace)
   ---------------------------------
      |        |        |        |
   10.1     20.1     30.1     99.1
      |        |        |        |
     br10     br20     br30     br99
      |        |        |        |
    host1    host2    guest1    mgmt1
```

---

## Concept Mapping

| Networking Concept | Linux Primitive                    |
| ------------------ | ---------------------------------- |
| Physical host      | Network namespace                  |
| Ethernet cable     | veth pair                          |
| Switch             | Linux bridge                       |
| VLAN               | Separate bridge (broadcast domain) |
| Router             | Namespace with IP forwarding       |
| ACL                | iptables `FORWARD` rules           |
| Default gateway    | Router interface IP                |

---

## Project Phases

**Phase 2 — Layer 2 Segmentation**

Creates isolated broadcast domains.

Components:
- Linux bridges (br10, br20, br30, br99)
- Host namespaces
- veth connections between hosts and bridges
- IP address assignment

Behavior:
- ARP works within each bridge
- Broadcast traffic remains isolated
- No inter-network communication possible

Equivalent to VLAN isolation at Layer 2.

**Phase 3 — Inter-VLAN Routing**

Adds Layer 3 routing between networks.

Components:
- Router namespace
- Router interfaces connected to each bridge
- Default gateways configured on hosts
- IPv4 forwarding enabled

Behavior:
- host1 → router → host2
- Inter-network communication becomes possible

Equivalent to router-on-a-stick or Layer 3 switch routing.

**Phase 4 — ACL Enforcement**

Implements stateful security boundaries between networks.

Firewall policy:
- Default FORWARD policy: DROP
- Allow ESTABLISHED,RELATED traffic
- Allow Users → Servers
- Allow Management → Anywhere
- Block Guest → Internal networks

Behavior:

| Source                | Destination        | Result  |
| --------------------- | ------------------ | ------- |
| Users → Servers       | Servers subnet     | Allowed |
| Servers → Users (new) | Users subnet       | Blocked |
| Mgmt → Any            | Any subnet         | Allowed |
| Guest → Internal      | Users/Servers/Mgmt | Blocked |
| Reply traffic         | Return flows       | Allowed |

Stateful behavior implemented using conntrack.

---

## Repository Structure
```text
scripts/
├── phase2.sh     # Layer 2 topology creation
├── phase3.sh     # Router and inter-VLAN routing
├── acl.sh        # Firewall rules
├── clean.sh      # Environment teardown
└── run_lab.sh    # Full lab execution
```

---

## Running the Lab

From the repository root:
```bash
chmod +x scripts/*.sh
sudo ./scripts/run_lab.sh
```

This performs the following sequence: clean → phase2 → phase3 → acl

---

## Verification Examples

Example validation commands:
```bash
ip netns exec host1 ping 192.168.20.2
ip netns exec guest1 ping 192.168.20.2
ip netns exec router iptables -L -v
ip netns exec router conntrack -L
```

Expected results:
- Users → Servers succeeds
- Guest → internal networks blocked
- Management → all networks succeeds
- Reply traffic allowed via state tracking

---

## Visualizer

The `visualiser/` directory contains an interactive React web app that makes the lab topology visible and educational.

### Features

- **Topology Canvas** — Live React Flow diagram of all namespaces, bridges, and veth connections
- **Phase Toggle** — Switch between Phase 2, 3, and 4 to watch nodes and edges appear and disappear
- **Node Inspector** — Click any node to see its interfaces, IP addresses, and plain English description
- **ACL Inspector** — Phase 4 shows the full iptables FORWARD chain with each rule explained
- **Packet Simulator** — Pick a source, destination, and protocol, send a packet, and see which ACL rule matched and whether it was accepted or dropped
- **Concepts Panel** — Persistent Linux primitive → real networking gear reference

### Tech Stack

| Tool | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| React Flow | Network topology diagram |
| Zustand | UI state management |

### Running the Visualizer
```bash
cd visualiser
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Visualizer Structure
```text
visualiser/
└── src/
    ├── data/
    │   └── topology.ts         # Source of truth — all nodes, edges, ACL rules, phases
    ├── store/
    │   └── labStore.ts         # Zustand state — phase, selection, packet simulation
    ├── components/
    │   ├── TopologyCanvas.tsx  # React Flow canvas
    │   ├── NetworkNode.tsx     # Custom namespace node
    │   ├── BridgeNode.tsx      # Custom bridge node
    │   ├── PhaseToggle.tsx     # Phase 2/3/4 control
    │   ├── AclInspector.tsx    # ACL rules sidebar
    │   ├── PacketSimulator.tsx # Packet send and ACL match UI
    │   ├── NodeInspector.tsx   # Click-to-inspect node detail
    │   └── ConceptsPanel.tsx   # Linux → real network reference
    └── utils/
        └── matchAcl.ts         # Pure ACL evaluation logic
```


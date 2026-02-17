#!/usr/bin/env bash
# scripts/phase2.sh
#
# Phase 2 — Layer 2 Segmentation (VLAN Equivalent)
#
# Builds isolated broadcast domains using Linux bridges:
#   br10 = Users VLAN-like domain (192.168.10.0/24)
#   br20 = Servers VLAN-like domain (192.168.20.0/24)
#   br30 = Guest VLAN-like domain (192.168.30.0/24)
#   br99 = Mgmt VLAN-like domain  (192.168.99.0/24)
#
# Creates namespaces (hosts) and connects each host to its bridge via a veth pair:
#   host1  -> br10 via veth-host1 / veth-host1-br
#   host2  -> br20 via veth-host2 / veth-host2-br
#   guest1 -> br30 via veth-guest / veth-guest-br
#   mgmt1  -> br99 via veth-mgmt  / veth-mgmt-br
#
# Expected behavior after this phase (no router yet):
# - Hosts can ping within their own broadcast domain (only their own gateway if later added)
# - Inter-VLAN pings fail (separate bridges = separate broadcast domains)
#
# NOTE: This script assumes you run scripts/clean.sh before re-running.

set -euo pipefail
# set -e: exit immediately if a command fails
# set -u: treat unset variables as errors
# set -o pipefail: fail a pipeline if any command fails

need_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "Missing command: $1" >&2; exit 1; }; }
# Helper: verify required commands exist.

need_cmd ip

# --- Create bridges (each bridge = one VLAN-like broadcast domain) ---

sudo ip link add br10 type bridge
# Creates a Linux bridge device named br10 (acts like an L2 switch for that VLAN domain).

sudo ip link add br20 type bridge
# Creates bridge br20 (separate broadcast domain from br10).

sudo ip link add br30 type bridge
# Creates bridge br30 (guest network broadcast domain).

sudo ip link add br99 type bridge
# Creates bridge br99 (management network broadcast domain).

sudo ip link set br10 up
# Brings br10 administratively UP so it can forward frames.

sudo ip link set br20 up
# Brings br20 UP.

sudo ip link set br30 up
# Brings br30 UP.

sudo ip link set br99 up
# Brings br99 UP.

# --- Create host namespaces (each namespace = an isolated "host") ---

sudo ip netns add host1
# Creates network namespace "host1" (separate network stack: interfaces, routes, ARP table).

sudo ip netns add host2
# Creates namespace "host2".

sudo ip netns add guest1
# Creates namespace "guest1".

sudo ip netns add mgmt1
# Creates namespace "mgmt1".

# --- Create veth pairs (each veth pair = a virtual Ethernet cable) ---

sudo ip link add veth-host1 type veth peer name veth-host1-br
# Creates a veth pair:
# - veth-host1      will be moved into host1 namespace (host NIC)
# - veth-host1-br   stays in root namespace and plugs into br10

sudo ip link add veth-host2 type veth peer name veth-host2-br
# Creates veth pair for host2 <-> br20

sudo ip link add veth-guest type veth peer name veth-guest-br
# Creates veth pair for guest1 <-> br30

sudo ip link add veth-mgmt type veth peer name veth-mgmt-br
# Creates veth pair for mgmt1 <-> br99

# --- Move host-side veth endpoints into their namespaces ---

sudo ip link set veth-host1 netns host1
# Moves veth-host1 into the host1 namespace (the host1 "NIC").

sudo ip link set veth-host2 netns host2
# Moves veth-host2 into host2.

sudo ip link set veth-guest netns guest1
# Moves veth-guest into guest1.

sudo ip link set veth-mgmt netns mgmt1
# Moves veth-mgmt into mgmt1.

# --- Attach bridge-side endpoints to the correct bridges (switch ports) ---

sudo ip link set veth-host1-br master br10
# Connects veth-host1-br as a port on br10.

sudo ip link set veth-host2-br master br20
# Connects veth-host2-br as a port on br20.

sudo ip link set veth-guest-br master br30
# Connects veth-guest-br as a port on br30.

sudo ip link set veth-mgmt-br master br99
# Connects veth-mgmt-br as a port on br99.

# --- Bring up bridge-side endpoints in root namespace ---

sudo ip link set veth-host1-br up
# Enables the br10 port for host1.

sudo ip link set veth-host2-br up
# Enables the br20 port for host2.

sudo ip link set veth-guest-br up
# Enables the br30 port for guest1.

sudo ip link set veth-mgmt-br up
# Enables the br99 port for mgmt1.

# --- Configure interfaces inside each namespace (IP + link up) ---

sudo ip netns exec host1 ip link set lo up
# Brings up loopback interface in host1 (many tools assume lo is up).

sudo ip netns exec host1 ip addr add 192.168.10.2/24 dev veth-host1
# Assigns host1 an IP address in Users subnet.

sudo ip netns exec host1 ip link set veth-host1 up
# Brings up the host1 NIC.

sudo ip netns exec host2 ip link set lo up
# Brings up loopback in host2.

sudo ip netns exec host2 ip addr add 192.168.20.2/24 dev veth-host2
# Assigns host2 an IP in Servers subnet.

sudo ip netns exec host2 ip link set veth-host2 up
# Brings up host2 NIC.

sudo ip netns exec guest1 ip link set lo up
# Brings up loopback in guest1.

sudo ip netns exec guest1 ip addr add 192.168.30.2/24 dev veth-guest
# Assigns guest1 an IP in Guest subnet.

sudo ip netns exec guest1 ip link set veth-guest up
# Brings up guest1 NIC.

sudo ip netns exec mgmt1 ip link set lo up
# Brings up loopback in mgmt1.

sudo ip netns exec mgmt1 ip addr add 192.168.99.2/24 dev veth-mgmt
# Assigns mgmt1 an IP in Mgmt subnet.

sudo ip netns exec mgmt1 ip link set veth-mgmt up
# Brings up mgmt1 NIC.

echo "Phase 2 complete: created br10/br20/br30/br99 and host namespaces."
echo "Verify:"
echo "  sudo ip netns list"
echo "  sudo ip link | egrep 'br10|br20|br30|br99'"
echo "  sudo bridge link"

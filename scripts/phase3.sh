#!/usr/bin/env bash
# scripts/phase3.sh
#
# Phase 3 — Inter-VLAN Routing (Router Namespace)
#
# Adds a "router" namespace and connects it to each VLAN bridge using veth pairs.
# This provides default gateways for each subnet and enables IPv4 forwarding.
#
# Bridges expected from Phase 2:
#   br10 (Users)   192.168.10.0/24
#   br20 (Servers) 192.168.20.0/24
#   br30 (Guest)   192.168.30.0/24
#   br99 (Mgmt)    192.168.99.0/24
#
# Host namespaces expected from Phase 2:
#   host1, host2, guest1, mgmt1
#
# NOTE: Run scripts/clean.sh before re-running.

set -euo pipefail
# set -e: exit on any non-zero command
# set -u: error on unset vars
# set -o pipefail: fail pipeline if any command fails

# --- Codespaces/container fix ---
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null
# Disables iptables filtering of bridged IPv4 frames via bridge netfilter.
# In some container environments, bridged traffic can be unexpectedly filtered/dropped otherwise.

sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null
# Same as above, but for bridged IPv6 frames.

# --- Create router namespace ---
sudo ip netns add router
# Creates network namespace "router" which will act as an L3 router.

# --- Create router-to-bridge "cables" (veth pairs) ---
sudo ip link add veth-r10 type veth peer name veth-r10-br
# Creates a veth pair for Users VLAN:
# - veth-r10     goes into router namespace (router interface)
# - veth-r10-br  stays in root namespace and plugs into br10

sudo ip link add veth-r20 type veth peer name veth-r20-br
# Creates veth pair for Servers VLAN.

sudo ip link add veth-r30 type veth peer name veth-r30-br
# Creates veth pair for Guest VLAN.

sudo ip link add veth-r99 type veth peer name veth-r99-br
# Creates veth pair for Mgmt VLAN.

# --- Move router ends into router namespace ---
sudo ip link set veth-r10 netns router
# Moves the router-side interface for Users into the router namespace.

sudo ip link set veth-r20 netns router
# Moves router-side interface for Servers into router.

sudo ip link set veth-r30 netns router
# Moves router-side interface for Guest into router.

sudo ip link set veth-r99 netns router
# Moves router-side interface for Mgmt into router.

# --- Attach bridge ends to the correct bridges (switch ports) ---
sudo ip link set veth-r10-br master br10
# Connects veth-r10-br as a port on br10 (Users switch).

sudo ip link set veth-r20-br master br20
# Connects veth-r20-br as a port on br20 (Servers switch).

sudo ip link set veth-r30-br master br30
# Connects veth-r30-br as a port on br30 (Guest switch).

sudo ip link set veth-r99-br master br99
# Connects veth-r99-br as a port on br99 (Mgmt switch).

# --- Bring up bridge-side endpoints (root namespace) ---
sudo ip link set veth-r10-br up
# Enables the br10 "port" that connects to the router.

sudo ip link set veth-r20-br up
# Enables the br20 router port.

sudo ip link set veth-r30-br up
# Enables the br30 router port.

sudo ip link set veth-r99-br up
# Enables the br99 router port.

# --- Configure router interfaces: IPs + link up ---
sudo ip netns exec router ip link set lo up
# Brings up loopback inside router namespace.

sudo ip netns exec router ip link set veth-r10 up
# Brings up router's Users interface.

sudo ip netns exec router ip link set veth-r20 up
# Brings up router's Servers interface.

sudo ip netns exec router ip link set veth-r30 up
# Brings up router's Guest interface.

sudo ip netns exec router ip link set veth-r99 up
# Brings up router's Mgmt interface.

sudo ip netns exec router ip addr add 192.168.10.1/24 dev veth-r10
# Assigns router's Users default gateway IP.

sudo ip netns exec router ip addr add 192.168.20.1/24 dev veth-r20
# Assigns router's Servers default gateway IP.

sudo ip netns exec router ip addr add 192.168.30.1/24 dev veth-r30
# Assigns router's Guest default gateway IP.

sudo ip netns exec router ip addr add 192.168.99.1/24 dev veth-r99
# Assigns router's Mgmt default gateway IP.

# --- Enable IPv4 forwarding (routing) ---
sudo ip netns exec router sysctl -w net.ipv4.ip_forward=1 >/dev/null
# Enables kernel routing between interfaces in the router namespace.

# --- Keep forwarding open for now (ACL phase will lock this down) ---
sudo ip netns exec router iptables -P FORWARD ACCEPT
# Sets default FORWARD policy to ACCEPT so routing works before ACL rules are applied.

sudo ip netns exec router iptables -F
# Flushes existing filter rules so nothing unexpected blocks routing.

# --- Add default routes on hosts so they can reach other subnets ---
sudo ip netns exec host1 ip route replace default via 192.168.10.1
# Sets host1 default gateway to router Users interface.

sudo ip netns exec host2 ip route replace default via 192.168.20.1
# Sets host2 default gateway to router Servers interface.

sudo ip netns exec guest1 ip route replace default via 192.168.30.1
# Sets guest1 default gateway to router Guest interface.

sudo ip netns exec mgmt1 ip route replace default via 192.168.99.1
# Sets mgmt1 default gateway to router Mgmt interface.

echo "Phase 3 complete: router connected to br10/br20/br30/br99 with IP forwarding enabled."
echo "Next: run scripts/acl.sh to enforce segmentation policy."

#!/usr/bin/env bash
set -euo pipefail

# Codespaces/container fix: disable bridge netfilter so bridging doesn't get filtered by iptables
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null

# Create router namespace
sudo ip netns add router

# Create router cables
sudo ip link add veth-r10 type veth peer name veth-r10-br
sudo ip link add veth-r20 type veth peer name veth-r20-br

# Move router ends into router namespace
sudo ip link set veth-r10 netns router
sudo ip link set veth-r20 netns router

# Attach bridge ends to the correct bridges
sudo ip link set veth-r10-br master br10
sudo ip link set veth-r20-br master br20
sudo ip link set veth-r10-br up
sudo ip link set veth-r20-br up

# Configure router IPs (default gateways)
sudo ip netns exec router ip addr add 192.168.10.1/24 dev veth-r10
sudo ip netns exec router ip addr add 192.168.20.1/24 dev veth-r20
sudo ip netns exec router ip link set veth-r10 up
sudo ip netns exec router ip link set veth-r20 up
sudo ip netns exec router ip link set lo up

# Enable IPv4 forwarding (routing)
sudo ip netns exec router sysctl -w net.ipv4.ip_forward=1 >/dev/null

# Make sure router isn't blocking forwarding (keep open for now; we'll lock down in ACL phase)
sudo ip netns exec router iptables -P FORWARD ACCEPT
sudo ip netns exec router iptables -F

# Add default routes on hosts
sudo ip netns exec host1 ip route add default via 192.168.10.1
sudo ip netns exec host2 ip route add default via 192.168.20.1

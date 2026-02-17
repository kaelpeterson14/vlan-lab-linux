#!/usr/bin/env bash
set -euo pipefail

# Create two VLAN-equivalent L2 networks (bridges)
sudo ip link add br10 type bridge
sudo ip link add br20 type bridge
sudo ip link set br10 up
sudo ip link set br20 up

# Create hosts
sudo ip netns add host1
sudo ip netns add host2

# Create virtual cables
sudo ip link add veth1 type veth peer name vethbr-1
sudo ip link add veth2 type veth peer name vethbr-2

# Connect host ends into namespaces
sudo ip link set veth1 netns host1
sudo ip link set veth2 netns host2

# Connect bridge ends to bridges
sudo ip link set vethbr-1 master br10
sudo ip link set vethbr-2 master br20
sudo ip link set vethbr-1 up
sudo ip link set vethbr-2 up

# Configure IPs + bring up interfaces
sudo ip netns exec host1 ip addr add 192.168.10.2/24 dev veth1
sudo ip netns exec host1 ip link set veth1 up
sudo ip netns exec host1 ip link set lo up

sudo ip netns exec host2 ip addr add 192.168.20.2/24 dev veth2
sudo ip netns exec host2 ip link set veth2 up
sudo ip netns exec host2 ip link set lo up


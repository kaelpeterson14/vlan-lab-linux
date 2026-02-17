#!/usr/bin/env bash
set -euo pipefail

# Delete namespaces (ignore errors if they don't exist)
for ns in host1 host2 router; do
  sudo ip netns del "$ns" 2>/dev/null || true
done

# Delete bridges
for br in br10 br20 br30 br99 br0; do
  sudo ip link del "$br" 2>/dev/null || true
done

# Delete leftover veth interfaces (names used in our lab)
for v in veth1 veth2 vethbr-1 vethbr-2 veth-r10 veth-r20 veth-r10-br veth-r20-br; do
  sudo ip link del "$v" 2>/dev/null || true
done


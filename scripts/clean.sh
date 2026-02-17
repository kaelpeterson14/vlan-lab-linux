#!/usr/bin/env bash
# scripts/clean.sh
#
# Removes all lab artifacts so you can re-run Phase 2/3/ACL scripts cleanly.
# - Deletes namespaces (hosts + router)
# - Deletes bridges (broadcast domains)
# - Deletes any leftover veth interfaces (virtual cables) that might still exist
#
# Safe to run multiple times: errors are ignored when objects don't exist.

set -euo pipefail
# set -e: exit on non-zero command (we override with "|| true" where deletion may fail)
# set -u: error on unset vars
# set -o pipefail: fail pipeline if any command in a pipeline fails

# --- Delete namespaces (ignore errors if they don't exist) ---
for ns in host1 host2 guest1 mgmt1 router; do
  sudo ip netns del "$ns" 2>/dev/null || true
  # ip netns del <ns> removes the network namespace and everything inside it
  # (interfaces, routes, ARP cache, iptables state within that namespace).
done

# --- Delete bridges (ignore errors if they don't exist) ---
for br in br10 br20 br30 br99 br0; do
  sudo ip link del "$br" 2>/dev/null || true
  # ip link del <br> deletes the interface device entirely.
  # For a bridge, this removes the L2 broadcast domain and its attached ports.
done

# --- Delete leftover veth interfaces (ignore errors if they don't exist) ---
# NOTE: If a veth endpoint was moved into a namespace, deleting the namespace above
# usually deletes it automatically. This is mainly for cleanup after partial runs.
for v in \
  veth-host1-br veth-host2-br veth-guest-br veth-mgmt-br \
  veth-r10-br veth-r20-br veth-r30-br veth-r99-br; do
  sudo ip link del "$v" 2>/dev/null || true
  # ip link del <veth> deletes that interface endpoint.
  # Deleting one end of a veth pair typically deletes the peer as well.
done

echo "Cleanup complete."
echo "You can now run: sudo bash scripts/phase2.sh && sudo bash scripts/phase3.sh && sudo bash scripts/acl.sh"

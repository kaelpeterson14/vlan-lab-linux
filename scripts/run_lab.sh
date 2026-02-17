#!/usr/bin/env bash
# scripts/run_lab.sh
#
# Runs the full lab end-to-end:
# 1) Clean (optional, controlled by CLEAN=1)
# 2) Phase 2 (L2 VLAN-like segmentation)
# 3) Phase 3 (router + inter-VLAN routing)
# 4) ACL (stateful firewall policy)
#
# Usage:
#   sudo bash scripts/run_lab.sh
#   CLEAN=0 sudo bash scripts/run_lab.sh   # skip cleanup

set -euo pipefail
# set -e: exit on error
# set -u: error on unset variables
# set -o pipefail: fail pipelines if any command fails

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Resolves the repository root directory regardless of where the script is run from.

CLEAN="${CLEAN:-1}"
# If CLEAN=1 (default), run scripts/clean.sh first to avoid "already exists" errors.

# IMPORTANT for Codespaces (bridge filtering)
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null
# Disables iptables filtering of bridged IPv4 frames (avoids unexpected drops in container environments).

sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null
# Disables ip6tables filtering of bridged IPv6 frames.

if [[ "${CLEAN}" == "1" ]]; then
  sudo bash "${ROOT_DIR}/scripts/clean.sh"
  # Deletes existing namespaces/bridges/veth so the run is deterministic.
fi

sudo bash "${ROOT_DIR}/scripts/phase2.sh"
# Builds L2 broadcast domains (bridges) and host namespaces + veth attachments.

sudo bash "${ROOT_DIR}/scripts/phase3.sh"
# Builds router namespace, connects router to each bridge, enables IP forwarding,
# and installs host default routes.

sudo bash "${ROOT_DIR}/scripts/acl.sh"
# Applies stateful ACL policy in router namespace (default deny + allow rules).

echo "Run complete."
echo "Quick checks:"
echo "  ip netns list"
echo "  sudo ip netns exec host1 ping -c 1 192.168.20.2"
echo "  sudo ip netns exec guest1 ping -c 1 192.168.10.2  # should fail"
echo "  sudo ip netns exec mgmt1  ping -c 1 192.168.10.2  # should work"

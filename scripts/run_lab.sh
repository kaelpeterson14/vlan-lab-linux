#!/usr/bin/env bash
# scripts/run_lab.sh
# Runs the build scripts and then applies the ACL.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# IMPORTANT for Codespaces (bridge filtering)
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0

sudo bash "${ROOT_DIR}/scripts/phase2.sh"
sudo bash "${ROOT_DIR}/scripts/phase3.sh"
sudo bash "${ROOT_DIR}/scripts/acl.sh"


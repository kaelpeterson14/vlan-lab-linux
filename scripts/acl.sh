#!/usr/bin/env bash
# scripts/acl.sh
#
# Applies a stateful inter-subnet ACL in the router namespace:
# - Default deny forwarding
# - Allow Users -> Servers
# - Allow Mgmt -> Anywhere
# - Allow RELATED/ESTABLISHED return traffic
# - (Guest has no allow rule by default -> blocked from initiating)
#
# Assumptions:
# - Namespaces exist and routing is already configured (phase3)
# - Router namespace name defaults to "router"

set -euo pipefail
# set -e: exit immediately if a command fails
# set -u: treat unset variables as errors
# set -o pipefail: fail a pipeline if any command fails

ROUTER_NS="${ROUTER_NS:-router}"
# Router namespace to execute iptables/sysctl inside. Can override with ROUTER_NS=...

USERS_CIDR="${USERS_CIDR:-192.168.10.0/24}"
SERVERS_CIDR="${SERVERS_CIDR:-192.168.20.0/24}"
GUEST_CIDR="${GUEST_CIDR:-192.168.30.0/24}"
MGMT_CIDR="${MGMT_CIDR:-192.168.99.0/24}"
# CIDR blocks for each network. Guest is defined for completeness but not allowed by default.

ALLOW_ICMP="${ALLOW_ICMP:-1}"
# If 1, adds ICMP allow rules for Users->Servers (useful for demo pings).
# Mgmt->Anywhere is already allowed regardless.

RESET="${RESET:-1}"
# If 1, flushes existing rules/chains in the router namespace before applying policy.

die() { echo "Error: $*" >&2; exit 1; }
# Helper: print error to stderr and exit non-zero.

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"; }
# Helper: verifies a command exists in PATH.

need_cmd ip
need_cmd iptables
# Ensures required tools exist before proceeding.

ip netns list | awk '{print $1}' | grep -qx "${ROUTER_NS}" || die "Namespace '${ROUTER_NS}' not found"
# Lists network namespaces, extracts the name column, and ensures ROUTER_NS exists.

ip netns exec "${ROUTER_NS}" sysctl -q -w net.ipv4.ip_forward=1 >/dev/null || die "Failed to enable IP forwarding"
# Runs sysctl inside the router namespace:
# - Enables IPv4 forwarding so the router can route between subnets.

if [[ "${RESET}" == "1" ]]; then
  ip netns exec "${ROUTER_NS}" iptables -F
  # Flushes all rules in the default "filter" table (INPUT/OUTPUT/FORWARD).

  ip netns exec "${ROUTER_NS}" iptables -t nat -F
  # Flushes NAT table rules (not required for this lab, but clears old NAT state if present).

  ip netns exec "${ROUTER_NS}" iptables -t mangle -F
  # Flushes mangle table rules (packet alteration/QoS markings). Keeps environment clean.

  ip netns exec "${ROUTER_NS}" iptables -X
  # Deletes any user-defined chains in the filter table.
fi

ip netns exec "${ROUTER_NS}" iptables -P INPUT ACCEPT
# Sets default policy for packets destined to the router itself to ACCEPT.

ip netns exec "${ROUTER_NS}" iptables -P OUTPUT ACCEPT
# Sets default policy for packets originating from the router itself to ACCEPT.

ip netns exec "${ROUTER_NS}" iptables -P FORWARD DROP
# Sets default policy for packets being routed THROUGH the router to DROP (default deny between VLANs).

ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
  -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
# Appends a FORWARD rule that allows:
# - ESTABLISHED: packets that belong to an existing allowed connection (return traffic)
# - RELATED: packets related to an allowed connection (some protocols open secondary flows)
# This is what makes the ACL "stateful."

ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
  -s "${MGMT_CIDR}" -j ACCEPT
# Allows ANY new forwarded flows originating from the management subnet to ANY destination.
# This makes Mgmt a privileged zone.

ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
  -s "${USERS_CIDR}" -d "${SERVERS_CIDR}" -j ACCEPT
# Allows Users subnet to initiate new forwarded flows to the Servers subnet.
# Servers initiating NEW flows back to Users will still be dropped (unless Mgmt or established).

if [[ "${ALLOW_ICMP}" == "1" ]]; then
  ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
    -p icmp --icmp-type echo-request -s "${USERS_CIDR}" -d "${SERVERS_CIDR}" -j ACCEPT
  # Explicitly allows ICMP echo-request (ping) from Users to Servers.
  # (Often redundant because the Users->Servers allow rule already permits it, but useful for clarity.)

  ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
    -p icmp --icmp-type echo-reply -s "${SERVERS_CIDR}" -d "${USERS_CIDR}" -j ACCEPT
  # Explicitly allows ICMP echo-reply from Servers to Users.
  # (Also typically covered by ESTABLISHED, but again useful for demo clarity.)
fi

echo "ACL applied in namespace '${ROUTER_NS}':"
# Prints a label so you can see where the output below is coming from.

ip netns exec "${ROUTER_NS}" iptables -L FORWARD -v -n
# Lists FORWARD chain rules with:
# -v: packet/byte counters (shows what matched)
# -n: numeric output (no DNS lookups, faster/cleaner)

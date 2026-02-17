#!/usr/bin/env bash
# scripts/acl.sh
#
# Applies a stateful inter-subnet ACL in the "router" namespace:
# - Default deny forwarding
# - Allow Users (192.168.10.0/24) -> Servers (192.168.20.0/24)
# - Allow RELATED/ESTABLISHED return traffic
#
# Assumptions:
# - You already created namespaces/links/bridges and configured IPs/routes
# - Namespace names: host1, host2, router
# - Subnets: users=192.168.10.0/24, servers=192.168.20.0/24

set -euo pipefail

ROUTER_NS="${ROUTER_NS:-router}"

USERS_CIDR="${USERS_CIDR:-192.168.10.0/24}"
SERVERS_CIDR="${SERVERS_CIDR:-192.168.20.0/24}"

# If you want to allow ping between subnets even when default-deny is set,
# keep this as "1". Set to "0" to not add ICMP-specific rules.
ALLOW_ICMP="${ALLOW_ICMP:-1}"

# Whether to reset (flush) rules before applying.
RESET="${RESET:-1}"

die() { echo "Error: $*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"; }

need_cmd ip
need_cmd iptables

# Check router namespace exists
ip netns list | awk '{print $1}' | grep -qx "${ROUTER_NS}" || die "Namespace '${ROUTER_NS}' not found"

# Ensure forwarding is enabled inside router namespace
ip netns exec "${ROUTER_NS}" sysctl -q -w net.ipv4.ip_forward=1 >/dev/null || die "Failed to enable IP forwarding"

# Apply firewall rules inside router namespace
if [[ "${RESET}" == "1" ]]; then
  ip netns exec "${ROUTER_NS}" iptables -F
  ip netns exec "${ROUTER_NS}" iptables -t nat -F
  ip netns exec "${ROUTER_NS}" iptables -t mangle -F
  ip netns exec "${ROUTER_NS}" iptables -X
fi

# Set default policies: allow local traffic, deny forward
ip netns exec "${ROUTER_NS}" iptables -P INPUT ACCEPT
ip netns exec "${ROUTER_NS}" iptables -P OUTPUT ACCEPT
ip netns exec "${ROUTER_NS}" iptables -P FORWARD DROP

# Allow established/related return traffic
ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
  -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# Allow Users -> Servers (new flows)
ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
  -s "${USERS_CIDR}" -d "${SERVERS_CIDR}" -j ACCEPT

# Optional: allow ICMP explicitly (sometimes helpful for demos)
if [[ "${ALLOW_ICMP}" == "1" ]]; then
  # Echo-request Users -> Servers
  ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
    -p icmp --icmp-type echo-request -s "${USERS_CIDR}" -d "${SERVERS_CIDR}" -j ACCEPT
  # Echo-reply Servers -> Users (will also be covered by ESTABLISHED, but explicit can aid clarity)
  ip netns exec "${ROUTER_NS}" iptables -A FORWARD \
    -p icmp --icmp-type echo-reply -s "${SERVERS_CIDR}" -d "${USERS_CIDR}" -j ACCEPT
fi

echo "ACL applied in namespace '${ROUTER_NS}':"
ip netns exec "${ROUTER_NS}" iptables -L FORWARD -v -n


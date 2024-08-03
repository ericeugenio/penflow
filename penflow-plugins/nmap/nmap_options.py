import dataclasses
import enum

from . import exceptions, utils


class TargetType(enum.StrEnum):
    IPv4 = "ipv4"
    IPv6 = "ipv6"
    IPv4NETWORK = "ipv4_network"
    IPv6NETWORK = "ipv6_network"
    HOSTNAME = "hostname"


class PortScanTechnique(enum.StrEnum):
    DISABLED = "Disabled"
    TCP_SYN = "TCP SYN Scan"
    TCP_ACK = "TCP ACK Scan"
    TCP_CONNECT = "TCP Connect Scan"


class HostDiscoverTechnique(enum.StrEnum):
    TCP_SYN_PING = "TCP SYN Ping"
    TCP_ACK_PING = "TCP ACK Ping"
    UDP_PING = "UDP Ping"
    ICMP_PING = "ICMP Ping"


@dataclasses.dataclass
class NmapOptions:
    target: tuple[str, TargetType]
    port_ranges: str | None = None
    port_scan_technique: PortScanTechnique | None = None
    host_discovery_technique: HostDiscoverTechnique | None = None
    os_detection: bool = False
    dns_resolution: bool = False

    def __post_init__(self):
        self._validate()

    def _validate(self):
        self._validate_target()

        if self.port_ranges is not None:
            self._validate_port_ranges()

        try:
            if self.port_scan_technique is not None:
                self.port_scan_technique = PortScanTechnique(self.port_scan_technique)
            if self.host_discovery_technique is not None:
                self.host_discovery_technique = HostDiscoverTechnique(self.host_discovery_technique)
        except ValueError as e:
            raise exceptions.NmapRuntimeException(f"Invalid technique ${e}")

        if self.host_discovery_technique is not None:
            self.host_discovery_technique = HostDiscoverTechnique(self.host_discovery_technique)

    def _validate_target(self):
        target, target_type = self.target
        match target_type:
            case TargetType.IPv4: utils.validate_ipv4(target)
            case TargetType.IPv4NETWORK: utils.validate_ipv4_network(target)

    def _validate_port_ranges(self):
        utils.validate_port_ranges(self.port_ranges)
from typing import Self
import enum

from . import utils
from .nmap_options import NmapOptions, TargetType, HostDiscoverTechnique, PortScanTechnique


class NmapCommandBuilder:

    def __init__(self):
        self._command: str = ""
        self._target: str | None = None

    def reset(self) -> Self:
        self._command = "nmap"
        return self

    def set_target(self, target: str, target_type: TargetType) -> Self:
        match target_type:
            case TargetType.IPv4: utils.validate_ipv4(target)
            case TargetType.IPv4NETWORK: utils.validate_ipv4_network(target)
        self._target = target
        return self

    def set_port_ranges(self, port_ranges: str) -> Self:
        clean_port_ranges = port_ranges.replace(" ", "")
        utils.validate_port_ranges(clean_port_ranges)
        self._command += f" -p {clean_port_ranges}"
        return self

    def set_port_scan_technique(self, port_scan_technique: str) -> Self:
        port_scan_technique_map = {
            PortScanTechnique.DISABLED: "-sn",
            PortScanTechnique.TCP_SYN: "-sS",
            PortScanTechnique.TCP_ACK: "-sA",
            PortScanTechnique.TCP_CONNECT: "-sT"
        }
        try:
            index = PortScanTechnique(port_scan_technique)
        except ValueError:
            # TODO: Raise Nmap exception
            raise ValueError("Invalid port scan technique")
        else:
            self._command += f" {port_scan_technique_map[index]}"
            return self

    def set_host_discovery_technique(self, host_discovery_technique: str) -> Self:
        host_discovery_technique_map = {
            HostDiscoverTechnique.TCP_SYN_PING: "-PS",
            HostDiscoverTechnique.TCP_ACK_PING: "-PA",
            HostDiscoverTechnique.UDP_PING: "-PU",
            HostDiscoverTechnique.ICMP_PING: "-PE"
        }
        try:
            index = HostDiscoverTechnique(host_discovery_technique)
        except ValueError:
            # TODO: Raise Nmap exception
            raise ValueError("Invalid port scan technique")
        else:

            self._command += f" {host_discovery_technique_map[index]}"
            return self

    def set_os_detection(self, enable: bool = True) -> Self:
        if enable:
            self._command += " -O"
        return self

    def set_dns_resolution(self, enable: bool = True) -> Self:
        if enable:
            self._command += " -n"
        return self

    def build(self) -> str:
        if self._target is None:
            # TODO: Raise Nmap exception
            raise ValueError("Invalid command, target is not set")
        return self._command + f" {self._target} -oX -"

    def build_from_options(self, options: NmapOptions) -> str:
        cmd_builder = (
            self.reset()
            .set_target(*options.target)
        )

        if options.port_ranges is not None:
            cmd_builder.set_port_ranges(options.port_ranges)
        if options.port_scan_technique is not None:
            cmd_builder.set_port_scan_technique(options.port_scan_technique)
        if options.host_discovery_technique is not None:
            cmd_builder.set_host_discovery_technique(options.host_discovery_technique)
        if options.os_detection:
            cmd_builder.set_os_detection()
        if options.dns_resolution:
            cmd_builder.set_dns_resolution()

        return cmd_builder.build()

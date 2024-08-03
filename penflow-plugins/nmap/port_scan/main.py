from typing import Any, override
import enum

from penflowexecutor.adapters import plugins
from penflowexecutor.models import plugins as plugins_models
from penflowexecutor.services import context

from nmap.nmap_client import NmapClient
from nmap.nmap_cmd_builder import NmapCommandBuilder
from nmap.nmap_options import PortScanTechnique, NmapOptions, TargetType


plugin_registry = plugins.PluginRegistry()


@plugin_registry.register("nmap.port_scan")
class NmapPortScan(plugins_models.RunnableTask):

    class Properties(enum.StrEnum):
        HOST = "host"  # Required
        PORTS = "ports"  # Required
        SCAN_TECHNIQUE = "scanTechnique"  # Optional, default TCP_SYN
        OS_DETECTION = "osDetection"  # Optional, default False

    def __init__(self, properties: dict[str, Any]):
        super().__init__()
        self._options = NmapOptions(
            target=(properties.get(self.Properties.HOST), TargetType.IPv4),
            port_ranges=properties.get(self.Properties.PORTS),
            port_scan_technique=properties.get(self.Properties.SCAN_TECHNIQUE, PortScanTechnique.TCP_SYN),
            os_detection=properties.get(self.Properties.OS_DETECTION, False),
        )

        self._client = NmapClient()

    @override
    def run(self, ctx: context.Context):
        output = {
            "address": self._options.target[0],
            "discoveredPorts": [],
            "os": "",
        }

        cmd = NmapCommandBuilder().build_from_options(self._options)
        self.add_step(cmd)
        host = next(iter(self._client.scan(cmd, options=self._options)), None)
        if host is not None:
            output["discoveredPorts"] = host.get("ports", [])
            output["os"] = max(host.get("os"), key=lambda os: os.get("accuracy")) if len(host.get("os")) > 0 else ""
        return output

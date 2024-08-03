from typing import Any, override
import enum

from penflowexecutor.adapters import plugins
from penflowexecutor.models import plugins as plugins_models
from penflowexecutor.services import context

from nmap.nmap_client import NmapClient
from nmap.nmap_cmd_builder import NmapCommandBuilder
from nmap.nmap_options import NmapOptions, TargetType, PortScanTechnique


plugin_registry = plugins.PluginRegistry()


@plugin_registry.register("nmap.host_discovery")
class NmapPortScan(plugins_models.RunnableTask):

    class Properties(enum.StrEnum):
        NETWORK = "network"  # Required
        DISCOVERY_TECHNIQUE = "discoveryTechnique"  # Required

    def __init__(self, properties: dict[str, Any]):
        super().__init__()
        self._options = NmapOptions(
            target=(properties.get(self.Properties.NETWORK), TargetType.IPv4NETWORK),
            host_discovery_technique=properties.get(self.Properties.DISCOVERY_TECHNIQUE),
            port_scan_technique=PortScanTechnique.DISABLED,
        )

        self._client = NmapClient()

    @override
    def run(self, ctx: context.Context):
        cmd = NmapCommandBuilder().build_from_options(self._options)
        self.add_step(cmd)
        hosts = self._client.scan(cmd, options=self._options)
        return {
            "upHosts": [host.get("ip") for host in hosts if host.get("ip") is not None],
        }

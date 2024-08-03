
from penflowexecutor import config
from penflowexecutor.adapters import plugins

plugins.load_plugins(config.get_plugins_path())
plugin_registry = plugins.PluginRegistry()

for item in plugin_registry.plugins.items():
    print(item)

properties = {
    "network": "192.168.0.0/24",
    "discoveryTechnique": "ICMP Ping",
}

port_scan = plugin_registry.plugins.get("nmap.host_discovery")(properties)
port_scan.run()




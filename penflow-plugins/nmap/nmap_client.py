import io
import shlex
import subprocess
import xml.etree.ElementTree as ET

from .nmap_options import NmapOptions, PortScanTechnique


class NmapClient:

    def __init__(self):
        self._options: NmapOptions | None = None

    def scan(self, command: str, options: NmapOptions):
        self._options = options
        try:
            process = subprocess.run(
                shlex.split(command),
                capture_output=True,
                check=True
            )
            return self._process_output(process.stdout)
        except FileNotFoundError as e:
            print(e)
        except subprocess.CalledProcessError as e:
            print(e.returncode)
            print(e.stderr)
            print(e.stdout)
        except subprocess.TimeoutExpired as e:
            print(e)

    def _process_output(self, output: bytes) -> list:
        hosts = []
        for event, element in ET.iterparse(io.BytesIO(output)):
            if element.tag == "host":
                host_mac = {}
                host_hostnames = []
                host_os = []
                host_ports = []

                addresses = element.findall("address")
                for address in addresses:
                    address_type = address.get("addrtype")
                    match address_type:
                        case "ipv4":
                            host_ip = address.get("addr")
                        case "mac":
                            host_mac = {
                                "address": address.get("addr"),
                                "vendor": address.get("vendor")
                            }

                hostnames = element.find("hostnames").findall("hostname")
                for hostname in hostnames:
                    host_hostnames.append({
                        "name": hostname.get("name"),
                        "type": hostname.get("type")
                    })

                if self._options.os_detection:
                    os_list = element.find("os").findall("osmatch")
                    for os_match in os_list:
                        cpe_list = [cpe.findtext("cpe") for cpe in os_match.findall("osclass")]
                        host_os.append({
                            "name": os_match.get("name"),
                            "accuracy": os_match.get("accuracy"),
                            "cpe": cpe_list
                        })

                if self._options.port_scan_technique != PortScanTechnique.DISABLED:
                    ports = element.find("ports").findall("port")
                    for port in ports:
                        host_ports.append({
                            "protocol": port.get("protocol"),
                            "port": port.get("portid"),
                            "state": port.find("state").get("state"),
                            "service": port.find("service").get("name")
                        })

                hosts.append({
                    "ip": host_ip,
                    "hostnames": host_hostnames,
                    "mac": host_mac,
                    "ports": host_ports,
                    "os": host_os
                })

                element.clear()
        return hosts

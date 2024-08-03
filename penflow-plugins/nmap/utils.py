import ipaddress
import re

from . import exceptions


def validate_ipv4(address: str):
    try:
        ipaddress.IPv4Address(address)
    except ipaddress.AddressValueError as e:
        raise exceptions.NmapRuntimeException(e)


def validate_ipv4_network(address):
    try:
        ipaddress.IPv4Network(address)
    except (ipaddress.AddressValueError, ipaddress.NetmaskValueError) as e:
        raise exceptions.NmapRuntimeException(e)


def validate_port_ranges(port_ranges_str: str):
    seen_ports = set()
    pattern = re.compile("^(\d{1,5}(-\d{1,5})?)(,(\d{1,5}(-\d{1,5})?))*$")  # 80; 1-1024; 21,53,80-100

    if not pattern.match(port_ranges_str):
        print("Invalid port ranges")
        # TODO: raise exception
        pass

    port_ranges = port_ranges_str.split(",")
    for port_range in port_ranges:
        if "-" in port_range:
            port_start, port_end = map(lambda p: int(p), port_range.split("-"))

            if port_start > 65535 or port_end > 65535:
                raise exceptions.NmapRuntimeException("Invalid port, bigger than 65535")
            if port_start > port_end:
                raise exceptions.NmapRuntimeException("Invalid range, start > end")
            for port in range(port_start, port_end + 1):
                if port in seen_ports:
                    raise exceptions.NmapRuntimeException("Invalid port, repeated")
                seen_ports.add(port)
        else:
            port = int(port_range)
            if port > 65535:
                raise exceptions.NmapRuntimeException("Invalid port, bigger than 65535")
            if port in seen_ports:
                raise exceptions.NmapRuntimeException("Invalid port, repeated")
            seen_ports.add(port)
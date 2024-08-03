import json
import uuid

import dotenv
import pika

from penflowexecutor.models import plugins, messages

config = dotenv.dotenv_values(".env")
host = config.get("RABBITMQ_HOST")
queue = config.get("RABBITMQ_SUB_QUEUE")

connection = pika.BlockingConnection(pika.ConnectionParameters(host=host))
channel = connection.channel()
channel.queue_declare(queue=queue, durable=True)

"""
HOST DISCOVERY
{
    "id": str(uuid.uuid4()),
    "displayName": "Discover network",
    "name": "nmap.host_discovery",
    "type": "runnable",
    "properties": {
        "network": "$network",
        "discoveryTechnique": "TCP SYN Ping"
    },
    "outputs": {
        "upHosts": ""
    }
}
"""

"""
PORT SCAN
{
    "id": str(uuid.uuid4()),
    "displayName": "Scan target ports",
    "name": "nmap.port_scan",
    "type": "runnable",
    "properties": {
        "host": "$target",
        "ports": "1000"
    },
    "outputs": {
        "hosts": "",
        "discoveredPorts": ""
    }
}
"""

"""
FOR EACH
{
    "id": str(uuid.uuid4()),
    "displayName": "For Each",
    "name": "core.control.loop.foreach",
    "type": "behavioral",
    "properties": {
        "list": "$hostList",
    },
    "outputs": {
        "index": "",
        "item": "target"
    },
    "subtasks": {
        "foreach": [
        ]
    }
}
"""

message = {
    "type": messages.MessageType.EXECUTE,
    "data": {
        "execution_id": "66a82628754d41efdc4cba7d",
        "flow": {
            "id": "66a62e2a5987c96073b18876",
            "name": "Test flow",
            "tasks": [
                {
                    "id": "66a6791dad6ff206c1410e7d",
                    "displayName": "Discover network",
                    "name": "nmap.host_discovery",
                    "type": "runnable",
                    "properties": {
                        "network": "$network",
                        "discoveryTechnique": "TCP SYN Ping"
                    },
                    "outputs": {
                        "upHosts": "hostList"
                    }
                },
                {
                    "id": "66a6791662c15dcafeadaaa0",
                    "displayName": "For Each",
                    "name": "core.control.loop.foreach",
                    "type": "behavioral",
                    "properties": {
                        "list": "$hostList",
                    },
                    "outputs": {
                        "index": "",
                        "item": "target"
                    },
                    "subtasks": {
                        "foreach": [
                            {
                                "id": "66a679275eafe6ddaac1c67d",
                                "displayName": "Scan target ports",
                                "name": "nmap.port_scan",
                                "type": "runnable",
                                "properties": {
                                    "host": "$target",
                                    "ports": "80,443",
                                    "scanTechnique": "TCP ACK Scan",
                                    "osDetection": True
                                },
                                "outputs": {
                                    "hosts": "",
                                    "discoveredPorts": ""
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "arguments": {
            "network": "192.168.1.0/30",
            # "target": "192.168.0.1"
        }
    }
}

channel.basic_publish(
    exchange='',
    routing_key=queue,
    body=json.dumps(message),
    properties=pika.BasicProperties(
        delivery_mode=pika.DeliveryMode.Persistent
    ))

connection.close()

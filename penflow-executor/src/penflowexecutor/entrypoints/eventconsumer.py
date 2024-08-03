""""""
from typing import cast
import json
import multiprocessing
import os
import signal

from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
import pika

from penflowexecutor import config, bootstrap, exceptions
from penflowexecutor.models import messages
from penflowexecutor.services import handlers


DEFAULT_HOST = config.get_mq_host()
""""""
DEFAULT_QUEUE = config.get_mq_sub().get("queue")
""""""


def main():
    """"""
    app_container = bootstrap.bootstrap()

    def callback(ch: BlockingChannel, method: Basic.Deliver, properties: BasicProperties, body: bytes):
        """"""
        try:
            message = messages.message_maker(json.loads(body.decode()))

            match message.type:
                case messages.MessageType.EXECUTE:
                    handlers.execute_flow(cast(messages.Execute, message), app_container.flow_executor)
                case _: raise exceptions.InvalidMessageError(message_type=message.type)
        except exceptions.PenflowRuntimeError as e:
            print(f"{os.getpid()}:{e.origin} - Failed due to {e.message}")
        except exceptions.PenflowError as e:
            print(f"{os.getpid()} - Failed due to {e.message}")
        finally:
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"{os.getpid()}: Ack")

    connection = pika.BlockingConnection(pika.ConnectionParameters(**DEFAULT_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=DEFAULT_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=DEFAULT_QUEUE, on_message_callback=callback)

    try:
        print("[*] Waiting for messages. To exit press CTRL+C")
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Exiting")
    finally:
        channel.stop_consuming()
        connection.close()


DEFAULT_WORKERS = config.get_num_workers()
""""""


def spawn(workers: int = DEFAULT_WORKERS):
    """"""
    default_sigint_handler = signal.signal(signal.SIGINT, signal.SIG_IGN)

    processes = []
    for _ in range(workers):
        p = multiprocessing.Process(target=main)
        processes.append(p)
        p.start()

    signal.signal(signal.SIGINT, default_sigint_handler)

    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        for p in processes:
            p.terminate()
            p.join()


if __name__ == "__main__":
    spawn()

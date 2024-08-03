""""""
from typing import Self, override
import abc
import json

from pika import exceptions as pika_exceptions
from pika.adapters.blocking_connection import BlockingChannel, BlockingConnection
import pika

from penflowapi import config
from penflowapi.models import messages


class EventPublisher(abc.ABC):
    """"""

    def __enter__(self) -> Self:
        self.connect()
        return self

    def __exit__(self, *args):
        self.close()

    @abc.abstractmethod
    def connect(self):
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def publish(self, message: messages.Message):
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def close(self):
        """"""
        raise NotImplementedError


DEFAULT_HOST = config.get_mq_host()
""""""
DEFAULT_INFRASTRUCTURE = config.get_mq_pub()
""""""


class RabbitMQEventPublisher(EventPublisher):
    """"""

    # TODO: Custom exceptions

    def __init__(
        self,
        host: str = DEFAULT_HOST["host"],
        port: int = DEFAULT_HOST["port"],
        queue: str = DEFAULT_INFRASTRUCTURE["queue"],
        exchange: str = DEFAULT_INFRASTRUCTURE["exchange"]
    ):
        self._host = host
        self._port = port
        self._queue = queue
        self._exchange = exchange
        self._connection: BlockingConnection | None = None
        self._channel: BlockingChannel | None = None

    @override
    def connect(self):
        if self._connection and self._connection.is_open:
            return

        try:
            self._connection = pika.BlockingConnection(pika.ConnectionParameters(host=self._host, port=self._port))
            self._channel = self._connection.channel()
            self._channel.queue_declare(queue=self._queue, durable=True)
        except pika_exceptions.AMQPError as e:
            print("AMQPError", e)
            raise e

    @override
    def publish(self, message: messages.Message):
        if self._channel is None or self._channel.is_closed:
            raise ConnectionError

        try:
            self._channel.basic_publish(
                exchange=self._exchange,
                routing_key=self._queue,
                body=json.dumps(message.to_dict()),
                properties=pika.BasicProperties(
                    delivery_mode=pika.DeliveryMode.Persistent
                )
            )
        except pika_exceptions.AMQPError as e:
            print("AMQPError", e)
            raise e

    @override
    def close(self):
        if self._connection and self._connection.is_open:
            self._connection.close()

""""""
from typing import Self, override
import abc
import json

from pika import exceptions as pika_exceptions
from pika.adapters.blocking_connection import BlockingChannel, BlockingConnection
import pika

from penflowexecutor import config
from penflowexecutor.models import messages


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
DEFAULT_EXCHANGE = config.get_mq_pub().get("exchange")
""""""


class RabbitMQEventPublisher(EventPublisher):
    """"""

    # TODO: Custom exceptions

    def __init__(
        self,
        host: str = DEFAULT_HOST["host"],
        port: int = DEFAULT_HOST["port"],
        exchange: str = DEFAULT_EXCHANGE
    ):
        self._host = host
        self._port = port
        self._exchange = exchange
        self._connection: BlockingConnection | None = None
        self._channel: BlockingChannel | None = None

    @override
    def connect(self):
        try:
            self._connection = pika.BlockingConnection(pika.ConnectionParameters(host=self._host, port=self._port))
            self._channel = self._connection.channel()
            self._channel.exchange_declare(exchange=self._exchange, exchange_type="fanout")
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
                routing_key="",
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

""""""
from typing import override
import abc

import pymongo

from penflowapi import config, exceptions


class Database(abc.ABC):
    """"""

    @property
    @abc.abstractmethod
    def client(self):
        """"""
        raise NotImplemented

    @property
    @abc.abstractmethod
    def name(self):
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def connect(self):
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def close(self):
        """"""
        raise NotImplemented


DEFAULT_MONGO_HOST = config.get_mongo_host()
""""""
DEFAULT_MONGO_DB = config.get_mongo_db()
""""""


class MongoDatabase(Database):
    """"""

    def __init__(
        self,
        host: str = DEFAULT_MONGO_HOST["host"],
        port: int = DEFAULT_MONGO_HOST["port"],
        db_name: str = DEFAULT_MONGO_DB
    ):
        self._host = host
        self._port = port
        self._db_name = db_name
        self._client: pymongo.MongoClient | None = None

    @override
    def connect(self):
        uri = f"mongodb://{self._host}:{self._port}/"
        self._client = pymongo.MongoClient(uri)

        try:
            self._client.admin.command("ping")
        except Exception:
            raise exceptions.PenflowBootError("Failed to connect to MongoDB") from None

    @property
    @override
    def client(self):
        return self._client

    @property
    @override
    def name(self):
        return self._db_name

    @override
    def close(self):
        self._client.close()

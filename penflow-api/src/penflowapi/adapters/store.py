""""""
from typing import Any, override
import abc
import json

import redis

from penflowapi import config, models


class Store(abc.ABC):

    @abc.abstractmethod
    def set(self, key: str, value: models.ISerializable):
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def get(self, key: str) -> dict[str, Any] | None:
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def unset(self, key: str):
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def free(self):
        """"""
        raise NotImplementedError


DEFAULT_REDIS_HOST = config.get_redis_host()
""""""


class RedisStore(Store):
    """"""

    def __init__(
        self,
        host: str = DEFAULT_REDIS_HOST["host"],
        port: int = DEFAULT_REDIS_HOST["port"]
    ):
        self._pool = redis.ConnectionPool(host=host, port=port, decode_responses=True)

    @override
    def set(self, key: str, value: models.ISerializable):
        r = redis.Redis(connection_pool=self._pool)
        r.set(key, json.dumps(value.to_dict()))

    @override
    async def get(self, key: str) -> dict[str, Any] | None:
        pass

    @override
    def unset(self, key: str):
        pass

    @override
    def free(self):
        self._pool.disconnect()
        self._pool.close()


""""""
from typing import Any, Self
import abc


class ISerializable(abc.ABC):
    """"""

    @classmethod
    @abc.abstractmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """"""
        raise NotImplementedError

    @abc.abstractmethod
    def to_dict(self, skip: list[str] | None = None) -> dict:
        """"""
        raise NotImplementedError

""""""
from typing import Any, override
import abc
import dataclasses
import datetime
import enum

from penflowexecutor.models import serializable


class MessageType(enum.StrEnum):
    """"""
    # Commands
    EXECUTE = "execute"
    # Events
    FLOW_STARTED = "flow_started"
    FLOW_FINISHED_PREMATURELY = "flow_finished_prematurely"
    FLOW_FINISHED = "flow_finished"
    TASK_STARTED = "task_started"
    TASK_FINISHED = "task_finished"


@dataclasses.dataclass
class Message(serializable.ISerializable, abc.ABC):
    """"""
    type: MessageType
    timestamp: str

    def __init__(self, type: MessageType, timestamp: str | None = None):
        self.type = type
        self.timestamp = timestamp or datetime.datetime.now().isoformat()

    @property
    @abc.abstractmethod
    def data(self) -> dict[str, Any]:
        """"""
        raise NotImplementedError

    @override
    def to_dict(self, _: list[str] | None = None) -> dict[str, Any]:
        return {
            "type": self.type,
            "timestamp": self.timestamp,
            "data": self.data
        }

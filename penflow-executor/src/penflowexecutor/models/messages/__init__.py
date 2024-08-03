from typing import Any

from penflowexecutor import exceptions
from penflowexecutor.models.messages.messages import Message, MessageType
from penflowexecutor.models.messages.commands import Execute
from penflowexecutor.models.messages.events import (
    FlowStarted,
    FlowFinished,
    FlowFinishedPrematurely,
    TaskStarted,
    TaskFinished,
)


def message_maker(data: dict[str, Any]) -> Message:
    message_map: dict[str, type[Message]] = {
        MessageType.EXECUTE: Execute,
        MessageType.FLOW_STARTED: FlowStarted,
        MessageType.FLOW_FINISHED: FlowFinished,
        MessageType.FLOW_FINISHED_PREMATURELY: FlowFinishedPrematurely,
        MessageType.TASK_STARTED: TaskStarted,
        MessageType.TASK_FINISHED: TaskFinished,
    }

    if data.get("type") not in message_map:
        raise exceptions.InvalidMessageError(message_type=data.get("type"))

    message_data = {
        **data.get("data", {}),
        "timestamp": data.get("timestamp"),
    }

    return message_map[data.get("type")].from_dict(message_data)

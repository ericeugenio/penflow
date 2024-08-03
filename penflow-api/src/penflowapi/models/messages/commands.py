""""""
from typing import Any, Self, override
import dataclasses

from penflowapi import exceptions, models
from penflowapi.models import messages


@dataclasses.dataclass
class Execute(messages.Message):
    """"""
    execution_id: str  # Required
    flow: models.Flow  # Required
    arguments: dict[str, Any]  # Optional

    def __init__(
        self,
        execution_id: str,
        flow: models.Flow,
        arguments: dict[str, Any] | None = None,
        timestamp: str | None = None,
    ):
        super().__init__(type=messages.MessageType.EXECUTE, timestamp=timestamp)
        self.execution_id = execution_id
        self.flow = flow
        self.arguments = arguments or {}

    @property
    @override
    def data(self) -> dict[str, Any]:
        return {
            "execution_id": self.execution_id,
            "flow": self.flow.to_dict(),
            "arguments": self.arguments
        }

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        missing = []

        if "execution_id" not in data:
            missing.append("execution_id")
        if "flow" not in data:
            missing.append("flow")

        if len(missing) > 0:
            raise exceptions.BadMessageError(
                message_type=messages.MessageType.EXECUTE,
                data=missing,
            )
        else:
            return cls(
                execution_id=data["execution_id"],
                flow=models.Flow.from_dict(data["flow"]),
                arguments=data.get("arguments"),
                timestamp=data.get("timestamp"),
            )

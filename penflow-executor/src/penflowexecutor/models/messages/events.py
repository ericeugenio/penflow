""""""
from typing import Any, Self, override
import dataclasses

from penflowexecutor.models import messages


@dataclasses.dataclass
class FlowFinishedPrematurely(messages.Message):
    """"""
    execution_id: str  # Required
    detail: str  # Required

    def __init__(self, execution_id: str, detail: str, timestamp: str | None = None):
        super().__init__(type=messages.MessageType.FLOW_FINISHED_PREMATURELY, timestamp=timestamp)
        self.execution_id = execution_id
        self.detail = detail

    @property
    @override
    def data(self) -> dict[str, Any]:
        return {
            "executionId": self.execution_id,
            "reason": self.detail
        }

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            execution_id=data["executionId"],
            detail=data["detail"],
            timestamp=data.get("timestamp"),
        )


@dataclasses.dataclass
class FlowStarted(messages.Message):
    """"""
    execution_id: str  # Required

    def __init__(self, execution_id: str, timestamp: str | None = None):
        super().__init__(type=messages.MessageType.FLOW_STARTED, timestamp=timestamp)
        self.execution_id = execution_id

    @property
    @override
    def data(self) -> dict[str, Any]:
        return {
            "executionId": self.execution_id
        }

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            execution_id=data["executionId"],
            timestamp=data.get("timestamp"),
        )


@dataclasses.dataclass
class FlowFinished(messages.Message):
    """"""
    execution_id: str  # Required
    success: bool  # Required
    detail: str | None  # Optional

    def __init__(
        self,
        execution_id: str,
        success: bool = True,
        timestamp: str | None = None,
        detail: str | None = None
    ):
        super().__init__(type=messages.MessageType.FLOW_FINISHED, timestamp=timestamp)
        self.execution_id = execution_id
        self.success = success
        self.detail = detail

    @property
    @override
    def data(self) -> dict[str, Any]:
        return {
            "executionId": self.execution_id,
            "success": self.success,
            "detail": self.detail
        }

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            execution_id=data["executionId"],
            success=data["success"],
            detail=data.get("detail"),
            timestamp=data.get("timestamp"),
        )


@dataclasses.dataclass
class TaskStarted(messages.Message):
    """"""
    execution_id: str  # Required
    task_id: str  # Required
    task_name: str  # Required

    def __init__(self, execution_id: str, task_id: str, task_name: str, timestamp: str | None = None):
        super().__init__(type=messages.MessageType.TASK_STARTED, timestamp=timestamp)
        self.execution_id = execution_id
        self.task_id = task_id
        self.task_name = task_name

    @property
    @override
    def data(self) -> dict[str, Any]:
        return {
            "executionId": self.execution_id,
            "taskId": self.task_id,
            "taskName": self.task_name,
        }

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            execution_id=data["executionId"],
            task_id=data["taskId"],
            task_name=data["taskName"],
            timestamp=data.get("timestamp"),
        )


@dataclasses.dataclass
class TaskFinished(messages.Message):
    """"""
    execution_id: str  # Required
    task_id: str  # Required
    task_name: str  # Required
    success: bool  # Required
    output: dict  # Optional
    steps: list  # Optional
    detail: str | None  # Optional

    def __init__(
        self,
        execution_id: str,
        task_id: str,
        task_name: str,
        success: bool = True,
        output: dict | None = None,
        steps: list | None = None,
        detail: str = None,
        timestamp: str | None = None
    ):
        super().__init__(type=messages.MessageType.TASK_FINISHED, timestamp=timestamp)
        self.execution_id = execution_id
        self.task_id = task_id
        self.task_name = task_name
        self.success = success
        self.output = output
        self.steps = steps
        self.detail = detail

    @property
    @override
    def data(self) -> dict[str, Any]:
        return {
            "executionId": self.execution_id,
            "taskId": self.task_id,
            "taskName": self.task_name,
            "success": self.success,
            "output": self.output,
            "steps": self.steps,
            "detail": self.detail
        }

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            execution_id=data["executionId"],
            task_id=data["taskId"],
            task_name=data["taskName"],
            success=data["success"],
            output=data.get("output"),
            steps=data.get("steps"),
            detail=data.get("detail"),
            timestamp=data.get("timestamp")
        )

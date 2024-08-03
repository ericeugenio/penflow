""""""
from typing import Any, Self, override
import dataclasses
import datetime
import enum

from penflowapi.models import serializable


class ExecutionStatus(enum.StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEED = "succeed"
    FAILED = "failed"


@dataclasses.dataclass
class TaskExecution(serializable.ISerializable):
    """"""
    task_id: str
    task_name: str
    status: ExecutionStatus
    detail: str | None
    start_time: datetime.datetime | None
    end_time: datetime.datetime | None
    output: dict[str, Any] | None
    steps: list[str] | None

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            task_id=data["taskId"],
            task_name=data["taskName"],
            status=ExecutionStatus(data["status"]),
            detail=data.get("detail"),
            start_time=datetime.datetime.fromisoformat(str(data["startTime"])) if data.get("startTime") else None,
            end_time=datetime.datetime.fromisoformat(str(data["endTime"])) if data.get("endTime") else None,
            output=data.get("output", {}),
            steps=data.get("steps", []),
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        data = {
            "taskId": self.task_id,
            "taskName": self.task_name,
            "status": self.status,
            "detail": self.detail,
            "startTime": self.start_time.isoformat() if self.start_time else None,
            "endTime": self.end_time.isoformat() if self.end_time else None,
            "output": self.output,
            "steps": self.steps,
        }

        return {k: v for k, v in data.items() if k not in skip} if skip is not None else data


@dataclasses.dataclass
class FlowExecution(serializable.ISerializable):
    """"""
    id: str | None
    status: ExecutionStatus
    detail: str | None
    arguments: dict[str, Any] | None
    start_time: datetime.datetime | None
    end_time: datetime.datetime | None
    flow_id: str | None
    history: list[TaskExecution]

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            id=data.get("id"),
            status=ExecutionStatus(data["status"]),
            detail=data.get("detail"),
            arguments=data.get("arguments"),
            start_time=datetime.datetime.fromisoformat(str(data["startTime"])) if data.get("startTime") else None,
            end_time=datetime.datetime.fromisoformat(str(data["endTime"])) if data.get("endTime") else None,
            flow_id=data.get("flowId"),
            history=[TaskExecution.from_dict(task_execution) for task_execution in data.get("history", [])]
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        data = {
            "id": self.id,
            "status": self.status,
            "detail": self.detail,
            "arguments": self.arguments,
            "startTime": self.start_time.isoformat() if self.start_time else None,
            "endTime": self.end_time.isoformat() if self.end_time else None,
            "flowId": self.flow_id,
            "history": [task_execution.to_dict() for task_execution in self.history],
        }

        return {k: v for k, v in data.items() if k not in skip} if skip is not None else data

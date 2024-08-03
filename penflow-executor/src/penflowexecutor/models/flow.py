""""""
from typing import Any, Self, override
import dataclasses
import enum

from penflowexecutor.models import serializable


class TaskType(enum.StrEnum):
    """"""
    RUNNABLE = "runnable"
    BEHAVIORAL = "behavioral"


@dataclasses.dataclass
class FlowTask(serializable.ISerializable):
    """"""
    id: str
    name: str
    displayName: str
    type: TaskType
    properties: dict[str, Any]
    outputs: dict[str, str]
    subtasks: dict[str, list[Self]] | None

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            id=data["id"],
            name=data["name"],
            displayName=data["displayName"],
            type=TaskType(data["type"]),
            properties=data["properties"],
            outputs=data["outputs"],
            subtasks={
                subtask_name: [FlowTask.from_dict(subtask_data) for subtask_data in subtasks]
                for subtask_name, subtasks in data.get("subtasks", {}).items()
            } if data.get("subtasks") is not None else None,
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "displayName": self.displayName,
            "type": self.type,
            "properties": self.properties,
            "outputs": self.outputs,
            "subtasks": {k: [subtask.to_dict() for subtask in v] for k, v in self.subtasks.items()} if self.subtasks is not None else None,
        }

        return {k: v for k, v in data.items() if k not in skip} if skip is not None else data


@dataclasses.dataclass
class Flow(serializable.ISerializable):
    """"""
    id: str
    name: str
    tasks: list[FlowTask]
    description: str | None = None

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            id=data.get("id"),
            name=data["name"],
            description=data.get("description"),
            tasks=[FlowTask.from_dict(flow_task_data) for flow_task_data in data.get("tasks", [])],
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "tasks": [task.to_dict() for task in self.tasks],
        }

        return {k: v for k, v in data.items() if k not in skip} if skip is not None else data

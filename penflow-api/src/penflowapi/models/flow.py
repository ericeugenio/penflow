""""""
from typing import Any, Self, override
import dataclasses
import enum

from penflowapi.models import property, serializable, task


class FlowVariableScope(enum.StrEnum):
    IN = "in"
    OUT = "out"
    LOCAL = "local"


@dataclasses.dataclass
class FlowVariable(property.Property):
    """"""
    display_name: str
    scope: FlowVariableScope
    declared_by: str | None

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        base = property.Property.from_dict(data)
        return cls(
            type=base.type,
            options=base.options,
            items=base.items,
            properties=base.properties,
            description=base.description,
            display_name=data["displayName"],
            scope=FlowVariableScope(data["scope"]),
            declared_by=data["declaredBy"],
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            **super().to_dict(),
            "displayName": self.display_name,
            "scope": self.scope,
            "declaredBy": self.declared_by,
        }


@dataclasses.dataclass
class FlowTask(serializable.ISerializable):
    """"""
    id: str
    name: str
    displayName: str
    type: task.TaskType
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
            type=task.TaskType(data["type"]),
            properties=data["properties"],
            outputs=data["outputs"],
            subtasks={
                subtask_name: [FlowTask.from_dict(subtask_data) for subtask_data in subtasks]
                for subtask_name, subtasks in data.get("subtasks").items()
            } if data.get("subtasks") is not None else None
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "displayName": self.displayName,
            "type": self.type,
            "properties": self.properties,
            "outputs": self.outputs,
            "subtasks": {k: [subtask.to_dict() for subtask in v] for k, v in self.subtasks.items()} if self.subtasks is not None else None,
        }


@dataclasses.dataclass
class FlowError(serializable.ISerializable):
    """"""
    code: str
    message: str
    origin: list[str]

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            code=data["code"],
            message=data["message"],
            origin=data["origin"],
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            "origin": self.origin,
        }


@dataclasses.dataclass
class Flow(serializable.ISerializable):
    """"""
    id: str
    name: str
    variables: dict[str, FlowVariable]
    tasks: list[FlowTask]
    errors: list[FlowError]
    description: str | None = None

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            id=data.get("id"),
            name=data["name"],
            description=data.get("description"),
            variables={k: FlowVariable.from_dict(v) for k, v in data.get("variables", {}).items()},
            tasks=[FlowTask.from_dict(flow_task) for flow_task in data.get("tasks", [])],
            errors=[FlowError.from_dict(flow_error) for flow_error in data.get("errors", [])],
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "variables": {k: v.to_dict() for k, v in self.variables.items()},
            "tasks": [task.to_dict() for task in self.tasks],
            "errors": [error.to_dict() for error in self.errors],
        }

        return {k: v for k, v in data.items() if k not in skip} if skip is not None else data

""""""
from typing import Any, Self, override
import dataclasses
import enum


from penflowapi.models import property, serializable


class TaskType(enum.StrEnum):
    RUNNABLE = "runnable"
    BEHAVIORAL = "behavioral"


@dataclasses.dataclass
class TaskProperty(property.Property):
    display_name: str
    order: int
    default: Any | None

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
            display_name=data.get("displayName"),
            order=data["order"],
            default=data.get("default"),
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            **super().to_dict(),
            "displayName": self.display_name,
            "order": self.order,
            "default": self.default,
        }


@dataclasses.dataclass
class TaskOutput(property.Property):
    display_name: str

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
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            **super().to_dict(),
            "displayName": self.display_name,
        }


@dataclasses.dataclass
class Task(serializable.ISerializable):
    name: str
    display_name: str
    description: str | None
    summary: str | None
    icon: str
    type: TaskType
    subtasks: list[str] | None
    required_properties: list[str]
    principal_properties: list[str]
    properties: dict[str, TaskProperty]
    outputs: dict[str, TaskOutput] | None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            name=data["name"],
            display_name=data["displayName"],
            description=data.get("description"),
            summary=data.get("summary"),
            icon=data["icon"],
            type=TaskType(data["type"]),
            subtasks=data.get("subtasks"),
            required_properties=data.get("requiredProperties", []),
            principal_properties=data.get("principalProperties", []),
            properties={k: TaskProperty.from_dict(v) for k, v in data.get("properties", {}).items()},
            outputs={k: TaskOutput.from_dict(v) for k, v in data.get("outputs", {}).items()},
        )

    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            "name": self.name,
            "displayName": self.display_name,
            "description": self.description,
            "summary": self.summary,
            "icon": self.icon,
            "type": self.type,
            "subtasks": self.subtasks,
            "requiredProperties": self.required_properties,
            "principalProperties": self.principal_properties,
            "properties": {k: v.to_dict() for k, v in self.properties.items()},
            "outputs": {k: v.to_dict() for k, v in self.outputs.items()},
        }

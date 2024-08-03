from __future__ import annotations
from typing import Any, Self, override
import dataclasses
import enum

from penflowapi.models import serializable


class PropertyType(enum.StrEnum):
    ANY = "any"
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    ENUM = "enum"


@dataclasses.dataclass
class Property(serializable.ISerializable):
    """"""
    type: PropertyType
    description: str | None

    options: list[str] | None
    items: Property | None
    properties: dict[str, Property] | None

    @classmethod
    @override
    def from_dict(cls, data: dict[str, Any]) -> Self:
        return cls(
            type=PropertyType(data["type"]),
            options=data.get("options"),
            items=Property.from_dict(data.get("items")) if data.get("items") is not None else None,
            properties={k: Property.from_dict(v) for k, v in data.get("properties", {}).items()} if data.get("properties") is not None else None,
            description=data.get("description"),
        )

    @override
    def to_dict(self, skip: list[str] | None = None) -> dict:
        return {
            "type": self.type,
            "options": self.options,
            "items": self.items.to_dict() if self.items is not None else None,
            "properties": {k: v.to_dict for k, v in self.properties.items()} if self.properties is not None else None,
            "description": self.description,
        }

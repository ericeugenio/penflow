""""""
from __future__ import annotations

import pydantic

from penflowapi.entrypoints.api.schemas import base
from penflowapi.models.property import PropertyType


class Property(base.BaseSchema):
    """"""
    type: PropertyType = pydantic.Field(..., description="The data type of the property")
    description: str | None = pydantic.Field(None, description="A brief description of the property")

    options: list[str] | None = pydantic.Field(None, description="The values of a property of type enum")
    items: Property | None = pydantic.Field(None, description="The elements inside a variable of type array")
    properties: dict[str, Property] | None = pydantic.Field(
        None,
        description="The inner properties of a variable of type object"
    )

    @pydantic.model_validator(mode="after")
    def check_valid_type(self) -> Property:
        if self.type == PropertyType.ARRAY and self.items is None:
            raise ValueError("Type array requires \"items\" property")
        if self.type == PropertyType.OBJECT and self.properties is None:
            raise ValueError("Type object requires \"properties\" property")
        if self.type == PropertyType.ENUM and self.options is None:
            raise ValueError("Type object requires \"properties\" property")
        return self

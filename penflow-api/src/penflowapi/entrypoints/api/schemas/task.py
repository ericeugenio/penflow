""""""
from typing import Any, Self

import pydantic

from penflowapi.entrypoints.api.schemas import base, property
from penflowapi.models.property import PropertyType
from penflowapi.models.task import TaskType


class TaskProperty(property.Property):
    """"""
    display_name: str = pydantic.Field(..., description="A human-readable name of the task property")
    order: int = pydantic.Field(..., description="The order in which the task property is rendered")
    default: Any | None = pydantic.Field(None, description="The default value of the task property")


class TaskOutput(property.Property):
    """"""
    display_name: str = pydantic.Field(..., description="A human-readable name of the task property")

    @pydantic.model_validator(mode="after")
    def check_valid_type(self) -> Self:
        if self.type == PropertyType.ENUM:
            raise ValueError("Enum is not a valid type for TaskOutput")
        return self


class Task(base.BaseSchema):
    """"""
    name: str = pydantic.Field(..., description="The fully qualified name of the task")
    display_name: str = pydantic.Field(..., description="A human-readable name of the task")
    description: str | None = pydantic.Field(None, description="A brief description of the task")
    summary: str | None = pydantic.Field(
        None,
        description="A template string to provide a human-readable summary of the task functionality, placeholders "
                    "start with $ and inner properties can be accessed using the dot operator"
    )
    icon: str = pydantic.Field(..., description="The relative path pointing to the image of the task")
    type: TaskType = pydantic.Field(..., description="The type of the task, one of [runnable, control]")
    subtasks: list[str] | None = pydantic.Field(
        None,
        description="List of the subtasks collections available to the task"
    )
    required_properties: list[str] = pydantic.Field(
        default_factory=list,
        description="A list of the required properties of the task"
    )
    principal_properties: list[str] = pydantic.Field(
        default_factory=list,
        description="A list of the principal properties of the task"
    )
    properties: dict[str, TaskProperty] = pydantic.Field(..., description="A dictionary of the task properties")
    outputs: dict[str, TaskOutput] = pydantic.Field(..., description="A dictionary of the task outputs")

    @pydantic.model_validator(mode="after")
    def check_type(self) -> Self:
        if self.subtasks is not None and self.type == TaskType.RUNNABLE:
            raise ValueError("Runnable tasks cannot have subtasks")
        return self

""""""
from typing import Any, Self

import pydantic

from penflowapi import models
from penflowapi.entrypoints.api.schemas import base, property
from penflowapi.models.flow import FlowVariableScope
from penflowapi.models.task import TaskType


class FlowVariable(property.Property):
    """"""
    display_name: str = pydantic.Field(..., description="A human-readable name of the flow variable")
    scope: FlowVariableScope = pydantic.Field(..., description="The scope of the flow variable")
    declared_by: str | None = pydantic.Field(None, description="The origin of the variable")

    @pydantic.model_validator(mode="after")
    def check_valid_type(self) -> Self:
        if self.type == models.PropertyType.ENUM:
            raise ValueError("Enum is not a valid type for variables")
        return self


class FlowTask(base.BaseSchema):
    """"""
    id: str = pydantic.Field(..., description="The id of the flow task")
    name: str = pydantic.Field(..., description="The name of the flow task. 1-to-1 match to a task name")
    display_name: str = pydantic.Field(..., description="A human-readable name of the flow task")
    type: TaskType = pydantic.Field(..., description="The type of the flow task, one of [runnable, control]")
    properties: dict[str, Any] = pydantic.Field(default_factory=dict, description="The property values of a flow task")
    outputs: dict[str, str] = pydantic.Field(default_factory=dict, description="The output definitions of a flow task")
    subtasks: dict[str, list[Self]] | None = pydantic.Field(
        None,
        description="The property values of a flow task"
    )

    @pydantic.model_validator(mode="after")
    def check_type(self) -> Self:
        if self.subtasks is not None and self.type == TaskType.RUNNABLE:
            raise ValueError("Runnable tasks cannot have subtasks")
        return self


class FlowError(base.BaseSchema):
    """"""
    code: str = pydantic.Field(..., description="The error identifier")
    message: str = pydantic.Field(..., description="A brief message describing the error")
    origin: list[str] = pydantic.Field(..., description="The origin of the error")


class Flow(base.BaseSchema):
    """"""
    id: str = pydantic.Field(..., description="The id of the flow")
    name: str = pydantic.Field(..., description="The name of the flow")
    description: str | None = pydantic.Field(None, description="A brief description of the flow")
    variables: dict[str, FlowVariable] = pydantic.Field(default_factory=dict, description="The variables of the flow")
    tasks: list[FlowTask] = pydantic.Field(default_factory=list, description="The tasks of the flow")
    errors: list[FlowError] = pydantic.Field(default_factory=list, description="Semantic errors of a flow task")


class FlowCreate(base.BaseSchema):
    """"""
    name: str = pydantic.Field(..., description="The name of the flow")
    description: str | None = pydantic.Field(None, description="A brief description of the flow")


class FlowUpdate(base.BaseSchema):
    """"""
    name: str = pydantic.Field(..., description="The name of the flow")
    description: str | None = pydantic.Field(None, description="A brief description of the flow")
    variables: dict[str, FlowVariable] = pydantic.Field(..., description="The variables of the flow")
    tasks: list[FlowTask] = pydantic.Field(..., description="The tasks of the flow")

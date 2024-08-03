""""""
from typing import Any

from penflowexecutor import exceptions, models


class Context:
    """"""

    def __init__(self, execution_id: str, arguments: dict[str, Any]):
        self._execution_id = execution_id
        self._current_task: models.FlowTask | None = None
        self._variables = arguments.copy()

    @property
    def execution_id(self) -> str:
        """"""
        return self._execution_id

    @property
    def current_task(self) -> models.FlowTask | None:
        """"""
        return self._current_task

    @current_task.setter
    def current_task(self, task: models.FlowTask):
        """"""
        self._current_task = task

    def get_variable(self, name: str) -> Any:
        """"""
        return self._variables.get(name)

    def set_variable(self, name: str, value: Any):
        """"""
        self._variables[name] = value

    def render_properties(self, properties: dict[str, Any]):
        """"""
        parsed_properties = {}
        for property_name, property_value in properties.items():
            # Check for variable
            if isinstance(property_value, str) and property_value.startswith("$"):
                variable_name = property_value[1:]
                variable = self.get_variable(variable_name)
                if variable is None:
                    raise exceptions.PenflowRuntimeError(
                        origin=self.current_task.id,
                        detail=f"Variable '{variable_name}' is not declared"
                    )
                parsed_properties[property_name] = variable
            else:
                parsed_properties[property_name] = property_value
        return parsed_properties

""""""
from typing import Any
import enum

from penflowapi import exceptions, models
from penflowapi.adapters import repositories


class FlowErrorCode(enum.StrEnum):
    """"""
    TASK_NOT_FOUND = "TASK_NOT_FOUND"               # The specified task was not found.
    PROPERTY_MISSING = "PROPERTY_MISSING"           # A property which is required has not been declared.
    PROPERTY_UNEXPECTED = "PROPERTY_UNEXPECTED"     # A property which was not expected has been declared.
    VARIABLE_UNRESOLVED = "VARIABLE_UNRESOLVED"     # A variable which is not declared has been used.
    VARIABLE_UNEXPECTED = "VARIABLE_UNEXPECTED"     # A variable which was not expected has been declared.
    VARIABLE_REDECLARED = "VARIABLE_REDECLARED"     # A variable which has already been declared is declared again.
    VARIABLE_FORWARD_REF = "VARIABLE_FORWARD_REF"   # A variable which has not yet been assigned has been used.
    VARIABLE_KEYWORD = "VARIABLE_KEYWORD"           # A variable which has been declared uses a reserver keyword.
    OUTPUT_UNEXPECTED = "OUTPUT_UNEXPECTED"         # An output which has not expected has been declared.
    WRONG_TYPE = "WRONG_TYPE"                       # A [var/prop/out] which has been assigned received the wrong type.

    INPUT_MISSING = "INPUT_MISSING"                 # An input is missing when requesting an execution.
    INPUT_UNEXPECTED = "INPUT_UNEXPECTED"           # An input which was not expected has been received.


RESERVED_KEYWORDS = ["new"]
""""""


class FlowSemanticValidator:
    """"""

    def __init__(self, task_repo: repositories.TaskRepository):
        self._tasks_repo = task_repo
        self._flow: models.Flow | None
        self._symbol_table: dict[str, models.FlowVariable]
        self._left_variables: dict[str, models.FlowVariable]
        self._errors: list[models.FlowError]
        self._reset()

    def _reset(self):
        self._flow = None
        self._symbol_table = {}
        self._left_variables = {}
        self._errors = []

    @staticmethod
    def validate_inputs(flow: models.Flow, inputs: dict[str, Any]):
        errors: list[models.FlowError] = []
        flow_inputs = {k: v for k, v in flow.variables.items() if v.scope == models.FlowVariableScope.IN}
        left_inputs = inputs.copy()
        for input_name, input_meta in flow_inputs.items():
            if input_name not in inputs:
                errors.append(models.FlowError(
                    code=FlowErrorCode.INPUT_MISSING,
                    message=f"Input {input_name} is missing",
                    origin=[]
                ))
                continue

            _ = left_inputs.pop(input_name)
            # TODO: Type check

        if len(left_inputs) != 0:
            # Flow task contains unexpected properties
            errors.append(models.FlowError(
                code=FlowErrorCode.PROPERTY_UNEXPECTED,
                message=f"Unexpected inputs: {','.join(list(left_inputs.keys()))}",
                origin=[]
            ))

        if len(errors) != 0:
            raise exceptions.FlowSemanticError(errors=errors)

    def validate(self, flow: models.Flow) -> list[models.FlowError]:
        """"""
        self._reset()
        self._flow = flow

        for variable_name, variable_meta in flow.variables.items():
            match variable_meta.scope:
                case models.FlowVariableScope.IN | models.FlowVariableScope.OUT:
                    self._symbol_table[variable_name] = variable_meta
                case models.FlowVariableScope.LOCAL:
                    self._left_variables[variable_name] = variable_meta

        self._semantic_check(flow_tasks=flow.tasks)

        if len(self._left_variables) != 0:
            # Flow task contains has more registered variables than it should
            self._errors.append(models.FlowError(
                code=FlowErrorCode.VARIABLE_UNEXPECTED,
                message=f"Unexpected registered variables: {','.join(list(self._left_variables.keys()))}",
                origin=[]
            ))

        return self._errors

    def _semantic_check(self, flow_tasks: list[models.FlowTask]):
        """"""
        for flow_task in flow_tasks:
            task = self._tasks_repo.get(flow_task.name)
            # Validate tasks exists
            if task is None:
                self._errors.append(models.FlowError(
                    code=FlowErrorCode.TASK_NOT_FOUND,
                    message=f"Task {flow_task.name} not found",
                    origin=[flow_task.id]
                ))
                continue

            left_properties = dict((k, v) for k, v in flow_task.properties.items() if v != "")
            for property_name, property_meta in task.properties.items():
                # Check required properties are present
                if property_name not in left_properties:
                    if property_name in task.required_properties:
                        self._errors.append(models.FlowError(
                            code=FlowErrorCode.PROPERTY_MISSING,
                            message=f"Required task property {property_name} is missing",
                            origin=[flow_task.id, property_name]
                        ))
                    continue

                property_value = left_properties.pop(property_name)
                # Ignore non-required null variables
                if property_value is None and property_name not in task.required_properties:
                    continue

                # Check whether property is variable or literal
                if type(property_value) is str and property_value.startswith("$"):
                    # If variable:
                    variable_name = property_value[1:]
                    # 1. Variable is defined
                    if variable_name not in self._symbol_table and variable_name not in self._flow.variables:
                        self._errors.append(models.FlowError(
                            code=FlowErrorCode.VARIABLE_UNRESOLVED,
                            message=f"Cannot find variable {variable_name}",
                            origin=[flow_task.id, property_name]
                        ))
                        continue
                    if variable_name not in self._symbol_table and variable_name in self._flow.variables:
                        self._errors.append(models.FlowError(
                            code=FlowErrorCode.VARIABLE_FORWARD_REF,
                            message=f"Variable {variable_name} is used before its declaration",
                            origin=[flow_task.id, property_name]
                        ))
                        continue
                    # 2. Variable has correct type
                    self._type_check(
                        name=property_name,
                        data=self._symbol_table.get(variable_name),
                        expected=property_meta,
                        origin=flow_task.id
                    )
                else:
                    # Else:
                    # 1. Property has correct type
                    self._type_check(
                        name=property_name,
                        data=property_value,
                        expected=property_meta,
                        origin=flow_task.id
                    )

            if len(left_properties) != 0:
                # Flow task contains unexpected properties
                self._errors.append(models.FlowError(
                    code=FlowErrorCode.PROPERTY_UNEXPECTED,
                    message=f"Unexpected properties: {','.join(list(left_properties.keys()))}",
                    origin=[flow_task.id]
                ))

            left_outputs = dict((k, v) for k, v in flow_task.outputs.items() if v != "")
            for output_name, output_meta in task.outputs.items():
                if output_name in left_outputs:
                    variable_name = left_outputs.pop(output_name)
                    if variable_name.lower() in RESERVED_KEYWORDS:
                        self._errors.append(models.FlowError(
                            code=FlowErrorCode.VARIABLE_KEYWORD,
                            message=f"{variable_name} is a reserved keyword",
                            origin=[flow_task.id, output_name]
                        ))
                        continue
                    elif variable_name in self._symbol_table:
                        self._errors.append(models.FlowError(
                            code=FlowErrorCode.VARIABLE_REDECLARED,
                            message=f"Cannot redeclare variable {variable_name} under the same scope",
                            origin=[flow_task.id, output_name]
                        ))
                        continue
                    elif variable_name not in self._flow.variables:
                        self._errors.append(models.FlowError(
                            code=FlowErrorCode.VARIABLE_UNRESOLVED,
                            message=f"Declared variable {variable_name} is not registered in flow variables",
                            origin=[flow_task.id, output_name]
                        ))
                        continue
                    else:
                        # Local flow variable associated to the output has the same type as the task output
                        self._type_check(
                            name=variable_name,
                            data=self._flow.variables[variable_name],
                            expected=output_meta,
                            origin=flow_task.id
                        )
                        self._symbol_table[variable_name] = self._left_variables.pop(variable_name)

            if len(left_outputs) != 0:
                # Flow task contains invalid outputs
                self._errors.append(models.FlowError(
                    code=FlowErrorCode.OUTPUT_UNEXPECTED,
                    message=f"Unexpected outputs: {','.join(list(left_properties.keys()))}",
                    origin=[flow_task.id]
                ))

            # Recursively check subtasks
            if flow_task.type == models.TaskType.BEHAVIORAL:
                for subtasks in flow_task.subtasks.values():
                    self._semantic_check(flow_tasks=subtasks)

    def _type_check(
        self,
        name: str,
        data: Any | models.FlowVariable,
        expected: models.Property,
        origin: str
    ):
        """"""

        is_variable = isinstance(data, models.FlowVariable) or isinstance(data, models.Property)
        data_type = data.type if is_variable else type(data).__name__

        # Variables with type any don't need type check will be evaluated at runtime
        if is_variable and data_type == models.PropertyType.ANY:
            return

        match expected.type:
            case models.PropertyType.ANY:
                pass
            case models.PropertyType.STRING | models.PropertyType.ENUM:
                if (
                    (not is_variable and not isinstance(data, str))
                    or (is_variable and data.type != expected.type)
                ):
                    self._errors.append(models.FlowError(
                        code=FlowErrorCode.WRONG_TYPE,
                        message=f"{name} expects a string but received a {data_type}",
                        origin=[origin, *name.split(".")]
                    ))
            case models.PropertyType.NUMBER:
                if (
                    (not is_variable and not isinstance(data, (int, float)))
                    or (is_variable and data.type.value != expected.type.value)
                ):
                    self._errors.append(models.FlowError(
                        code=FlowErrorCode.WRONG_TYPE,
                        message=f"{name} expects a string but received a {data_type}",
                        origin=[origin, *name.split(".")]
                    ))
            case models.PropertyType.BOOLEAN:
                if (
                    (not is_variable and not isinstance(data, bool))
                    or (is_variable and data.type.value != expected.type.value)
                ):
                    self._errors.append(models.FlowError(
                        code=FlowErrorCode.WRONG_TYPE,
                        message=f"{name} expects a string but received a {data_type}",
                        origin=[origin, *name.split(".")]
                    ))
            case models.PropertyType.ARRAY:
                if (
                    (not is_variable and not isinstance(data, list))
                    or (isinstance(data, models.FlowVariable) and data.type.value != expected.type.value)
                ):
                    self._errors.append(models.FlowError(
                        code=FlowErrorCode.WRONG_TYPE,
                        message=f"{name} expects an array but received a {data_type}",
                        origin=[origin, *name.split(".")]
                    ))
                else:
                    # Validate array items
                    if isinstance(data, models.FlowVariable):
                        self._type_check(
                            name=f"{name}.items",
                            data=data.items,
                            expected=expected.items,
                            origin=origin
                        )
                    else:
                        for item in data:
                            self._type_check(
                                name=f"{name}.items",
                                data=item,
                                expected=expected.items,
                                origin=origin
                            )
            case models.PropertyType.OBJECT:
                if (
                    (not is_variable and not isinstance(data, dict))
                    or (isinstance(data, models.FlowVariable) and data.type.value != expected.type.value)
                ):
                    self._errors.append(models.FlowError(
                        code=FlowErrorCode.WRONG_TYPE,
                        message=f"{name} expects an object but received a {data_type}",
                        origin=[origin, *name.split(".")]
                    ))
                else:
                    # Validate object properties
                    properties = data.properties if isinstance(data, models.Property) else data
                    for property_name, property_value in expected.properties.items():
                        if property_name not in properties:
                            self._errors.append(models.FlowError(
                                code=FlowErrorCode.WRONG_TYPE,
                                message=f"Object {name} is missing key {property_name}",
                                origin=[origin, *name.split(".")]
                            ))
                            continue
                        self._type_check(
                            name=f"{name}.{property_name}",
                            data=properties[property_name],
                            expected=property_value,
                            origin=origin
                        )

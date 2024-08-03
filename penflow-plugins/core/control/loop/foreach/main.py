from typing import Any, override
import copy
import enum

from penflowexecutor import exceptions
from penflowexecutor.adapters import plugins
from penflowexecutor.models import plugins as plugins_models
from penflowexecutor.services import context


plugin_registry = plugins.PluginRegistry()


@plugin_registry.register("core.control.loop.foreach")
class ForEach(plugins_models.BehavioralTask):

    class Properties(enum.StrEnum):
        LIST = "list"  # Required

    def __init__(self, properties: dict[str, Any]):
        self._list = properties.get(self.Properties.LIST)

    @override
    def resolve(self, ctx: context.Context):
        subtasks = ctx.current_task.subtasks
        if subtasks is None or "foreach" not in subtasks:
            raise exceptions.PenflowRuntimeError(
                origin=ctx.current_task.id,
                details=f"No subtasks found for foreach task with id {ctx.current_task.id}"
            )

        total_subtasks = []
        for index, item in enumerate(self._list):
            # Set Variables
            for output_name, output_value in ctx.current_task.outputs.items():
                if output_value is not None and output_value != "":
                    ctx.set_variable(output_value, item)
            # Render task
            for task in copy.deepcopy(subtasks["foreach"]):
                task.id = f"{index}:{task.id}"
                task.properties = ctx.render_properties(task.properties)
                # Append subtasks
                total_subtasks.append(task)
        return total_subtasks

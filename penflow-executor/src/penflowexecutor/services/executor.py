from typing import Any
import os

from penflowexecutor import exceptions, models
from penflowexecutor.adapters import eventpublisher, plugins
from penflowexecutor.models import messages, plugins as plugins_models
from penflowexecutor.services import context


class FlowExecutor:

    def __init__(self, publisher: eventpublisher.EventPublisher):
        self.eventpublisher = publisher
        self.ctx = None

    def run(self, flow: models.Flow, ctx: context.Context):
        """"""
        try:
            # Init execution
            self.ctx = ctx
            self.eventpublisher.connect()

            # Start execution
            self.eventpublisher.publish(messages.FlowStarted(self.ctx.execution_id))
            print(f"{os.getpid()}:{self.ctx.execution_id} - Started")
            self._run_tasks(flow.tasks)
            self.eventpublisher.publish(messages.FlowFinished(self.ctx.execution_id))
            print(f"{os.getpid()}:{self.ctx.execution_id} - Successfully finished")
        except exceptions.PenflowRuntimeError as e:
            # Notify task fail (Controlled)
            self.eventpublisher.publish(messages.TaskFinished(
                self.ctx.execution_id,
                self.ctx.current_task.id,
                success=False,
                detail=e.message
            ))
            # Notify flow failed
            self.eventpublisher.publish(messages.FlowFinished(
                self.ctx.execution_id,
                success=False,
                detail=f"Task with id {e.origin} failed: {e.message}"
            ))
            raise e
        except Exception as e:
            # Notify task fail (Uncontrolled)
            self.eventpublisher.publish(messages.TaskFinished(
                self.ctx.execution_id,
                self.ctx.current_task.id,
                success=False,
                detail=str(e)
            ))
            # Notify flow failed
            self.eventpublisher.publish(messages.FlowFinished(
                self.ctx.execution_id,
                success=False,
                detail=f"Task with id {self.ctx.current_task.id} failed: {e}"
            ))
            raise exceptions.PenflowRuntimeError(
                origin=self.ctx.current_task.id,
                detail=str(e)
            ) from None
        finally:
            self.eventpublisher.close()

    def _run_tasks(self, tasks: list[models.FlowTask]):
        """"""
        for task_meta in tasks:
            # Notify task start
            self.eventpublisher.publish(messages.TaskStarted(self.ctx.execution_id, task_meta.id, task_meta.name))
            print(f"{os.getpid()}:{self.ctx.execution_id} - Running task {task_meta.name}:{task_meta.id}")

            self.ctx.current_task = task_meta
            parsed_properties = self.ctx.render_properties(task_meta.properties)
            task_class = plugins.PluginRegistry().get(task_meta.name)
            if task_class is None:
                raise exceptions.PenflowRuntimeError(
                    origin=task_meta.id,
                    detail=f"Could not find implementation for task {task_meta.name} with id {task_meta.id}"
                )
            task = task_class(parsed_properties)
            output = None
            steps = None

            match task_meta.type:
                case models.TaskType.RUNNABLE: output, steps = self._run_runnable_task(task, task_meta)
                case models.TaskType.BEHAVIORAL: self._run_behavioral_task(task, task_meta)

            # Notify task finished
            self.eventpublisher.publish(messages.TaskFinished(
                self.ctx.execution_id,
                task_meta.id,
                task_meta.name,
                output=output,
                steps=steps
            ))
            print(f"{os.getpid()}:{self.ctx.execution_id} - Task {task_meta.name}:{task_meta.id} finished")

    def _run_runnable_task(
        self,
        task: plugins_models.RunnableTask,
        task_meta: models.FlowTask
    ) -> tuple[dict[str, Any], list[str]]:
        if not isinstance(task, plugins_models.RunnableTask):
            raise exceptions.PenflowRuntimeError(
                origin=task_meta.id,
                detail=f"Wrong implementation for {task_meta.name} of type 'runnable'."
            )

        output = task.run(self.ctx)

        for output_name, output_value in task_meta.outputs.items():
            if output_value is not None and output_value != "":
                self.ctx.set_variable(output_value, output[output_name])

        return output, task.steps

    def _run_behavioral_task(self, task: plugins_models.BehavioralTask, task_meta: models.FlowTask):
        if not isinstance(task, plugins_models.BehavioralTask):
            raise exceptions.PenflowRuntimeError(
                origin=task_meta.id,
                detail=f"Wrong implementation for {task_meta.name} of type 'behavioral'."
            )

        self._run_tasks(task.resolve(self.ctx))

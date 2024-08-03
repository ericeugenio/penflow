""""""
import bson

from penflowapi import models
from penflowapi.adapters import repositories
from penflowapi.services import validator


class FlowService:
    """"""

    def __init__(
        self,
        task_repo: repositories.TaskRepository,
        flow_repo: repositories.FlowRepository,
    ):
        self.tasks = task_repo
        self.flows = flow_repo
        self._semantic_validator = validator.FlowSemanticValidator(task_repo)

    def get_flows(self) -> list[models.Flow]:
        """"""
        return self.flows.get_all()

    def get_flow(self, flow_id: str) -> models.Flow:
        """"""
        return self.flows.get(flow_id=flow_id)

    def add_flow(self, flow: models.Flow) -> models.Flow:
        """"""
        flow.errors = self._semantic_validator.validate(flow=flow)
        return self.flows.add(flow=flow)

    def update_flow(self, flow_id: str, flow: models.Flow) -> models.Flow:
        """"""
        self.flows.get(flow_id=flow_id)
        self._replace_flow_tasks_tmp_ids(flow.tasks)
        flow.errors = self._semantic_validator.validate(flow=flow)
        return self.flows.update(flow_id=flow_id, flow=flow)

    def _replace_flow_tasks_tmp_ids(self, tasks: list[models.FlowTask]):
        """"""
        for task in tasks:
            if not bson.ObjectId.is_valid(task.id):
                task.id = str(bson.ObjectId())
            if task.type == models.TaskType.BEHAVIORAL:
                for subtasks in task.subtasks.values():
                    self._replace_flow_tasks_tmp_ids(subtasks)

    def delete_flow(self, flow_id: str):
        """"""
        return self.flows.delete(flow_id=flow_id)

    def create_flow_task(self, task_name: str) -> models.FlowTask:
        """"""
        task = self.tasks.get(task_name)
        data = {
            "id": str(bson.ObjectId()),
            "name": task.name,
            "displayName": task.display_name,
            "type": task.type,
            "properties": {},
            "outputs": {}
        }

        for property_name, property_meta in task.properties.items():
            match property_meta.type:
                case models.PropertyType.ANY: data["properties"][property_name] = property_meta.default
                case models.PropertyType.STRING: data["properties"][property_name] = property_meta.default or ""
                case models.PropertyType.NUMBER: data["properties"][property_name] = property_meta.default or 0
                case models.PropertyType.BOOLEAN: data["properties"][property_name] = property_meta.default or False
                case models.PropertyType.ENUM: data["properties"][property_name] = property_meta.default
                case models.PropertyType.ARRAY: data["properties"][property_name] = property_meta.default or []
                case models.PropertyType.OBJECT: data["properties"][property_name] = property_meta.default or {}

        for output_name in task.outputs.keys():
            data["outputs"][output_name] = ""

        if task.type == models.TaskType.BEHAVIORAL:
            data["subtasks"] = dict((k, []) for k in task.subtasks)

        return models.FlowTask.from_dict(data)

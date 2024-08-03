""""""
from penflowapi import models
from penflowapi.adapters import repositories


class ExecutionHistoryService:
    """"""

    def __init__(
        self,
        execution_repo: repositories.ExecutionRepository,
        flow_repo: repositories.FlowRepository,
    ):
        self.executions = execution_repo
        self.flows = flow_repo

    def get_execution(self, execution_id: str):
        """"""
        return self.executions.get(execution_id=execution_id)

    def get_flow_executions(self, flow_id: str) -> list[models.FlowExecution]:
        """"""
        if self._flow_exists(flow_id):
            return self.executions.list_flow_history(flow_id=flow_id)

    def update_flow_execution(self, execution_id: str, execution: models.FlowExecution) -> models.FlowExecution:
        return self.executions.update(execution_id=execution_id, execution=execution)

    def add_task_execution(self, execution_id: str, execution: models.TaskExecution) -> models.FlowExecution:
        return self.executions.add_task(execution_id=execution_id, execution=execution)

    def update_task_execution(self, execution_id: str, execution: models.TaskExecution) -> models.FlowExecution:
        return self.executions.update_task(execution_id=execution_id, execution=execution)

    def _flow_exists(self, flow_id: str) -> bool:
        self.flows.get(flow_id)
        return True

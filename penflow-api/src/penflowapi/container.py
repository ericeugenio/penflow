""""""
import dataclasses

from penflowapi import services
from penflowapi.adapters import database


@dataclasses.dataclass
class AppContainer:
    """"""
    db: database.Database
    flow_service: services.FlowService
    task_service: services.TaskService
    execution_service: services.ExecutionService
    execution_history_service: services.ExecutionHistoryService


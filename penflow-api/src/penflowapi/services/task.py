""""""
from penflowapi.adapters import repositories


class TaskService:
    """"""

    def __init__(self, task_repo: repositories.TaskRepository):
        self.tasks = task_repo

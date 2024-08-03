""""""
import abc
import json
import pathlib

from penflowapi import config, exceptions, models


class TaskRepository(abc.ABC):
    """"""

    @abc.abstractmethod
    def get(self, task_name: str) -> models.Task | None:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def get_all(self) -> list[models.Task]:
        """"""
        raise NotImplemented


DEFAULT_TASK_PATH = config.get_tasks_path()


class JsonTaskRepository(TaskRepository):
    """"""

    def __init__(self, path: str = DEFAULT_TASK_PATH):
        self._root_path = pathlib.Path(path)
        self._tasks: list[models.Task] = []

        if not self._root_path.exists() or not self._root_path.is_dir():
            raise exceptions.PenflowBootError("Failed to locate tasks path")

    def load_tasks(self):
        for path in self._root_path.rglob("metadata.json"):
            with path.open() as f:
                task_json = json.load(f)
            task = models.Task.from_dict(task_json)
            if task:
                self._tasks.append(task)

    def get(self, task_name: str) -> models.Task | None:
        for task in self._tasks:
            if task.name == task_name:
                return task
        return None

    def get_all(self) -> list[models.Task]:
        return self._tasks

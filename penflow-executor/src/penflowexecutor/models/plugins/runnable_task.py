""""""
from typing import Any
import abc

from penflowexecutor.models.plugins import task
from penflowexecutor.services import context


class RunnableTask(task.Task):
    """"""
    def __init__(self):
        self._steps: list[str] = []

    @abc.abstractmethod
    def run(self, ctx: context) -> dict[str, Any]:
        """"""
        raise NotImplementedError

    @property
    def steps(self) -> list[str]:
        return self._steps

    def add_step(self, step: str):
        self._steps.append(step)

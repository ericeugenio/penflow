""""""
from typing import override
import abc

from penflowexecutor.services import executor


class Container(abc.ABC):
    """"""

    @property
    @abc.abstractmethod
    def flow_executor(self) -> executor.FlowExecutor:
        """"""
        raise NotImplemented


class DefaultContainer(Container):
    """"""

    def __init__(
        self,
        flow_executor: executor.FlowExecutor
    ):
        self._flow_executor = flow_executor

    @property
    @override
    def flow_executor(self) -> executor.FlowExecutor:
        return self._flow_executor

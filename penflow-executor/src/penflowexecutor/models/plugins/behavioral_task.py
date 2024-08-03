""""""
import abc

from penflowexecutor import models
from penflowexecutor.models import plugins as plugins_model
from penflowexecutor.services import context


class BehavioralTask(plugins_model.Task):
    """"""

    @abc.abstractmethod
    def resolve(self, ctx: context) -> list[models.FlowTask]:
        """"""
        raise NotImplementedError

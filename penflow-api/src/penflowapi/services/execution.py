""""""
from typing import Any
import datetime

from penflowapi import exceptions, models
from penflowapi.adapters import repositories, eventpublisher
from penflowapi.models import messages
from penflowapi.services import validator


class ExecutionService:
    """"""

    def __init__(
        self,
        publisher: eventpublisher.EventPublisher,
        execution_repo: repositories.ExecutionRepository,
        flow_repo: repositories.FlowRepository,
    ):
        self.publisher = publisher
        self.executions = execution_repo
        self.flows = flow_repo

    def run_flow(self, flow_id: str, inputs: dict[str, Any]) -> str:
        """"""
        flow = self.flows.get(flow_id=flow_id)
        if len(flow.tasks) == 0:
            raise exceptions.PenflowValidationError(details="Flow does not have any task to run")
        if len(flow.errors) > 0:
            raise exceptions.FlowSemanticError(errors=flow.errors)

        validator.FlowSemanticValidator.validate_inputs(flow, inputs)

        data = models.FlowExecution.from_dict({
            "status": models.ExecutionStatus.QUEUED,
            "arguments": inputs,
            "startTime": datetime.datetime.now().isoformat(),
            "flowId": flow.id,
        })

        execution = self.executions.new(execution=data)

        with self.publisher:
            self.publisher.publish(message=messages.Execute(
                execution_id=execution.id,
                flow=flow,
                arguments=inputs,
                timestamp=execution.start_time.isoformat()
            ))

        return execution.id

""""""
from penflowexecutor.models import messages
from penflowexecutor.services import context, executor


def execute_flow(cmd: messages.Execute, flow_executor: executor.FlowExecutor):
    """"""
    flow_executor.run(flow=cmd.flow, ctx=context.Context(
        execution_id=cmd.execution_id,
        arguments=cmd.arguments
    ))

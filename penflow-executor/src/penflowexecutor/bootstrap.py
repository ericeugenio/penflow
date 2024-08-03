""""""
from penflowexecutor import container
from penflowexecutor.adapters import eventpublisher, plugins
from penflowexecutor.services import executor as flow_executor


def bootstrap(
    import_plugins: bool = True,
    publisher: eventpublisher.EventPublisher = eventpublisher.RabbitMQEventPublisher(),
    executor: flow_executor.FlowExecutor = None,
) -> container.Container:
    """"""
    if executor is None:
        executor = flow_executor.FlowExecutor(publisher=publisher)

    if import_plugins:
        plugins.load_plugins()

    return container.DefaultContainer(
        flow_executor=executor
    )

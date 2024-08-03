""""""
from penflowapi import container, services
from penflowapi.adapters import database, eventpublisher, repositories, store


def bootstrap(
    load_tasks: bool = True,
    db: database.Database = database.MongoDatabase(),
    publisher: eventpublisher.EventPublisher = eventpublisher.RabbitMQEventPublisher(),
    _: store.Store = store.RedisStore(),
) -> container.AppContainer:
    """"""
    db.connect()

    execution_repository = repositories.MongoExecutionRepository(client=db.client, db_name=db.name)
    flow_repository = repositories.MongoFlowRepository(client=db.client, db_name=db.name)
    task_repository = repositories.JsonTaskRepository()

    if load_tasks:
        task_repository.load_tasks()

    return container.AppContainer(
        db=db,
        execution_service=services.ExecutionService(
            publisher=publisher,
            execution_repo=execution_repository,
            flow_repo=flow_repository,
        ),
        execution_history_service=services.ExecutionHistoryService(
            execution_repo=execution_repository,
            flow_repo=flow_repository,
        ),
        flow_service=services.FlowService(
            flow_repo=flow_repository,
            task_repo=task_repository
        ),
        task_service=services.TaskService(
            task_repo=task_repository,
        ),
    )

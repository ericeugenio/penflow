""""""
import fastapi

from penflowapi import container, services


def get_flow_service(req: fastapi.Request) -> services.FlowService:
    """"""
    app_container: container.AppContainer = req.app.state.container
    return app_container.flow_service


def get_task_service(req: fastapi.Request) -> services.TaskService:
    """"""
    app_container: container.AppContainer = req.app.state.container
    return app_container.task_service


def get_execution_service(req: fastapi.Request) -> services.ExecutionService:
    """"""
    app_container: container.AppContainer = req.app.state.container
    return app_container.execution_service

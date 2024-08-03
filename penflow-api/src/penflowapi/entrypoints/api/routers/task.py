import fastapi

from penflowapi import services
from penflowapi.entrypoints.api import dependencies, schemas

router = fastapi.APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)


@router.get(
    "",
    response_model_exclude_none=True
)
async def tasks(
    task_service: services.TaskService = fastapi.Depends(dependencies.get_task_service)
) -> list[schemas.Task]:
    return task_service.tasks.get_all()

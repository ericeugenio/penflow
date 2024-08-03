""""""
from typing import Any

import fastapi

from penflowapi import exceptions, models, services
from penflowapi.entrypoints.api import dependencies, schemas

router = fastapi.APIRouter(
    prefix="/flows",
    tags=["flows"],
)


@router.get(
    "",
    response_description="Get all flows",
)
async def list_flows(
    flow_service: services.FlowService = fastapi.Depends(dependencies.get_flow_service)
) -> list[schemas.Flow]:
    """"""
    return flow_service.get_flows()


@router.get(
    "/{flow_id}",
    response_description="Get a single flow",
    responses={
        400: {"description:": "Bad Request"},
        404: {"description": "Not found"},
    }
)
async def get_flow(
    flow_id: str,
    flow_service: services.FlowService = fastapi.Depends(dependencies.get_flow_service)
) -> schemas.Flow:
    """"""
    try:
        return flow_service.get_flow(flow_id=flow_id)
    except exceptions.ModelNotFoundError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_404_NOT_FOUND, detail=e.message)
    except exceptions.BadModelError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post(
    "",
    response_description="Add a new flow",
    status_code=fastapi.status.HTTP_201_CREATED,
)
async def create_flow(
    data: schemas.FlowCreate = fastapi.Body(...),
    flow_service: services.FlowService = fastapi.Depends(dependencies.get_flow_service)
) -> schemas.Flow:
    """"""
    flow = models.Flow.from_dict(data.model_dump())
    return flow_service.add_flow(flow)


@router.put(
    "/{flow_id}",
    response_description="Update a flow",
    responses={
        400: {"description:": "Bad Request"},
        404: {"description": "Not found"},
    }
)
async def update_flow(
    flow_id: str,
    data: schemas.FlowUpdate = fastapi.Body(...),
    flow_service: services.FlowService = fastapi.Depends(dependencies.get_flow_service)
) -> schemas.Flow:
    """"""
    try:
        flow = models.Flow.from_dict(data.model_dump(by_alias=True))
        return flow_service.update_flow(flow_id, flow)
    except exceptions.ModelNotFoundError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_404_NOT_FOUND, detail=e.message)
    except exceptions.BadModelError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete(
    "/{flow_id}",
    response_description="Delete flow",
    status_code=fastapi.status.HTTP_204_NO_CONTENT,
    responses={
        400: {"description:": "Bad Request"},
        404: {"description": "Not found"},
    }
)
async def delete_flow(
    flow_id: str,
    flow_service: services.FlowService = fastapi.Depends(dependencies.get_flow_service)
):
    """"""
    try:
        flow_service.delete_flow(flow_id)
    except exceptions.ModelNotFoundError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_404_NOT_FOUND, detail=e.message)
    except exceptions.BadModelError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post(
    "/{flow_id}/run",
    response_description="Run a flow",
    status_code=fastapi.status.HTTP_202_ACCEPTED,
    responses={
        400: {"description:": "Bad Request"},
        404: {"description": "Not found"},
    }
)
async def run_flow(
    flow_id: str,
    inputs: dict[str, Any],
    execution_service: services.ExecutionService = fastapi.Depends(dependencies.get_execution_service)
) -> str:
    """"""
    try:
        return execution_service.run_flow(flow_id, inputs)
    except exceptions.ModelNotFoundError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_404_NOT_FOUND, detail=e.message)
    except exceptions.FlowSemanticError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_400_BAD_REQUEST, detail={
            "message": e.message,
            "errors": [error.to_dict() for error in e.errors]
        })
    except exceptions.PenflowValidationError as e:
        raise fastapi.HTTPException(status_code=fastapi.status.HTTP_400_BAD_REQUEST, detail=e.message)

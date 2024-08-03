""""""
import abc

import bson
import pymongo

from penflowapi import exceptions, models


class ExecutionRepository(abc.ABC):
    """"""

    @abc.abstractmethod
    def get(self, execution_id: str) -> models.FlowExecution:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def list_flow_history(self, flow_id: str) -> list[models.FlowExecution]:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def new(self, execution: models.FlowExecution) -> models.FlowExecution:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def update(self, execution_id: str, execution: models.FlowExecution) -> models.FlowExecution:
        """"""
        raise NotImplemented
    @abc.abstractmethod
    def add_task(self, execution_id: str, execution: models.TaskExecution) -> models.FlowExecution:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def update_task(self, execution_id: str, execution: models.TaskExecution) -> models.FlowExecution:
        """"""
        raise NotImplemented


class MongoExecutionRepository(ExecutionRepository):
    """"""

    def __init__(self, client: pymongo.MongoClient, db_name: str):
        self._client = client
        self._db = self._client.get_database(db_name)
        self._executions = self._db.get_collection("executions")

    def get(self, execution_id: str) -> models.FlowExecution:
        if not bson.ObjectId.is_valid(execution_id):
            raise exceptions.BadModelError(["id"])
        execution = self._executions.find_one({"_id": bson.ObjectId(execution_id)})
        if execution is None:
            raise exceptions.ModelNotFoundError(model="Execution", model_id=execution_id)
        execution = dict(execution)
        execution["id"] = str(execution.pop("_id"))
        return models.FlowExecution.from_dict(execution)

    def list_flow_history(self, flow_id: str) -> list[models.FlowExecution]:
        if not bson.ObjectId.is_valid(flow_id):
            raise exceptions.BadModelError(["flow_id"])
        executions = list(self._executions.find({"flow_id": flow_id}))
        history = []
        for execution in executions:
            execution["id"] = str(execution.pop("_id"))
            history.append(models.FlowExecution.from_dict(execution))
        return history

    def new(self, execution: models.FlowExecution) -> models.FlowExecution:
        new_flow = self._executions.insert_one(
            execution.to_dict(skip=["id"])
        )
        return self.get(str(new_flow.inserted_id))

    def update(self, execution_id: str, execution: models.FlowExecution) -> models.FlowExecution:
        result = self._executions.find_one_and_update(
            {"_id": bson.ObjectId(execution_id)},
            {"$set": {
                "status": execution.status,
                "endTime": execution.end_time.isoformat() if execution.end_time else None,
                "detail": execution.detail
            }},
            return_document=True
        )
        if not result:
            raise exceptions.ModelNotFoundError(model="Execution", model_id=execution_id)
        result = dict(result)
        result["id"] = str(result.pop("_id"))
        return models.FlowExecution.from_dict(result)

    def add_task(self, execution_id: str, execution: models.TaskExecution) -> models.FlowExecution:
        result = self._executions.find_one_and_update(
            {"_id": bson.ObjectId(execution_id)},
            {"$push": {"history": execution.to_dict()}},
            return_document=True
        )
        if not result:
            raise exceptions.ModelNotFoundError(model="Execution", model_id=execution_id)
        result = dict(result)
        result["id"] = str(result.pop("_id"))
        return models.FlowExecution.from_dict(result)

    def update_task(self, execution_id: str, execution: models.TaskExecution) -> models.FlowExecution:
        result = self._executions.find_one_and_update(
            {"_id": bson.ObjectId(execution_id), "history.taskId": execution.task_id},
            {"$set": {
                "history.$.status": execution.status,
                "history.$.endTime": execution.end_time.isoformat() if execution.end_time else None,
                "history.$.detail": execution.detail,
                "history.$.output": execution.output,
                "history.$.steps": execution.steps
            }},
            return_document=True
        )
        if not result:
            raise exceptions.ModelNotFoundError(model="Execution", model_id=execution_id)
        result = dict(result)
        result["id"] = str(result.pop("_id"))
        return models.FlowExecution.from_dict(result)

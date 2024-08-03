""""""
import abc

import bson
import pymongo

from penflowapi import exceptions, models


class FlowRepository(abc.ABC):
    """"""

    @abc.abstractmethod
    def get(self, flow_id: str) -> models.Flow:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def get_all(self) -> list[models.Flow]:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def add(self, flow: models.Flow) -> models.Flow:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def update(self, flow_id: str, flow: models.Flow) -> models.Flow:
        """"""
        raise NotImplemented

    @abc.abstractmethod
    def delete(self, flow_id: str):
        """"""
        raise NotImplemented


class MongoFlowRepository(FlowRepository):
    """"""

    def __init__(self, client: pymongo.MongoClient, db_name: str):
        self._client = client
        self._db = self._client.get_database(db_name)
        self._flows = self._db.get_collection("flows")

    def get(self, flow_id: str) -> models.Flow:
        if not bson.ObjectId.is_valid(flow_id):
            raise exceptions.BadModelError(["id"])
        flow = self._flows.find_one({"_id": bson.ObjectId(flow_id)})
        if flow is None:
            raise exceptions.ModelNotFoundError(model="Flow", model_id=flow_id)
        flow = dict(flow)
        flow["id"] = str(flow.pop("_id"))
        return models.Flow.from_dict(flow)

    def get_all(self) -> list[models.Flow]:
        flows = list(self._flows.find())
        all = []
        for flow in flows:
            flow["id"] = str(flow.pop("_id"))
            all.append(flow)
        return all

    def add(self, flow: models.Flow) -> models.Flow:
        new_flow = self._flows.insert_one(
            flow.to_dict(skip=["id"])
        )
        return self.get(str(new_flow.inserted_id))

    def update(self, flow_id: str, flow: models.Flow) -> models.Flow:


        result = self._flows.find_one_and_update(
            {"_id": bson.ObjectId(flow_id)},
            {"$set": flow.to_dict(skip=["id"])},
            return_document=True
        )
        if not result:
            raise exceptions.ModelNotFoundError(model="Flow", model_id=flow_id)
        result = dict(result)
        result["id"] = str(result.pop("_id"))
        return models.Flow.from_dict(result)

    def delete(self, flow_id: str):
        result = self._flows.delete_one({"_id": bson.ObjectId(flow_id)})
        if not result.deleted_count:
            raise exceptions.ModelNotFoundError(model="Flow", model_id=flow_id)

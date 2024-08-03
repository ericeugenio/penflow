from penflowapi.adapters.repositories.execution import ExecutionRepository, MongoExecutionRepository
from penflowapi.adapters.repositories.flow import FlowRepository, MongoFlowRepository
from penflowapi.adapters.repositories.task import TaskRepository, JsonTaskRepository


Repository = ExecutionRepository | FlowRepository | TaskRepository


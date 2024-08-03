import { FlowTaskLinkedList, FlowTaskNode } from "@/lib/ds/linkedlist-tasks";
import type { Flow, FlowAPI } from "@/types/Flow";
import type { FlowTask, FlowTaskAPI } from "@/types/FlowTask";

export function flowMapper(flow: FlowAPI): Flow {
    const flowTasks: FlowTaskLinkedList = new FlowTaskLinkedList();
    _flowTaskMapper(flowTasks, flow.tasks);
    return {
        ...flow,
        tasks: flowTasks
    }
}

function _flowTaskMapper(
    flowTasks: FlowTaskLinkedList,
    flowTasksApi: FlowTaskAPI[],
    parentFlowTaskId: string | null = null,
    flowSubtaskName: string | null = null,
) {
    let prevFlowTaskId: string | null = null;

    flowTasksApi.forEach((flowTaskApi: FlowTaskAPI) => {
        let flowTask: FlowTask;

        if (flowTaskApi.type === "behavioral") {
            flowTask = {
                ...flowTaskApi,
                subtasks: Object.keys(flowTaskApi.subtasks)
            }
        } else {
            flowTask = {...flowTaskApi}
        }

        flowTasks.addTask(parentFlowTaskId, flowSubtaskName, prevFlowTaskId, flowTask);

        if (flowTaskApi.type === "behavioral") {
            Object.entries(flowTaskApi.subtasks).forEach(([flowSubtaskName, flowSubtasks]) => {
                _flowTaskMapper(flowTasks, flowSubtasks, flowTask.id, flowSubtaskName)
            });
        }

        // Update for next iteration
        prevFlowTaskId = flowTask.id;
    });
}

export function flowApiMapper(flow: Flow): FlowAPI {
    return {
        ...flow,
        tasks: _flowTaskApiMapper(flow.tasks.head as FlowTaskNode)
    }
}

function _flowTaskApiMapper(
    start: FlowTaskNode | null,
): FlowTaskAPI[] {
    let flowTasksApi: FlowTaskAPI[] = [];
    let flowTaskApi: FlowTaskAPI;
    let current = start;

    while (current != null) {
        if (current.value.type === "behavioral") {
            flowTaskApi = {
                ...current.value,
                subtasks: Object.fromEntries(
                    Object.entries(current.children as object).map(([flowSubtaskName, flowSubtasksHead]) => {
                        return [flowSubtaskName, _flowTaskApiMapper(flowSubtasksHead)]
                    })
                )
            }
        } else {
            flowTaskApi = {...current.value}
        }
        flowTasksApi.push(flowTaskApi);
        current = (current.next as FlowTaskNode);
    }

    return flowTasksApi
}
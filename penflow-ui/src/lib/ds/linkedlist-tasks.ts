import type { FlowTask } from "@/types/FlowTask";
import { Node, LinkedList } from "@/lib/ds/linkedlist";

export class FlowTaskNode extends Node<FlowTask>{
    parent: FlowTaskNode | null;
    children: {[child: string]: FlowTaskNode | null };
    height: number;

    constructor(key: string, value: FlowTask, parent: FlowTaskNode | null = null) {
        super(key, value);
        this.height = 0;
        this.parent = parent;
        this.children = {};
        if (value.type === "behavioral" && value.subtasks) {
            value.subtasks.forEach((subtask) => this.children[subtask] = null);
        }
    }

    reheight() {
        if (this.children) {
            let maxHeight = 0;
            for (let child of Object.values(this.children as object)) {
                if (child != null) {
                    let current = child;
                    while (current != null) {
                        maxHeight = Math.max(maxHeight, current.height+1);
                        current = current.next;
                    }
                }
            }
            this.height = maxHeight;
        }
    }
}

export class FlowTaskLinkedList extends LinkedList<FlowTask> {

    constructor(head: FlowTaskNode | null = null) {
        super(head);
    }

    searchTask(flowTaskId: string): FlowTaskNode | null {
        return this._searchTask(flowTaskId, (this.head as FlowTaskNode));
    }

    _searchTask(flowTaskId: string, start: FlowTaskNode | null): FlowTaskNode | null {
        let current = start;
        while (current != null && current.key !== flowTaskId) {
            for (let subtasksHead of Object.values(current.children as object)) {
                let task = this._searchTask(flowTaskId, subtasksHead);
                if (task != null) {
                    return task;
                }
            }
            current = (current.next as FlowTaskNode);
        }
        return current;
    }

    addTask(
        parentFlowTaskId: string | null,
        flowSubtaskName: string | null,
        prevFlowTaskId: string | null,
        flowTask: FlowTask,
    ) {
        if (parentFlowTaskId == null || flowSubtaskName == null) {
            // Add task
            const newFlowTask = new FlowTaskNode(flowTask.id, flowTask);
            if (this.isEmpty()) {
                this.prepend(newFlowTask);
            } else {
                if (prevFlowTaskId != null) {
                    const prevNode = this.search(prevFlowTaskId);
                    if (prevNode != null) {
                        this.insert(prevNode, newFlowTask);
                    }
                } else {
                    this.prepend(newFlowTask);
                }
            }
        } else {
            // Add subtask
            let parentFlowTask = this.searchTask(parentFlowTaskId);
            if (parentFlowTask != null && parentFlowTask.children && flowSubtaskName in parentFlowTask.children) {
                const newTask = new FlowTaskNode(flowTask.id, flowTask);
                if (parentFlowTask.children[flowSubtaskName] === null) {
                    newTask.parent = parentFlowTask;
                    parentFlowTask.children[flowSubtaskName] = newTask;
                } else {
                    if (prevFlowTaskId != null) {
                        const prevTask = this.searchTask(prevFlowTaskId);
                        if (prevTask != null) {
                            this.insert(prevTask, newTask);
                        }
                    } else {
                        // TODO: Prepend task
                    }
                }
                // Reheight parents
                while (parentFlowTask != null) {
                    parentFlowTask.reheight();
                    // Get next parent (all left and one up);
                    while (parentFlowTask.prev != null) {
                        parentFlowTask = (parentFlowTask.prev as FlowTaskNode);
                    }
                    parentFlowTask = parentFlowTask.parent;
                }
            }
        }
    }

    updateTask(flowTask: FlowTaskNode, value: FlowTask) {
        flowTask.value = value;
    }

    deleteTask(
        flowTask: FlowTaskNode,
        parentTaskId: string | null,
        subtaskName: string | null
    ) {
        if (parentTaskId == null || subtaskName == null) {
            // Remove task
            this.delete(flowTask);
        } else {
            let parentTask = flowTask.parent;

            // Remove subtask
            if (flowTask.prev != null) {
                flowTask.prev.next = flowTask.next;
            } else {
                // Remove the first subtask
                // Therefore update parent and child references
                if (parentTask != null
                    && parentTask.key === parentTaskId
                    && subtaskName in parentTask.children
                ) {
                    if (flowTask.next != null) {
                        parentTask.children[subtaskName] = (flowTask.next as FlowTaskNode);
                        (flowTask.next as FlowTaskNode).parent = flowTask.parent;
                    } else {
                        parentTask.children[subtaskName] = null;
                    }
                }
            }
            if (flowTask.next != null) {
                flowTask.next.prev = flowTask.prev;
            }

            // Reheight parents
            while (parentTask != null) {
                parentTask.reheight();
                // Get next parent (all left and one up);
                while (parentTask.prev != null) {
                    parentTask = (parentTask.prev as FlowTaskNode);
                }
                parentTask = parentTask.parent;
            }
        }
    }
}

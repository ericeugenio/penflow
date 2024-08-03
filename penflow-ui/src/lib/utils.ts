import { v4 as uuid4 } from "uuid";

import type { FlowVariable } from "@/types/FlowVariable";
import type { TaskProperty } from "@/types/TaskProperty";
import type { Task } from "@/types/Task";
import type { BehavioralFlowTask, FlowTask } from "@/types/FlowTask";

export function classNames(...classes: (string | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}

export function getPrintableType(value: FlowVariable | TaskProperty | undefined): string {
    if (value === undefined) {
        return "";
    } else {
        if (value.type === "array") {
            return value.items?.type + "[]";
        }
        else {
            return value.type;
        }
    }
}

export function getFlowTaskFromTask(task: Task): FlowTask {
    const flowTask: FlowTask = {
        id: uuid4(),  // tmp id
        displayName: task.displayName,
        name: task.name,
        type: task.type,
        properties: {},
        outputs: {},
    }
    // Init properties
    if (task.properties != undefined) {
        for (const [name, meta] of Object.entries(task.properties)) {
            switch (meta.type) {
                case "any":
                case "enum":
                    flowTask.properties[name] = meta.default || null;
                    break;
                case "string":
                    flowTask.properties[name] = meta.default || "";
                    break;
                case "number":
                    flowTask.properties[name] = meta.default || 0;
                    break;
                case "boolean":
                    flowTask.properties[name] = meta.default || false;
                    break;
                case "array":
                    flowTask.properties[name] = meta.default || [];
                    break;
                case "object":
                    flowTask.properties[name] = meta.default || {};
                    break;
            }
        }
    }
    // Init outputs
    if (task.outputs != undefined) {
        for (let [name, _] of Object.entries(task.outputs)) {
            flowTask.outputs[name] = "";
        }
    }
    // Init subtasks
    if (task.type === "behavioral" && task.subtasks) {
        (flowTask as BehavioralFlowTask).subtasks = task.subtasks;
    }
    return flowTask;
}
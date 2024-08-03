import type { TaskProperty } from "@/types/TaskProperty";
import type { TaskOutput } from "@/types/TaskOutput";

export type Task = RunnableTask | BehavioralTask;

export type RunnableTask = _Task & {
    type: "runnable",
};

export type BehavioralTask = _Task & {
    type: "behavioral",
    subtasks?: string[],
};

type _Task = {
    name: string,
    displayName: string,
    description?: string,
    summary?: string,
    icon?: string,
    requiredProperties?: string[],
    principalProperties?: string[],
    properties?: {[key: string]: TaskProperty},
    outputs?: {[key: string]: TaskOutput},
};
export type FlowTask = RunnableFlowTask | BehavioralFlowTask;

export type RunnableFlowTask = _FlowTask & {
    type: "runnable",
};

export type BehavioralFlowTask = _FlowTask & {
    type: "behavioral",
    subtasks?: string[],
}

type _FlowTask = {
    id: string,
    name: string,
    displayName: string,
    properties: {[name: string]: any},
    outputs: {[name: string]: string},
};

/************************************************************************/
/* API                                                                  */
/************************************************************************/

export type FlowTaskAPI = RunnableFlowTaskAPI | ControlFlowTaskAPI;

export type RunnableFlowTaskAPI = _FlowTask & {
    type: "runnable",
};

export type ControlFlowTaskAPI = _FlowTask & {
    type: "behavioral",
    subtasks?: {[subtaskName: string]: FlowTaskAPI[]}
}
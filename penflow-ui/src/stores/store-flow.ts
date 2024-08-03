
import type { Node, Edge } from "reactflow";
import type { StateCreator } from "zustand";

import { FlowTaskLinkedList } from "@/lib/ds/linkedlist-tasks";
import { layoutFlow } from "@/lib/layouting";
import type { Flow } from "@/types/Flow";
import type { FlowTask } from "@/types/FlowTask";
import type { NamedFlowVariable } from "@/types/FlowVariable";
import type { Task } from "@/types/Task";

/************************************************************************/
/* DEFINITIONS                                                          */
/************************************************************************/

type FlowState = {
    tasks: Task[];
    nodes: Node[];
    edges: Edge[];
    flow: Flow | null;
    curFlowTaskId: string | null;
    curParentFlowTaskId: string | null;
    curFlowSubtaskName: string | null;
    curVariableName: string | null;
    isExecutionFormOpen: boolean;
    isFlowFormOpen: boolean;
    isFlowTaskFormOpen: boolean;
    isTasksCommandPaletteOpen: boolean;
    isVariablesOpen: boolean;
    isVariablesFormOpen: boolean;
};

type FlowActions = {
    getCurrentVariable: () => NamedFlowVariable | null;
    getCurrentFlowTask: () => FlowTask | null;
    setTasks: (tasks: Task[]) => void;
    setFlow: (flow: Flow) => void;
    addFlowTask: (value: FlowTask) => void;
    updateFlowTask: (flowTaskId: string, value: FlowTask) => void;
    deleteFlowTask: (
        flowTaskId: string,
        parentFlowTaskId?: string | null,
        flowSubtaskName?: string | null
    ) => void;
    saveVariable: (variableName: string, value: NamedFlowVariable) => void;
    deleteVariable: (variableName: string) => void;
    setIsExecutionFormOpen: (value: boolean) => void;
    setIsFlowFormOpen: (value: boolean) => void;
    setIsFlowTaskFormOpen: (
        value: boolean,
        flowTaskId?: string | null,
        parentFlowTaskId?: string | null,
        flowSubtaskName?: string | null
    ) => void;
    setIsTasksCommandPaletteOpen: (
        value: boolean,
        flowTaskId?: string | null,
        parentFlowTaskId?: string | null,
        flowSubtaskName?: string | null
    ) => void;
    setIsVariablesOpen: (value: boolean) => void;
    setIsVariablesFormOpen: (value: boolean, variableName?: string | null) => void;
};

export type FlowSlice = FlowState & FlowActions;

/************************************************************************/
/*  DEFAULT STATE                                                       */
/************************************************************************/

export const initFlowSlice = (): FlowState => {
    const tasks = new FlowTaskLinkedList();
    const { nodes, edges } = layoutFlow(tasks);

    return {
        tasks: [],
        nodes: nodes,
        edges: edges,
        flow: null,
        curFlowTaskId: null,
        curParentFlowTaskId: null,
        curFlowSubtaskName: null,
        curVariableName: null,
        isExecutionFormOpen: false,
        isFlowFormOpen: false,
        isFlowTaskFormOpen: false,
        isVariablesOpen: false,
        isTasksCommandPaletteOpen: false,
        isVariablesFormOpen: false
    };
};

const defaultInitState: FlowState = {
    tasks: [],
    nodes: [],
    edges: [],
    flow: null,
    curFlowTaskId: null,
    curParentFlowTaskId: null,
    curFlowSubtaskName: null,
    curVariableName: null,
    isExecutionFormOpen: false,
    isFlowFormOpen: false,
    isFlowTaskFormOpen: false,
    isTasksCommandPaletteOpen: false,
    isVariablesOpen: false,
    isVariablesFormOpen: false
};

/************************************************************************/
/* STORE                                                                */
/************************************************************************/

export const createFlowSlice = (
    initState: FlowState = defaultInitState,
): StateCreator<FlowSlice, [], [], FlowSlice> => {
    return (set, get) => ({
        ...initState,
        getCurrentVariable: () => {
            const curVariableName = get().curVariableName;
            if (curVariableName != null) {
                if (curVariableName === "new") {
                    return {
                        name: "",
                        type: "string",
                        scope: "in",
                        displayName: "",
                        description: "",
                        declaredBy: "user"
                    };
                } else {
                    const flow = get().flow;
                    if (flow != null) {
                        if (curVariableName in flow.variables) {
                            return {
                                ...flow.variables[curVariableName],
                                name: curVariableName
                            }
                        }
                    }
                }
            }
            return null;
        },
        getCurrentFlowTask: () => {
            const curFlowTaskId = get().curFlowTaskId;
            if (curFlowTaskId != null) {
                const flow = get().flow;
                if (flow != null) {
                    return flow.tasks.searchTask(curFlowTaskId)?.value || null;
                }
            }
            return null;
        },
        setTasks: (tasks) => {
            set({tasks: [...tasks]});
        },
        setFlow: (flow) => {
            const {nodes, edges} = layoutFlow(flow.tasks);

            set({
                flow: {...flow},
                nodes: [...nodes],
                edges: [...edges],
            });
        },
        addFlowTask: (value) => {
            const flow = get().flow;
            if (flow != null) {
                const flowTasks = flow.tasks;
                const curParentFlowTaskId = get().curParentFlowTaskId;
                const curFlowSubtaskName = get().curFlowSubtaskName;
                const curFlowTaskId = get().curFlowTaskId;
                flowTasks.addTask(
                    curParentFlowTaskId,
                    curFlowSubtaskName,
                    curFlowTaskId,
                    value
                );
                // semanticValidation(flowTasks, variables, tasks);
                const {nodes, edges} = layoutFlow(flowTasks);
                set({
                    nodes: [...nodes],
                    edges: [...edges],
                });
            }
        },
        updateFlowTask: (flowTaskId, value) => {
            const flow = get().flow;
            if (flow != null) {
                const flowTasks = flow.tasks;
                const flowTask = flowTasks.searchTask(flowTaskId);
                if (flowTask != null) {
                    flowTasks.updateTask(flowTask, value);
                    // semanticValidation(flowTasks, variables, tasks);
                    const {nodes, edges} = layoutFlow(flowTasks);
                    set({
                        nodes: [...nodes],
                        edges: [...edges],
                    });
                }
            }
        },
        deleteFlowTask: (flowTaskId, parentFlowTaskId = null, flowSubtaskName = null) => {
            const flow = get().flow;
            if (flow != null) {
                const flowTasks = flow.tasks;
                const variables = flow.variables;
                const flowTask = flowTasks.searchTask(flowTaskId);
                if (flowTask != null) {
                    // Delete variables generated by task
                    for (const name of Object.keys(flowTask.value.outputs as object)) {
                        if (flowTask.value.outputs[name] in variables) {
                            delete variables[flowTask.value.outputs[name]];
                        }
                    }
                    flowTasks.deleteTask(flowTask, parentFlowTaskId, flowSubtaskName);
                    // semanticValidation(flowTasks, variables, tasks);
                    const {nodes, edges} = layoutFlow(flowTasks);
                    set({
                        nodes: [...nodes],
                        edges: [...edges],
                        flow: {
                            ...flow,
                            variables: {...variables}
                        },
                    });
                }
            }
        },
        saveVariable: (variableName, value) => {
            const flow = get().flow;
            if (flow != null) {
                const flowTasks = flow.tasks;
                const variables = flow.variables;
                // Cast NamedVariable to Variable
                const {name: newVariableName, ...variable} = {...value};
                if (variableName in variables) {
                    // Update variable
                    if (variableName != newVariableName) {
                        delete variables[variableName];
                        variables[newVariableName] = variable;
                    } else {
                        variables[variableName] = variable;
                    }
                } else {
                    // Create variable
                    variables[newVariableName] = variable;
                }
                // semanticValidation(flowTasks, variables, tasks);
                const {nodes, edges} = layoutFlow(flowTasks);
                set({
                    nodes: [...nodes],
                    edges: [...edges],
                    flow: {
                        ...flow,
                        variables: {...variables}
                    },
                });
            }
        },
        deleteVariable: (variableName) => {
            const flow = get().flow;
            if (flow != null) {
                const flowTasks = flow.tasks;
                const variables = flow.variables;
                if (variableName in variables) {
                    delete variables[variableName];
                    // semanticValidation(flowTasks, variables, tasks);
                    const {nodes, edges} = layoutFlow(flowTasks);
                    set({
                        nodes: [...nodes],
                        edges: [...edges],
                        flow: {
                            ...flow,
                            variables: {...variables}
                        },
                    });
                }
            }
        },
        setIsExecutionFormOpen: (value) => {
            set({ isExecutionFormOpen: value });
        },
        setIsFlowFormOpen: (value) => {
            set({ isFlowFormOpen: value });
        },
        setIsFlowTaskFormOpen: (value, flowTaskId = null, parentFlowTaskId = null, flowSubtaskName = null) => {
            set({
                isFlowTaskFormOpen: value,
                curFlowTaskId: flowTaskId,
                curParentFlowTaskId: parentFlowTaskId,
                curFlowSubtaskName: flowSubtaskName
            });
        },
        setIsTasksCommandPaletteOpen: (value, flowTaskId = null, parentFlowTaskId = null, flowSubtaskName = null) => {
            set({
                isTasksCommandPaletteOpen: value,
                curFlowTaskId: flowTaskId,
                curParentFlowTaskId: parentFlowTaskId,
                curFlowSubtaskName: flowSubtaskName
            });
        },
        setIsVariablesOpen: (value) => {
            set({ isVariablesOpen: value });
        },
        setIsVariablesFormOpen: (value, variableName = null) => {
            set({
                isVariablesFormOpen: value,
                curVariableName: variableName
            });
        }
    });
}

import type { FlowTaskAPI } from "@/types/FlowTask";
import type { FlowTaskLinkedList } from "@/lib/ds/linkedlist-tasks";
import type { FlowError } from "@/types/FlowError";
import type { FlowVariable } from "@/types/FlowVariable";

export type Flow = {
    id?: string,
    name: string,
    description?: string,
    version?: string,
    tags?: string[],
    variables: {[key: string]: FlowVariable},
    tasks: FlowTaskLinkedList
    errors: FlowError[]
};

/************************************************************************/
/* API                                                                  */
/************************************************************************/

export type FlowAPI = {
    id?: string,
    name: string,
    description?: string,
    variables: {[key: string]: FlowVariable},
    tasks: FlowTaskAPI[],
    errors: FlowError[]
};


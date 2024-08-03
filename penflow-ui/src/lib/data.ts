import type { FlowAPI } from "@/types/Flow";
import type { Task } from "@/types/Task";

const baseUrl = process.env.PENFLOW_API;

export async function fetchTasks(): Promise<Task[]> {
    const res = await fetch(baseUrl + "/tasks", { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch tasks');
    }
    return res.json();
}

export async function fetchFlows(): Promise<FlowAPI[]> {
    const res = await fetch(baseUrl + "/flows", { cache: 'no-store' });
    if (!res.ok) {
        throw new Error("Failed to fetch flows");
    }
    return res.json();
}

export async function fetchFlow(flowId: string): Promise<FlowAPI | null> {
    const res = await fetch(baseUrl + `/flows/${flowId}`, { cache: 'no-store' });
    if (!res.ok) {
        if (res.status == 404) {
            return null;
        } else {
            throw new Error("Failed to fetch flow with id: " + flowId);
        }
    }
    return res.json();
}
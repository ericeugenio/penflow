"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FlowAPI } from "@/types/Flow";

const baseUrl = process.env.PENFLOW_API;

export async function createFlow(name: string, description: string | null): Promise<void> {
    const response = await fetch(baseUrl + "/flows", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            description: description
        })
    });

    if (!response.ok) {
        throw new Error("Failed to create flow: " + response);
    }

    const result: FlowAPI = await response.json();

    revalidatePath("/flows");
    redirect("/flows/" + result.id);
}


export async function updateFlow(flow: FlowAPI): Promise<void> {
    const { id: flowId, ...flowWithoutId } = {...flow, errors: undefined};

    const response = await fetch(baseUrl + "/flows/" + flowId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(flowWithoutId)
    });

    if (!response.ok) {
        throw new Error("Failed to update flow: " + JSON.stringify(await response.json()));
    }

    const result: FlowAPI = await response.json();

    revalidatePath("/flows");
    redirect("/flows/" + result.id);
}

export async function runFlow(flowId: string, inputs: {[key: string]: any} = {}): Promise<void> {
    const response = await fetch(baseUrl + `/flows/${flowId}/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs)
    });

    if (!response.ok) {
        throw new Error("Failed to run flow: " + JSON.stringify(await response.json()));
    }

    const execution_id: string = await response.json();
    console.log(execution_id)
}
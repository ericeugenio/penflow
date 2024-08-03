import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OpenVariables, RunFlow, SaveFlow, UpdateFlowName } from "@/components/editor/buttons";
import FlowEditor from "@/components/editor/editor";
import VariablesWindow from "@/components/editor/variables/details";
import { fetchFlow, fetchTasks } from "@/lib/data";
import type { FlowAPI } from "@/types/Flow";
import type { Task } from "@/types/Task";

type PageProps = {
    params: { id: string }
}

export default async function Page({ params }: PageProps) {
    const flowId = params.id;
    const [tasks, flow]: [Task[], FlowAPI | null] = await Promise.all([
        fetchTasks(),
        fetchFlow(flowId)
    ]);

    if (flow == null) {
        notFound();
    }

    return (
        <>
            {/* TODO: Flow details <DetailsWindow /> && <OpenDetails /> */}
            {/* TODO: Error details <ErrorsWindow /> && <OpenErrors /> */}

            <div>
                <div className="mt-2">
                    <Link href="/flows"
                        className={"inline-flex items-center gap-2 text-sm text-slate-500 rounded-md pr-2"
                            + " focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    }>
                        <ChevronLeftIcon className="size-4 text-slate-400"/>
                        Flows
                    </Link>
                </div>
                <div className="flex items-center gap-x-4 mt-2 mb-6">
                    <UpdateFlowName className="flex-1 min-w-0" />
                    <OpenVariables />
                    <SaveFlow />
                    <RunFlow />
                </div>
            </div>
            <div className="size-full border border-slate-200 rounded-lg p-4 bg-white">
                <FlowEditor tasks={tasks} flow={flow} />
            </div>

            {/* Overlays */}
            <VariablesWindow />
        </>
    );
}

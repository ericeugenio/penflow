import type { FlowAPI } from "@/types/Flow";
import FlowTable from "@/components/flow/table";
import CreateFlowForm from "@/components/flow/create-form";
import { CreateFlowButton } from "@/components/flow/buttons";
import { fetchFlows } from "@/lib/data";


export default async function Page() {
    const flows: FlowAPI[] = await fetchFlows();

    return (
        <>
            <div className="flex items-center justify-between mt-2 mb-6">
                <h2 className="text-2xl truncate font-bold leading-7 text-slate-900 sm:text-3xl">Flows</h2>
                <CreateFlowButton className="ml-4" />
            </div>
            <div className="flex flex-col size-full overflow-auto">
                <FlowTable flows={flows}/>
            </div>

            {/* Overlays */}
            <CreateFlowForm />
        </>
    );
}

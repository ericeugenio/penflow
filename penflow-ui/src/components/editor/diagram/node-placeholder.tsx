import { memo } from "react";

import { Handle, Position } from "reactflow";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { usePenflowStore } from "@/hooks/store-provider";
import { PenflowStore} from "@/stores/store";

const selector = (state: PenflowStore) => ({
    openTasksCommandPalette: (
        flowTaskId: string | null,
        parentFlowTaskId: string | null,
        flowSubtaskName: string | null,
    ) => state.setIsTasksCommandPaletteOpen(true, flowTaskId, parentFlowTaskId, flowSubtaskName),
});

type NodeProps = {
    id: string,
    data: any
};

function NodePlaceholder({ id, data }: NodeProps) {
    const { openTasksCommandPalette } = usePenflowStore(useShallow(selector));

    const handleOnClick = () => {
        openTasksCommandPalette(
            data.prevFlowTaskId || null,
            data.parentFlowTaskId || null,
            data.flowSubtaskName || null
        );
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                className="invisible"
            />
            <div className={"group flex items-center justify-center"
                + " border-2 border-slate-300 border-dashed rounded-lg bg-transparent hover:border-slate-400"
            }>
                <button
                    type="button"
                    className="w-full flex justify-center py-2 focus:outline-none"
                    onClick={handleOnClick}
                >
                    <PlusCircleIcon className="h-6 w-6 text-slate-300 group-hover:text-slate-400"/>
                </button>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="invisible"
            />
        </>
    )
}

export default memo(NodePlaceholder);
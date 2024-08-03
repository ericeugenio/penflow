import React, { memo } from "react";

import { Handle, Position } from "reactflow";
import { AdjustmentsHorizontalIcon, ArrowPathIcon, ExclamationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import FlowTaskSummary from "@/components/editor/summary";
import { IconButton } from "@/components/ui/button";
import { usePenflowStore } from "@/hooks/store-provider";
import type { PenflowStore} from "@/stores/store";
import type { BehavioralTask } from "@/types/Task";


const selector = (state: PenflowStore) => ({
    flowErrors: state.flow!.errors,
    tasks: state.tasks,
    openFlowTaskForm: (
        taskId: string | null,
        parentTaskId: string | null,
        subflowName: string | null,
    ) => state.setIsFlowTaskFormOpen(true, taskId, parentTaskId, subflowName),
    deleteTask: state.deleteFlowTask
});

type NodeProps = {
    id: string,
    data: any
};

function NodeSubflow({ id, data }: NodeProps) {
    const { flowErrors, tasks, openFlowTaskForm, deleteTask } = usePenflowStore(useShallow(selector));
    const task: BehavioralTask = (tasks.find((task) => task.name === data.flowTask.name)! as BehavioralTask);

    const handleOnEdit = () => {
        openFlowTaskForm(id, data.parentFlowTaskId, data.flowSubtaskName);
    };

    const handleOnDelete = () => {
        deleteTask(id, data.parentFlowTaskId, data.flowSubtaskName);
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                className="invisible"
            />
            <div className={"group/node size-full flex items-center justify-center cursor-default"
                + " border-2 border-slate-300 rounded-lg bg-slate-100 bg-opacity-25"
                + " hover:border-slate-400"
            }>
                <div className="size-full">
                    <div className={"flex justify-between items-center"
                        + " rounded-t-lg border-b-2 border-slate-300 px-4 py-2 bg-white"
                        + " group-hover/node:border-slate-400"
                    }>
                        <div className="flex flex-1 min-w-0 items-center">
                            <p className="text-slate-700 text-sm font-medium truncate mr-2">
                                {task.displayName}
                            </p>
                            {task.summary && (
                                <FlowTaskSummary summaryTemplate={task.summary} context={data.flowTask} />
                            )}
                        </div>
                        <div className="flex items-center gap-x-1">
                            <IconButton
                                Icon={AdjustmentsHorizontalIcon}
                                onClick={handleOnEdit}
                                className="flex-none p-1"
                            />
                            <IconButton
                                Icon={TrashIcon}
                                role="danger"
                                onClick={handleOnDelete}
                                className="flex-none p-1"
                            />
                            {flowErrors.find(e => e.origin[0] == data.flowTask.id) != undefined && (
                                <ExclamationCircleIcon className="size-6 text-red-500" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="invisible"
            />
        </>
    )
}

export default memo(NodeSubflow);
import React, { memo } from "react";

import Image from "next/image";
import { Handle, Position } from "reactflow";
import { useShallow } from "zustand/react/shallow";
import { AdjustmentsHorizontalIcon, ExclamationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

import type { PenflowStore } from "@/stores/store";
import type { RunnableTask } from "@/types/Task";
import { IconButton } from "@/components/ui/button";
import { usePenflowStore } from "@/hooks/store-provider";
import FlowTaskSummary from "@/components/editor/summary";

const selector = (state: PenflowStore) => ({
    flowErrors: state.flow!.errors,
    tasks: state.tasks,
    openFlowTaskForm: (
        taskId: string,
        parentTaskId: string,
        subflowName: string,
    ) => state.setIsFlowTaskFormOpen(true, taskId, parentTaskId, subflowName),
    deleteTask: state.deleteFlowTask
});

type NodeProps = {
    id: string,
    data: any
};

function NodeTask({ id, data }: NodeProps) {
    const { flowErrors, tasks, openFlowTaskForm, deleteTask } = usePenflowStore(useShallow(selector));
    const task: RunnableTask = (tasks.find((task) => task.name === data.flowTask.name)! as RunnableTask);

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
            <div className={"flex items-center border-2 rounded-lg p-3 bg-white cursor-default"
                + " border-slate-300 hover:border-slate-400"
            }>
                <div className="flex flex-none items-center justify-center w-14 h-14 rounded-lg bg-slate-100">
                    <Image
                        src={task.icon || ""}
                        width={36}
                        height={36}
                        alt={task.name + " icon"}
                    />
                </div>
                <div className="flex-auto ml-4 overflow-hidden">
                    <p className="text-slate-700 text-sm font-medium truncate">
                        {task.displayName}
                    </p>
                    {task.summary && (
                        <FlowTaskSummary summaryTemplate={task.summary} context={data.flowTask} />
                    )}
                </div>
                <div className="flex items-center gap-x-1 ml-4">
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
                        <ExclamationCircleIcon className="h-6 w-6 text-red-500"/>
                    )}
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

export default memo(NodeTask);
"use client";

import { useEffect } from "react";
import ReactFlow, { type NodeTypes, Background, Panel } from "reactflow";
import { useShallow} from "zustand/react/shallow";

import { HistoryControls, ViewportControls } from "@/components/editor/controls";
import NodePlaceholder from "@/components/editor/diagram/node-placeholder";
import NodeSubflow from "@/components/editor/diagram/node-subflow";
import NodeTask from "@/components/editor/diagram/node-task";
import ExecutionForm from "@/components/editor/execution/execution-form";
import TaskCommandPalette from "@/components/editor/tasks/command-palette";
import { FlowTaskEditWindow } from "@/components/editor/tasks/edit-form";
import { usePenflowStore } from "@/hooks/store-provider";
import { flowMapper } from "@/lib/mappings";
import type { PenflowStore } from "@/stores/store";
import type { Task } from "@/types/Task";
import type { FlowAPI } from "@/types/Flow";

const nodeTypes: NodeTypes = {
    task: NodeTask,
    placeholder: NodePlaceholder,
    subflow: NodeSubflow
};

const selector = (state: PenflowStore) => ({
    nodes: state.nodes,
    edges: state.edges,
    setTasks: state.setTasks,
    setFlow: state.setFlow,
});

type FlowEditorProps = {
    tasks: Task[],
    flow: FlowAPI
}

export default function FlowEditor({ tasks, flow }: FlowEditorProps) {
    const { nodes, edges, setTasks, setFlow } = usePenflowStore(useShallow(selector));

    useEffect(() => {
        setTasks(tasks);
    }, [setTasks, tasks]);

    useEffect(() => {
        setFlow(flowMapper(flow));
    }, [setFlow, flow]);

    return (
        <>
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={edges}
                fitView
            >
                {/*<Panel position="top-left"><Controls /></Panel>*/}
                <Panel position="bottom-left"><ViewportControls /></Panel>
                <Background/>
            </ReactFlow>

            {/* Overlays */}
            <ExecutionForm />
            <FlowTaskEditWindow />
            <TaskCommandPalette />
        </>

    )
}
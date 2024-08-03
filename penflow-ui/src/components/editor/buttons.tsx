"use client";

import { ArrowDownTrayIcon ,PlayIcon, VariableIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { EditableText } from "@/components/ui/editable-text";
import { Button, IconButton } from "@/components/ui/button";
import { usePenflowStore } from "@/hooks/store-provider";
import { flowApiMapper } from "@/lib/mappings";
import type { PenflowStore } from "@/stores/store";
import {useState} from "react";
import {runFlow, updateFlow} from "@/lib/actions";

type ButtonProps = {
    className?: string,
};

export function UpdateFlowName({ className }: ButtonProps) {
    const { flowName, updateFlowName } = usePenflowStore(useShallow((state: PenflowStore) => ({
        flowName: state.flow?.name,
        updateFlowName: (name: string) => state.setFlow({
            ...state.flow!,
            name: name
        }),
    })));

    return (
        <EditableText
            value={flowName || ""}
            onChange={(event) => updateFlowName(event.target.value)}
            className={className}
            textClassName="text-2xl truncate font-bold leading-7 text-slate-900 sm:text-3xl"
        />
    );
}

export function OpenVariables() {
    const { handleOpenVariables } = usePenflowStore(useShallow((state: PenflowStore) => ({
        handleOpenVariables: () => state.setIsVariablesOpen(true),
    })));

    return (
        <IconButton
            Icon={VariableIcon}
            onClick={handleOpenVariables}
            className="flex items-center justify-center size-9"
        />
    );
}

export function SaveFlow() {
    const { flow } = usePenflowStore(useShallow((state: PenflowStore) => ({
        flow: state.flow,
    })));
    const [loading, setLoading] = useState<boolean>(false);

    const handleSave = async () => {
        if (flow == null) {
            return;
        }

        console.log(flowApiMapper(flow));

        setLoading(true);
        try {
            await updateFlow(flowApiMapper(flow));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/*
            <IconButton
                Icon={ArrowDownTrayIcon}
                onClick={handleSave}
                disabled={loading}
                className="flex items-center justify-center size-9"
            />
            */}
            <Button
                type="button"
                role="primary"
                disabled={loading}
                onClick={handleSave}
            >
                Save
            </Button>
        </>
    );
}

export function RunFlow() {
    const { flow, openExecutionForm } = usePenflowStore(useShallow((state: PenflowStore) => ({
        flow: state.flow,
        openExecutionForm: () => state.setIsExecutionFormOpen(true),
    })));

    const handleRun = async () => {
        if (flow != null) {
            const inputs = Object.values(flow.variables).filter(v => v.scope == "in");

            if (inputs.length > 0) {
                openExecutionForm();
            } else {
                await runFlow(flow.id!);
            }
        }
    };

    return (
        <>
            {/*
            <IconButton
                Icon={PlayIcon}
                onClick={() => {}}
                className="flex items-center justify-center size-9"
            />
            */}
            <Button
                type="button"
                role="primary"
                onClick={handleRun}
            >
                Run
            </Button>
        </>
    );
}
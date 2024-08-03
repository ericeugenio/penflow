"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { InputList } from "@/components/editor/form/list/input-list";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Modal } from "@/components/ui/modal";
import { Toggle } from "@/components/ui/form/toggle";
import { usePenflowStore } from "@/hooks/store-provider";
import { runFlow } from "@/lib/actions";
import type { PenflowStore } from "@/stores/store";
import type { FlowVariable } from "@/types/FlowVariable";

const selector = (state: PenflowStore) => ({
    flowId: state.flow?.id,
    variables: state.flow?.variables,
    isOpen: state.isExecutionFormOpen,
    closeForm: () => state.setIsExecutionFormOpen(false)
});

export default function ExecutionForm() {
    const { flowId, variables, isOpen, closeForm } = usePenflowStore(useShallow(selector));
    const [tmpInputVariables, setTmpInputVariables] = useState<{[name: string]: any}>({});

    const inputVariablesMeta: {[name: string]: FlowVariable} = useMemo(() => {
        if (variables) {
            return Object.fromEntries(Object.entries(variables)
                .filter(([_, meta]: [string, FlowVariable]) => meta.scope == "in"));
        } else {
            return {};
        }
    }, [variables]);

    const inputVariables: {[name: string]: any} = useMemo(() => {
        return Object.fromEntries(Object.entries(inputVariablesMeta).map(([name, meta]: [string, FlowVariable]) => {
            let defaultValue;
            switch (meta.type) {
                case "string":
                    defaultValue = "";
                    break;
                case "number":
                    defaultValue = 0;
                    break;
                case "boolean":
                    defaultValue = false;
                    break;
                case "array":
                    defaultValue = [];
                    break;
            }
            return [name, defaultValue];
        }));
    }, [variables]);


    useEffect(() => {
        setTmpInputVariables({...inputVariables});
    }, [inputVariables]);

    const handleClose = () => {
        closeForm();
    };

    const handleSave = async () => {
        if (flowId != undefined) {
            await runFlow(flowId, {...tmpInputVariables});
            closeForm();
        }
    };

    const handleInputChange = (input: string, change: any) => {
        setTmpInputVariables({
            ...tmpInputVariables,
            [input]: change
        })
    };

    const renderVariableField = (name: string, meta: FlowVariable) => {
        switch (meta.type) {
            case "string":
            case "number":
                return (
                    <Input
                        key={name}
                        name={name}
                        type={meta.type == "string" ? "text": "number"}
                        value={tmpInputVariables[name]}
                        onChange={(newValue) => handleInputChange(name, newValue)}
                        displayName={meta.displayName}
                        description={meta.description}
                    />
                );
            case "boolean":
                return (
                    <Toggle
                        key={name}
                        name={name}
                        checked={tmpInputVariables[name]}
                        onChange={(checked) => handleInputChange(name, checked)}
                        displayName={meta.displayName}
                        description={meta.description}
                    />
                );
            case "array":
                return (
                    <InputList
                        key={name}
                        name={name}
                        items={tmpInputVariables[name]}
                        itemsType={meta.items?.type!}
                        onListChanges={(newValue) => handleInputChange(name, newValue)}
                        displayName={meta.displayName}
                        description={meta.description}
                    />
                );
        }
    };

    return(
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col max-h-full mx-auto divide-y divide-slate-200 rounded-xl bg-white">
                <div className="flex-shrink-0 px-4 py-5 sm:px-6">
                    <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold text-slate-900 leading-6">Run flow inputs</h3>
                        <IconButton
                            Icon={XMarkIcon}
                            onClick={handleClose}
                            className="h-7 flex items-center"
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto space-y-6 px-4 py-5 sm:p-6">
                    {Object.entries(inputVariablesMeta).map(([name, meta]: [string, FlowVariable]) => (
                            renderVariableField(name, meta)
                    ))}
                </div>
                <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                    <div className="flex gap-x-4 justify-end">
                        <Button type="button" role="secondary" onClick={handleClose}>Cancel</Button>
                        <Button type="button" role="primary" onClick={handleSave}>Run</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
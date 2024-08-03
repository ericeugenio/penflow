"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { InputVariable } from "@/components/editor/form/input-variable";
import { InputListVariable } from "@/components/editor/form/list/input-list-variable";
import { Button, IconButton } from "@/components/ui/button";
import { InputTogglable } from "@/components/ui/form/input-togglable";
import { Toggle } from "@/components/ui/form/toggle";
import { Select } from "@/components/ui/form/select";
import { SlideOver } from "@/components/ui/slideover";
import { usePenflowStore } from "@/hooks/store-provider";
import { getPrintableType } from "@/lib/utils";
import type { PenflowStore } from "@/stores/store";
import type { FlowTask } from "@/types/FlowTask";
import type { NamedFlowVariable } from "@/types/FlowVariable";
import type { Task } from "@/types/Task";
import type { TaskProperty } from "@/types/TaskProperty";

const windowSelector = (state: PenflowStore) => ({
    flowTask: state.getCurrentFlowTask(),
    isOpen: state.isFlowTaskFormOpen,
    onClose: () => { state.setIsFlowTaskFormOpen(false) },
});

export function FlowTaskEditWindow() {
    const { flowTask, isOpen, onClose } = usePenflowStore(useShallow(windowSelector));

    return (
        <SlideOver isOpen={isOpen} onClose={onClose}>
            {flowTask && <FlowTaskEditForm flowTask={flowTask} close={onClose} /> }
        </SlideOver>
    );
}

const formSelector = (state: PenflowStore) => ({
    flow: state.flow,
    tasks: state.tasks,
    variables: state.flow!.variables,
    updateTask: state.updateFlowTask,
    saveVariable: state.saveVariable,
    deleteVariable: state.deleteVariable
});

type FlowTaskEditFormInternalProps = {
    flowTask: FlowTask,
    close: () => void,
};

export function FlowTaskEditForm({ flowTask, close }: FlowTaskEditFormInternalProps) {
    const {
        flow,
        tasks,
        variables,
        updateTask,
        saveVariable,
        deleteVariable
    } = usePenflowStore(useShallow(formSelector));
    const [tmpFlowTask, setTmpFlowTask] = useState<FlowTask>({...flowTask});
    const task: Task = tasks.find(t => t.name === flowTask?.name)!;
    const errors: {[field: string]: string[]} = flow!.errors
        .filter(e => e.origin[0] == flowTask.id)
        .map(e => [e.origin[1], e.message] as [string, string])
        .reduce((acc: {[field: string]: string[]}, [k, v]: [string, string]) => {
            if (acc[k]) {
                acc[k].push(v)
            }
            else {
                acc[k] = [v]
            }
            return acc;
        }, {});

    const handlePropertyChange = (property: string, change: any) => {
        /*
        const isRequired = task.requiredProperties?.includes(property) || false;

        let errors: ValidationError[] =  [];
        // Validate required properties
        if (isRequired && (change === "" || change?.value === null)) {
            errors.push(validations.ERR_REQUIRED_FIELD(tmpFlowTask.id, property));
        }
        if (typeof change === "string") {
            // Validate existing variable
            if (change.startsWith("$") && !(change.substring(1) in variables)) {
                errors.push(validations.ERR_INVALID_VARIABLE(tmpFlowTask.id, change));
            }
            // Validate variables typing
            if (change.startsWith("$")
                && change.substring(1) in variables
                && !(variables[change.substring(1)].type === "any" || task.properties![property].type === "any")
                && variables[change.substring(1)].type != task.properties![property].type
            ) {
                errors.push(validations.ERR_INVALID_VARIABLE_TYPE(
                    tmpFlowTask.id,
                    getPrintableType(task.properties![property]),
                    getPrintableType(variables[change.substring(1)])
                ));
            }
        }
        if (task.properties![property]!.type === "number") {
            // Validate change is a number or a variable
            const isNumber = !isNaN(Number(change));
            if (!change.startsWith("$") && !isNumber && change != "") {
                errors.push(validations.ERR_INVALID_FIELD_TYPE(tmpFlowTask.id, "number"));
            }
            // Parse number
            if (isNumber && change != "") {
                change = Number(change);
            }
        }
        if (task.properties![property]!.type === "array" && Array.isArray(change)) {
            errors = [];
        }
        */

        setTmpFlowTask({
            ...tmpFlowTask,
            properties: {
                ...tmpFlowTask.properties,
                [property]: change
            }
        });
    };

    const handleOutputChange = (output: string, change: string) => {
        /*
        let errors: ValidationError[] = [];
        // Validate duplicate name
        if ((change.toLowerCase() != flowTask.outputs[output] || errors.length > 0)
            && change.toLowerCase() in variables
        ) {
            errors.push(validations.ERR_REDECLARED_VARIABLE(tmpFlowTask.id, output));
        }
        // Validate reserved keyword "new"
        if (change.toLowerCase() === "new") {
            errors.push(validations.ERR_RESERVED_KEYWORD(tmpFlowTask.id, "new"));
        }
        */

        setTmpFlowTask({
            ...tmpFlowTask,
            outputs: {
                ...tmpFlowTask.outputs,
                [output]: change
            }
        });
    }

    const handleOutputEnable = (name: string, enabled: boolean) => {
        if (!enabled) {
            setTmpFlowTask({
                ...tmpFlowTask,
                outputs: {
                    ...tmpFlowTask.outputs,
                    [name]: ""
                }
            });
        }
    }

    const handleCancel = () => {
        setTmpFlowTask(flowTask);
        close();
    };

    const handleSave = () => {
        if (task.outputs != undefined) {
            for (const [name, meta] of Object.entries(task.outputs)) {
                if (tmpFlowTask.outputs[name] === "") {
                    if (flowTask.outputs[name] != "") {
                        // User wants to unset an output previously set
                        // Therefore we delete the existing variable
                        deleteVariable(flowTask.outputs[name]);
                    }
                } else {
                    const variable: NamedFlowVariable = {
                        name: tmpFlowTask.outputs[name],
                        type: meta.type,
                        scope: "local",
                        displayName: meta.displayName,
                        description: meta.description,
                        declaredBy: tmpFlowTask.id
                    };

                    if (variable.type === "array") {
                        variable.items = {...meta.items!};
                    } else if (variable.type === "object") {
                        variable.properties = {...meta.properties}
                    }

                    if (variable.name in variables && variable.name != flowTask.outputs[name]) {
                        // User want to set an output with a name already used
                        // Therefore we ignore the new value
                        tmpFlowTask.outputs[name] = "";
                    } else if (variable.name in variables && variable.name == flowTask.outputs[name]) {
                        // User does not modify an output previously set
                        // Therefore we leave it
                    } else if (!(variable.name in variables) && flowTask.outputs[name] != "") {
                        // User wants to set an output previously set
                        // Therefore we update the current variable
                        saveVariable(flowTask.outputs[name], variable);
                    } else {
                        // User wants to set an output previously unset
                        // Therefore we add a new variable
                        saveVariable("new", variable);
                    }
                }
            }
        }
        updateTask(tmpFlowTask.id, tmpFlowTask);
        close();
    };

    const renderPropertyField = (name: string, meta: TaskProperty) => {
        const isRequired = task.requiredProperties?.includes(name) || false;
        switch (meta.type) {
            case "string":
            case "number":
                return (
                    <InputVariable
                        key={name}
                        name={name}
                        type="text"
                        value={tmpFlowTask.properties[name]}
                        variables={
                            Object.entries(variables)
                                .filter(([_, variable]) => {
                                    return variable.type === meta.type
                                        || variable.type === "any"
                                        || meta.type === "any"
                                })
                                .map(([name, _]) => name)
                        }
                        onChange={(newValue) => handlePropertyChange(name, newValue)}
                        displayName={meta.displayName}
                        description={meta.description}
                        errors={errors[name]}
                        isRequired={isRequired}
                    />
                );
            case "boolean":
                return (
                    <Toggle
                        key={name}
                        name={name}
                        checked={tmpFlowTask.properties[name]}
                        onChange={(checked) => handlePropertyChange(name, checked)}
                        displayName={meta.displayName}
                        description={meta.description}
                        isRequired={isRequired}
                    />
                );
            case "enum":
                return (
                    <Select
                        key={name}
                        name={name}
                        value={{text: tmpFlowTask.properties[name], value: tmpFlowTask.properties[name]}}
                        options={meta.options!.map((option) => ({text: option, value: option}))}
                        onChange={(newValue) => handlePropertyChange(name, newValue.value)}
                        displayName={meta.displayName}
                        description={meta.description}
                        errors={errors[name]}
                        isRequired={isRequired}
                        empty={!isRequired}
                    />
                );
            case "array":
                return (
                    <InputListVariable
                        key={name}
                        name={name}
                        items={tmpFlowTask.properties[name]}
                        itemsType={meta.items?.type!}
                        onListChanges={(newValue) => handlePropertyChange(name, newValue)}
                        variables={
                            Object.entries(variables)
                                .filter(([_, variable]) => {
                                    return variable.type === "array"
                                        || variable.type === "any"
                                        || meta.type === "any"
                                })
                                .filter(([_, variable]) => {
                                    return variable.items?.type === meta.items?.type
                                        || variable.items?.type === "any"
                                        || meta.items?.type === "any"
                                })
                                .map(([name, _]) => name)
                        }
                        displayName={meta.displayName}
                        description={meta.description}
                        errors={errors[name]}
                        isRequired={isRequired}
                    />
                );
        }
    };

    return (
        <>
            <div className="min-h-0 flex flex-1 flex-col overflow-y-auto border-b border-slate-200 py-6 px-4 sm:px-6">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-slate-900 truncate">{tmpFlowTask.displayName}</h3>
                    <IconButton Icon={XMarkIcon} onClick={handleCancel} className="ml-3 h-7 flex items-center"/>
                </div>
                <div className="flex flex-col mt-6 space-y-6">
                    {/* Properties */}
                    {task.properties && Object.entries(task.properties).map(([name, meta]: [string, TaskProperty]) => {
                        return renderPropertyField(name, meta);
                    })}

                    {/* TODO: Advanced properties (e.g. properties not in principal[]) */}

                    {/* Outputs */}
                    <Disclosure as="div">
                        <DisclosureButton className={"group flex items-center gap-x-2 w-full mt-4"
                            + " text-slate-900 text-left text-sm font-semibold"
                        }>
                            <ChevronRightIcon className={"size-4 shrink-0 text-slate-400"
                                + "transition-transform duration-300 ease-in-out group-data-[open]:rotate-90"
                            }/>
                            Outputs
                        </DisclosureButton>
                        <Transition
                            enter="duration-200 ease-out"
                            enterFrom="opacity-0 -translate-y-2"
                            enterTo="opacity-100 translate-y-0"
                            leave="duration-200 ease-out"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <DisclosurePanel className="flex flex-col mt-6 ml-6 space-y-6">
                                {Object.entries(task.outputs as object).map(([name, meta]: [string, TaskProperty]) => (
                                    <InputTogglable
                                        key={`${name}-out`}
                                        name={name}
                                        value={tmpFlowTask.outputs[name]}
                                        enabled={tmpFlowTask.outputs[name] != ""}
                                        onChange={(newValue) => handleOutputChange(name, newValue)}
                                        onEnable={(enabled) => handleOutputEnable(name, enabled)}
                                        displayName={meta.displayName!}
                                        displayNameHelp={getPrintableType(meta)}
                                        description={meta.description}
                                        errors={errors[name]}
                                    />
                                ))}
                            </DisclosurePanel>
                        </Transition>
                    </Disclosure>
                </div>
            </div>
            <div className="flex-shrink-0 flex justify-end p-4">
                <Button type="button" role="secondary" onClick={handleCancel}>Cancel</Button>
                <Button type="button" role="primary" onClick={handleSave} className="ml-4">Save</Button>
            </div>
        </>
    );
}
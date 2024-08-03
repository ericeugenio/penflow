"use client";
import React, { Fragment, useMemo } from "react";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import VariableList from "@/components/editor/variables/details-list";
import VariableFormModal from "@/components/editor/variables/form";
import {IconButton} from "@/components/ui/button";
import { SlideOver } from "@/components/ui/slideover";
import { usePenflowStore } from "@/hooks/store-provider";
import type { PenflowStore } from "@/stores/store";
import type { FlowVariable } from "@/types/FlowVariable";

const windowSelector = (state: PenflowStore) => ({
    flow: state.flow,
    isOpen: state.isVariablesOpen,
    handleClose: () => state.setIsVariablesOpen(false)
});

export default function VariablesWindow() {
    const { flow, isOpen, handleClose } = usePenflowStore(useShallow(windowSelector));

    return (
        <SlideOver isOpen={isOpen} onClose={handleClose}>
            <div className="h-full flex flex-col border-b border-slate-200 ">
                <div className="flex items-center justify-between py-6 px-4 sm:px-6">
                    <h3 className="text-lg font-medium text-slate-900 truncate">Variables</h3>
                    <IconButton Icon={XMarkIcon} onClick={handleClose} className="ml-3 h-7 flex items-center"/>
                </div>
                {flow && (<Variables flowVariables={flow.variables}/>)}
            </div>

            {/* Overlays */}
            <VariableFormModal/>
        </SlideOver>
    );
}

const selector = (state: PenflowStore) => ({
    handleCreateVariable: () => state.setIsVariablesFormOpen(true, "new")
});

type VariablesProps = {
    flowVariables: { [p: string]: FlowVariable }
};

function Variables({flowVariables}: VariablesProps) {
    const {handleCreateVariable} = usePenflowStore(useShallow(selector));

    const sortedVariables = useMemo(() => {
        return [
            {
                type: "io",
                category: "IO variables",
                variables: Object.fromEntries(
                    Object.entries(flowVariables).filter(([_, value]) => value.scope != "local")
                )
            },
            {
                type: "local",
                category: "Local variables",
                variables: Object.fromEntries(
                    Object.entries(flowVariables).filter(([_, value]) => value.scope === "local")
                )
            }
        ];
    }, [flowVariables]);

    return (
        <TabGroup as={Fragment}>
            <TabList className="flex justify-between items-center -mb-px border-b border-slate-200 px-6">
                <div className="flex space-x-6">
                    {sortedVariables.map(({category}) => (
                        <Tab
                            key={category}
                            className={"flex gap-x-2 items-center text-sm font-medium text-slate-500 whitespace-nowrap border-transparent border-b-2 px-1 pb-4"
                                + " data-[hover]:text-slate-700 data-[hover]:border-slate-200"
                                + " data-[selected]:text-slate-900 data-[selected]:border-slate-900"
                                + " data-[selected]:data-[hover]:text-slate-900 data-[selected]:data-[hover]:border-slate-900"
                            }
                        >
                            {category}
                        </Tab>
                    ))}
                </div>
            </TabList>
            <TabPanels as={Fragment}>
                {sortedVariables.map(({type, variables}) => (
                    <TabPanel
                        key={type}
                        className="flex flex-col flex-1 overflow-y-auto focus:outline-none"
                    >
                        {type === "io" && (
                            <div className="px-6 py-4 border-b border-slate-200">
                                <button
                                    onClick={handleCreateVariable}
                                    className={"group w-full flex items-center justify-center"
                                    + " border-2 border-slate-200 border-dashed rounded-md py-2"
                                    + " hover:border-slate-300"}
                                >
                                    <PlusCircleIcon className="size-6 text-slate-200 group-hover:text-slate-300" />
                                </button>
                            </div>
                        )}
                        <VariableList variables={variables} />
                    </TabPanel>
                ))}
            </TabPanels>
        </TabGroup>
    );
}
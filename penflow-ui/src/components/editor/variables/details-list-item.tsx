"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { usePenflowStore } from "@/hooks/store-provider";
import { getPrintableType } from "@/lib/utils";
import type { PenflowStore } from "@/stores/store";
import { FlowVariable } from "@/types/FlowVariable";

const selector = (state: PenflowStore) => ({
    handleEditVariable: (variableName: string) => state.setIsVariablesFormOpen(true, variableName),
    handleDeleteVariable: (variableName: string) => state.deleteVariable(variableName),
});

type VariableListItemProps = {
    variableName: string,
    variable: FlowVariable
};

export default function VariableListItem({ variableName, variable }: VariableListItemProps) {
    const { handleEditVariable, handleDeleteVariable } = usePenflowStore(useShallow(selector));

    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                    <p className="text-sm font-semibold leading-6 text-slate-900">{variableName}</p>
                    <Badge
                        text={getPrintableType(variable)}
                        color="slate"
                    />
                </div>
                <div className="flex items-center text-xs leading-5 text-slate-500 mt-1">
                    <p className="truncate">{variable.description}</p>
                </div>
            </div>
            <Menu>
                <MenuButton className="flex align-items rounded-md -m-1 p-1">
                    <EllipsisVerticalIcon className="size-6"/>
                </MenuButton>
                <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <MenuItems
                        anchor="bottom end"
                        className={"origin-top-right w-48 rounded-md shadow-md"
                            + " ring-1 ring-black ring-opacity-5 p-1 bg-white focus:outline-none"
                        }
                    >
                        <MenuItem disabled={variable.scope === "local"}>
                            <button
                                onClick={() => handleEditVariable(variableName)}
                                className={"group w-full flex items-center gap-2 text-sm text-gray-700 rounded-md p-2"
                                    + " data-[focus]:bg-slate-100 data-[disabled]:opacity-50"
                                }>
                                <PencilIcon className="size-4 text-slate-700"/> Edit
                            </button>
                        </MenuItem>
                        <MenuItem disabled={variable.scope === "local"}>
                            <button
                                onClick={() => handleDeleteVariable(variableName)}
                                className={"group w-full flex items-center gap-2 text-sm text-gray-700 rounded-md p-2"
                                    + " data-[focus]:bg-slate-100 data-[disabled]:opacity-50"
                                }>
                                <TrashIcon className="size-4 text-slate-700"/> Delete
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"

import { Modal } from "@/components/ui/modal";
import { usePenflowStore } from "@/hooks/store-provider";
import { getFlowTaskFromTask } from "@/lib/utils";
import type { PenflowStore } from "@/stores/store";
import type { Task } from "@/types/Task";

const selector = (state: PenflowStore) => ({
    isOpen: state.isTasksCommandPaletteOpen,
    onClose: () => state.setIsTasksCommandPaletteOpen(false),
    tasks: state.tasks,
    addFlowTask: state.addFlowTask
});

export default function TaskCommandPalette() {
    const { isOpen, onClose, tasks, addFlowTask } = usePenflowStore(useShallow(selector));
    const [query, setQuery] = useState<string>("");

    function handleAdd(task: Task) {
        if (task != null) {
            addFlowTask(getFlowTaskFromTask(task));
        }
        onClose();
    }

    const filteredTasks: Task[] =
        query === ''
            ? tasks
            : tasks.filter((task: Task) => task.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Combobox
                as="div"
                onChange={handleAdd}
                onClose={() => setQuery("")}
                className="overflow-hidden mx-auto max-w-2xl bg-white divide-y divide-slate-200 rounded-md"
            >
                <div className="relative flex flex-auto items-center px-4">
                    <div className="w-5 h-5 flex-none text-slate-400">
                        <MagnifyingGlassIcon />
                    </div>
                    <ComboboxInput
                        autoFocus
                        placeholder="Search tasks"
                        onChange={(event) => setQuery(event.target.value)}
                        maxLength={64}
                        className="flex-auto min-w-0 h-14 ml-3 mr-4 border-0 p-0 bg-transparent text-base text-slate-800 placeholder-slate-400 focus:ring-0"
                    />
                    <button
                        className="flex-none w-7 h-6 rounded-lg ring-1 ring-black/[0.05] px-1.5 py-1 hover:ring-black/[0.1]"
                        onClick={() => onClose()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="7" fill="none">
                            <path
                                d="M.506 6h3.931V4.986H1.736v-1.39h2.488V2.583H1.736V1.196h2.69V.182H.506V6ZM8.56 1.855h1.18C9.721.818 8.87.102 7.574.102c-1.276 0-2.21.705-2.205 1.762-.003.858.602 1.35 1.585 1.585l.634.159c.633.153.986.335.988.727-.002.426-.406.716-1.03.716-.64 0-1.1-.295-1.14-.878h-1.19c.03 1.259.931 1.91 2.343 1.91 1.42 0 2.256-.68 2.259-1.745-.003-.969-.733-1.483-1.744-1.71l-.523-.125c-.506-.117-.93-.304-.92-.722 0-.375.332-.65.934-.65.588 0 .949.267.994.724ZM15.78 2.219C15.618.875 14.6.102 13.254.102c-1.537 0-2.71 1.086-2.71 2.989 0 1.898 1.153 2.989 2.71 2.989 1.492 0 2.392-.992 2.526-2.063l-1.244-.006c-.117.623-.606.98-1.262.98-.883 0-1.483-.656-1.483-1.9 0-1.21.591-1.9 1.492-1.9.673 0 1.159.389 1.253 1.028h1.244Z"
                                fill="#334155"/>
                        </svg>
                    </button>
                </div>
                {filteredTasks.length > 0 ? (
                    <ComboboxOptions static className="overflow-y-auto scroll-py-3 max-h-96 p-3">
                        {filteredTasks.map((task: Task) => (
                            <ComboboxOption
                                key={task.name}
                                value={task}
                                className="gorup flex cursor-default rounded-lg p-3 data-[focus]:bg-slate-100"
                            >
                                <div className={
                                    "flex flex-none items-center justify-center w-10 h-10 rounded-lg bg-slate-100"
                                    + " group-data-focus:border group-data-focus:border-slate-200"
                                }>
                                    <Image
                                        src={task.icon || ""}
                                        width={24}
                                        height={24}
                                        alt={task.displayName + " icon"}
                                    />
                                </div>
                                <div className="flex-auto ml-4 overflow-hidden">
                                    <p className={"text-sm font-medium overflow-hidden whitespace-nowrap"
                                        + " text-slate-700 text-ellipsis group-data-focus:text-slate-900"
                                    }>
                                        {task.displayName}
                                    </p>
                                    <p className="text-sm text-slate-500 line-clamp-2 group-data-focus:text-slate-700">
                                        {task.description}
                                    </p>
                                </div>
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                ) : (
                    <div className="pt-10 pb-8 px-6 text-center text-sm sm:px-14">
                        <p className="mb-10 font-semibold text-slate-600">
                            No results for &quot;<strong className="font-bold text-slate-900">{query}</strong>&quot;
                        </p>
                    </div>
                )}
            </Combobox>
        </Modal>
    );
}

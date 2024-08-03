"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation'
import { useShallow } from "zustand/react/shallow";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Modal } from "@/components/ui/modal";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Textarea } from "@/components/ui/form/textarea";
import { usePenflowStore } from "@/hooks/store-provider";
import { createFlow } from "@/lib/actions";
import type { PenflowStore } from "@/stores/store";

const selector = (state: PenflowStore) => ({
    isOpen: state.isFlowFormOpen,
    closeFlowForm: () => state.setIsFlowFormOpen(false)
});

export default function CreateFlowForm() {
    const { isOpen, closeFlowForm } = usePenflowStore(useShallow(selector));
    const [flowName, setFlowName] = useState<string>("Blank Flow");
    const [flowDescription, setFlowDescription] = useState<string>("");

    const handleClose = () => {
        setFlowName("Blank Flow");
        closeFlowForm();
    };

    const handleSave = async (formData: FormData) => {
        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string
        };

        await createFlow(rawData.name, rawData.description)

        setFlowName("Blank Flow");
        closeFlowForm();
    };

    return(
        <Modal isOpen={isOpen} onClose={handleClose}>
            <form action={handleSave}>
                <div className="flex flex-col max-h-full mx-auto divide-y divide-slate-200 rounded-xl bg-white">
                    <div className="flex-shrink-0 px-4 py-5 sm:px-6">
                        <div className="flex items-start justify-between">
                            <h3 className="text-base font-semibold text-slate-900 leading-6">Flow creator</h3>
                            <IconButton
                                Icon={XMarkIcon}
                                onClick={handleClose}
                                className="h-7 flex items-center"
                            />
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto px-4 py-5 sm:p-6">
                        <div className="space-y-4">
                            <Input
                                name="name"
                                type="text"
                                value={flowName}
                                onChange={setFlowName}
                                displayName="Flow name"
                                isRequired={true}
                            />
                            <Textarea
                                name="description"
                                rows={4}
                                value={flowDescription || ""}
                                onChange={setFlowDescription}
                                displayName="Description"
                                description="A brief description of the flow purpose."
                                maxCharacters={255}
                                minHeight="min-h-[100px]"
                                maxHeight="max-h-[150px]"
                            />
                        </div>
                    </div>
                    <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                        <div className="flex gap-x-4 justify-end">
                            <Button type="button" role="secondary" onClick={handleClose}>Cancel</Button>
                            <Button type="submit" role="primary">Save</Button>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
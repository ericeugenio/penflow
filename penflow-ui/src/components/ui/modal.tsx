import React, { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Overlay, OverlayPanel } from "@/components/ui/overlay";
import { Button, IconButton } from "@/components/ui/button";

export const modalDefaultStyles = "w-full overflow-hidden mx-auto shadow rounded-lg bg-white";

type ModalProps = {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode,
};

export function Modal({ isOpen, onClose, children }: ModalProps) {
    return (
        <Overlay isVisible={isOpen} onClose={onClose}>
            <div className="fixed inset-0 w-screen flex items-start justify-center p-4 sm:p-6 md:p-20">
                <OverlayPanel
                    animation={{
                        enter: "ease-out duration-200",
                        enterFrom: "opacity-0 scale-95",
                        enterTo: "opacity-100 scale-100",
                        leave: "ease-in duration-200",
                        leaveFrom: "opacity-100 scale-100",
                        leaveTo: "opacity-0 scale-95",
                    }}
                    className="size-full max-w-2xl max-h-full"
                >
                    {children}
                </OverlayPanel>
            </div>
        </Overlay>
    );
}

type ModalFormProps = {
    isOpen: boolean,
    tittle: string,
    onCancel: () => void,
    onSave: () => void,
    children: ReactNode,
};

export function ModalForm({ isOpen, tittle, onCancel, onSave, children }: ModalFormProps) {
    return (
        <Modal isOpen={isOpen} onClose={onCancel}>
            <div className="flex flex-col max-h-full mx-auto divide-y divide-slate-200 rounded-xl bg-white">
                <div className="flex-shrink-0 px-4 py-5 sm:px-6">
                    <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold text-slate-900 leading-6">{tittle}</h3>
                        <IconButton
                            Icon={XMarkIcon}
                            onClick={onCancel}
                            className="h-7 flex items-center"
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto px-4 py-5 sm:p-6">
                    {children}
                </div>
                <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                    <div className="flex justify-end">
                        <Button type="button" role="secondary" onClick={onCancel}>Cancel</Button>
                        <Button type="button" role="primary" onClick={onSave} className="ml-4">Save</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

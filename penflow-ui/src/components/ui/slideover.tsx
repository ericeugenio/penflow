import { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Overlay, OverlayPanel } from "@/components/ui/overlay";
import { Button, IconButton } from "@/components/ui/button";

type SlideOverProps = {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode,
};

export function SlideOver({ isOpen, onClose, children }: SlideOverProps) {
    return (
        <Overlay isVisible={isOpen} onClose={onClose}>
            <div className="fixed inset-y-0 right-0 flex pl-10">
                <OverlayPanel
                    animation={{
                        enter: "transform transition ease-in-out duration-300",
                        enterFrom: "translate-x-full",
                        enterTo: "translate-x-0",
                        leave: "transform transition ease-in-out duration-300",
                        leaveFrom: "translate-x-0",
                        leaveTo: "translate-x-full",
                    }}
                    className="w-screen max-w-md"
                >
                    <div className="flex flex-col h-full bg-white">
                        {children}
                    </div>
                </OverlayPanel>
            </div>
        </Overlay>
    );
}

type SlideOverFormProps =  {
    title: string,
    isOpen: boolean,
    onCancel: () => void,
    onSave: () => void,
    children: ReactNode,
};

export function SlideOverForm({ title, isOpen, onCancel, onSave, children}: SlideOverFormProps) {
    return (
        <SlideOver isOpen={isOpen} onClose={onCancel}>
            <div className="min-h-0 flex flex-1 flex-col overflow-y-auto border-b border-slate-200 py-6 px-4 sm:px-6">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-slate-900 truncate">{title}</h3>
                    <IconButton Icon={XMarkIcon} onClick={onCancel} className="ml-3 h-7 flex items-center"/>
                </div>
                <div className="flex flex-col mt-6">
                    {children}
                </div>
            </div>
            <div className="flex-shrink-0 flex justify-end p-4">
                <Button type="button" role="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="button" role="primary" onClick={onSave} className="ml-4">Save</Button>
            </div>
        </SlideOver>
    );
}

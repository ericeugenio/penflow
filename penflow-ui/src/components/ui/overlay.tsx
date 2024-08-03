import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { ReactNode } from "react";

type OverlayProps = {
    isVisible: boolean,
    onClose: (value: boolean) => void,
    withBackground?: boolean,
    children: ReactNode,
};

export function Overlay({ isVisible, onClose, withBackground = true, children }: OverlayProps) {
    return (
        <Transition show={isVisible}>
            <Dialog onClose={onClose} className="fixed inset-0 overflow-hidden">
            {withBackground && (
                <TransitionChild
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-500 bg-opacity-50 backdrop-blur-sm"/>
                </TransitionChild>
            )}
                {children}
            </Dialog>
        </Transition>
    );
}

type OverlayPanelProps = {
    className?: string,
    animation?: {
        enter?: string
        enterFrom?: string
        enterTo?: string
        leave?: string
        leaveFrom?: string
        leaveTo?: string
    },
    children: ReactNode,
};

export function OverlayPanel({ className, animation, children }: OverlayPanelProps) {
    return (
        <TransitionChild
            enter={animation?.enter}
            enterFrom={animation?.enterFrom}
            enterTo={animation?.enterTo}
            leave={animation?.leave}
            leaveFrom={animation?.leaveFrom}
            leaveTo={animation?.leaveTo}
        >
            <DialogPanel className={className}>
                {children}
            </DialogPanel>
        </TransitionChild>
    );
}

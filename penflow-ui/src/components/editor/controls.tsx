import { useReactFlow } from "reactflow";
import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    ViewfinderCircleIcon
} from "@heroicons/react/24/outline";

import { IconButton } from "@/components/ui/button";

const buttons = [
    { id: 0, icon: ArrowUturnLeftIcon, handleOnClick: () => console.log("TODO: undo")},
    { id: 1, icon: ArrowUturnRightIcon, handleOnClick: () => console.log("TODO: redo")},
];

export function HistoryControls() {
    return (
        <div className="flex divide-x divide-slate-100 border border-slate-200 rounded-lg bg-white">
            { buttons.map((button) => (
                <IconButton
                    key={button.id}
                    Icon={button.icon}
                    onClick={button.handleOnClick}
                    className="size-8 p-1 sm:size-10 sm:p-2 hover:bg-slate-100"
                />
            ))}
        </div>
    )
}

export function ViewportControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const buttons = [
        { id: 0, icon: MagnifyingGlassPlusIcon, handleOnClick: () => zoomIn({ duration: 600 })},
        { id: 1, icon: MagnifyingGlassMinusIcon, handleOnClick: () => zoomOut({ duration: 600 })},
        { id: 2, icon: ViewfinderCircleIcon, handleOnClick: () => fitView({ duration: 600, padding: 0.25 })},
    ];

    return (
        <div className="flex divide-x divide-slate-100 border border-slate-200 rounded-lg bg-white">
            { buttons.map((button) => (
                <IconButton
                    key={button.id}
                    Icon={button.icon}
                    onClick={button.handleOnClick}
                    className="size-8 p-1 sm:size-10 sm:p-2 hover:bg-slate-100"
                />
            ))}
        </div>
    )
}
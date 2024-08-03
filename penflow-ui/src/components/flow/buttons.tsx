"use client";

import { useShallow } from "zustand/react/shallow";

import type { PenflowStore } from "@/stores/store";
import { usePenflowStore } from "@/hooks/store-provider";
import { Button } from "@/components/ui/button";

type ButtonProps = {
    className?: string,
};

export function CreateFlowButton({ className }: ButtonProps) {
    const { handleOpenFlowForm } = usePenflowStore(useShallow((state: PenflowStore) => ({
        handleOpenFlowForm: () => state.setIsFlowFormOpen(true),
    })));

    return (
        <Button
            type="button"
            role="primary"
            onClick={handleOpenFlowForm}
            className={className}
        >
            Create
        </Button>
    );
}


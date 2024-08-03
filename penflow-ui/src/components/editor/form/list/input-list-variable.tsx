import React, { useState } from "react";

import { ListBulletIcon } from "@heroicons/react/24/outline";

import { IconButton } from "@/components/ui/button";
import { InputVariable } from "@/components/editor/form/input-variable";
import { InputListModal } from "@/components/editor/form/list/input-list-modal";
import { classNames } from "@/lib/utils";
import type { PropertyType } from "@/types/Property";

const MAX_ITEMS = 25;

type InputListProps = {
    name: string,
    items: string | (string|number|boolean)[],
    itemsType: PropertyType,
    onListChanges?: (newValue: string | (string|number|boolean)[]) => void,
    variables?: string[],
    displayName: string,
    displayNameHelp?: string,
    description?: string,
    errors?: string[],
    isRequired?: boolean,
    isDisabled?: boolean,
    className?: string,
    maxItems?: number,
};

export function InputListVariable({
    name,
    items,
    itemsType,
    onListChanges,
    variables = [],
    displayName,
    displayNameHelp,
    description,
    errors = [],
    isRequired = false,
    isDisabled = false,
    className,
    maxItems = MAX_ITEMS,
}: InputListProps) {
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    return (
        <div className={className}>
            <div className="flex gap-x-4">
                <InputVariable
                    key={name}
                    name={name}
                    type="text"
                    value={typeof items === "string" ? items : `[${items.join(", ")}]`}
                    variables={variables}
                    onChange={onListChanges}
                    displayName={displayName}
                    displayNameHelp={displayNameHelp}
                    description={description}
                    errors={errors}
                    isRequired={isRequired}
                    isDisabled={isDisabled}
                    isReadOnly={true}
                    className="flex-1"
                />
                <div className="mt-6">
                    <IconButton
                        Icon={ListBulletIcon}
                        onClick={() => setModalOpen(true)}
                        className={classNames("border rounded-md px-4 py-1.5 bg-slate-50",
                            "focus:outline-none focus:ring-1",
                            errors.length > 0
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:border-slate-900 focus:ring-slate-900",
                            isDisabled
                                ? "disabled:border-slate-200 disabled:text-slate-500 disabled:bg-slate-100"
                                : "hover:bg-slate-100 "
                        )}
                    />
                </div>
            </div>

            {/* Overlays */}
            <InputListModal
                type={itemsType}
                items={typeof items === "string" ? [] : items}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onListChanges={onListChanges}
                maxItems={maxItems}
            />
        </div>
    );
}
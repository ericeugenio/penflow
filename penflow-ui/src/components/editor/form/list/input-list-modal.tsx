import React, { useMemo, useState } from "react";

import { PlusCircleIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button, IconButton } from "@/components/ui/button";
import { type Option, Select } from "@/components/ui/form/select";
import { Modal } from "@/components/ui/modal";
import { classNames } from "@/lib/utils";
import type { PropertyType } from "@/types/Property";

type InputListModalProps = {
    type: PropertyType,
    items: (string|number|boolean)[],
    isOpen: boolean,
    onClose: () => void,
    onListChanges?: (newValue: (string|number|boolean)[]) => void,
    maxItems: number
};

export function InputListModal({
    type,
    items,
    isOpen,
    onClose,
    onListChanges,
    maxItems
}: InputListModalProps) {
    const [tmpItems, setTmpItems] = useState<(string|number|boolean)[]>([...items]);
    const [selectedType, setSelectedType] = useState<PropertyType>(type === "any" ? "string" : type);

    let typeOptions: Option[] = useMemo(() => {
        switch (type) {
            case "string":
            case "number":
            case "boolean":
                return [{text: type, value: type}]
            case "any":
                return [
                    {text: "string", value: "string"},
                    {text: "number", value: "number"},
                    {text: "boolean", value: "boolean"}
                ]
        }
    }, [type])!;

    const handleTypeChange = (change: Option) => {
        if (change.value != selectedType) {
            setTmpItems([]);
            setSelectedType(change.value as "string"|"number"|"boolean");
        }
    };

    const handleAddItem = () => {
        const defaultValues: {[key: string]: string|number|boolean} = {
            string: "",
            number: 0,
            boolean: false,
        };
        setTmpItems([
            ...tmpItems,
            defaultValues[selectedType]
        ]);
    };

    const handleDeleteItem = (itemIndex: number) => {
        setTmpItems(tmpItems.filter((_, index) => index != itemIndex));
    }

    const handleEditItem = (itemIndex: number, change: string|number|boolean) => {
        setTmpItems(tmpItems.map((item, index) => index === itemIndex ? change : item));
    };

    const handleClose = () => {
        setTmpItems([...items]);
        onClose();
    };

    const handleSave = () => {
        if (onListChanges) {
            onListChanges([...tmpItems]);
        }
        onClose();
    };

    const renderItem = (item: string|number|boolean, index: number) => {
        return (
            <div
                key={index}
                className={classNames("group flex items-center gap-x-4 w-full",
                    "odd:bg-white even:bg-slate-50",
                    index + 1 === tmpItems.length && tmpItems.length < 8 ? "border-b border-slate-200" : ""
                )}
            >
                <div className="h-full flex justify-center border-r border-slate-200 p-2">
                    <span className="flex justify-center w-6">{index}</span>
                </div>
                <div className="flex-1 h-full min-w-0">
                    <input
                        type={
                            typeof item === "number"
                                ? "number"
                                : typeof item === "boolean"
                                    ? "checkbox"
                                    : "text"
                        }
                        value={typeof item === "boolean" ? undefined : item}
                        checked={typeof item === "boolean" ? item : undefined}
                        onChange={(event) => {
                            switch(typeof item) {
                                case "string":
                                    handleEditItem(index, event.target.value);
                                    break;
                                case "number":
                                    if (!isNaN(Number(event.target.value))) {
                                        handleEditItem(index, Number(event.target.value));
                                    }
                                    break;
                                case "boolean":
                                    handleEditItem(index, event.target.checked);
                                    break;
                            }
                        }}
                        className={classNames(
                            typeof item === "boolean"
                                ? "size-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                                : "w-full text-sm border-0 -ml-4 -my-2 py-2 pl-4 bg-transparent focus:ring-0"
                        )}
                    />
                </div>
                <div className="pr-4">
                    <IconButton
                        Icon={TrashIcon}
                        role="danger"
                        onClick={() => handleDeleteItem(index)}
                        className="invisible flex items-center justify-center size-9 group-hover:visible"
                    />
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col max-h-full mx-auto divide-y divide-slate-200 rounded-xl bg-white">
                <div className="flex-shrink-0 px-4 py-5 sm:px-6">
                    <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold text-slate-900 leading-6">List editor</h3>
                        <IconButton
                            Icon={XMarkIcon}
                            onClick={handleClose}
                            className="h-7 flex items-center"
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-grow overflow-y-auto px-4 py-5 sm:p-6">
                    <div className="flex-shrink-0 flex items-center gap-x-4 mb-4">
                        <Select
                            name="itemsType"
                            value={typeOptions.find((option) => option.value === selectedType)}
                            options={typeOptions}
                            onChange={handleTypeChange}
                            isRequired={true}
                            empty={false}
                            className="min-w-32 -mt-1"
                        />
                        <IconButton
                            Icon={PlusCircleIcon}
                            onClick={handleAddItem}
                            disabled={tmpItems.length >= maxItems}
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto w-full h-80 border border-slate-200 rounded-md">
                        {tmpItems.map((item, index) => {
                            return renderItem(item, index)
                        })}
                    </div>
                    <p className="flex-shrink-0 flex items-center justify-end text-xs text-slate-400 mt-1">
                        {`${tmpItems.length} / ${maxItems}`}
                    </p>
                </div>
                <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                    <div className="flex justify-end">
                        <Button type="button" role="secondary" onClick={handleClose}>Cancel</Button>
                        <Button type="button" role="primary" onClick={handleSave} className="ml-4">Save</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

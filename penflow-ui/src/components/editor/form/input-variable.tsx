import React, { useEffect, useRef, useState } from "react";

import {
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption,
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition, Field, Label, Input, Description
} from "@headlessui/react";
import { ExclamationCircleIcon, VariableIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/ui/badge";
import { classNames } from "@/lib/utils";

type InputVariableProps = {
    name: string,
    type?: string,
    value?: string,
    variables?: string[],
    onChange?: (newValue: string) => void,
    displayName?: string,
    displayNameHelp?: string,
    description?: string,
    errors?: string[],
    isRequired?: boolean,
    isDisabled?: boolean,
    isReadOnly?: boolean,
    className?: string
};

export function InputVariable({
    name,
    type,
    value,
    variables = [],
    onChange,
    displayName,
    displayNameHelp,
    description,
    errors = [],
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    className,
}: InputVariableProps) {
    const [query, setQuery] = useState<string>("");
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleComboboxSelect = (value: string) => {
        if (value != null) {
            const variableValue = `\$${value}`;

            if (inputRef.current) {
                inputRef.current.value = variableValue;
                if (onChange) {
                    onChange(variableValue);
                }
            }
        }
    };

    useEffect(() => {
        if (popoverRef.current) {
            document.getElementById(`${name}-popover-button`)!.style.setProperty(
                "--popover-panel-width",
                `${popoverRef.current.offsetWidth}px`
            );
        }
    }, [name, popoverRef]);

    const filteredOptions =
        query === ""
            ? variables
            : variables.filter((variable) => variable.toLowerCase().includes(query.toLowerCase()));

    return (
        <Field className={className}>
            {displayName && (
                <div className="flex items-center gap-x-3">
                    <Label htmlFor={name} className="block text-sm font-medium text-slate-700">
                        {displayName}
                        {isRequired && <span className="text-red-700 font-bold">*</span>}
                    </Label>
                    {displayNameHelp &&  <Badge text={displayNameHelp} color="slate"/>}
                </div>
            )}
            <div
                id={`${name}-popover-button`}
                ref={popoverRef}
                className={classNames("relative flex rounded-md",
                    displayNameHelp ? "mt-2" : "mt-1"
                )}
            >
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <Input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        ref={inputRef}
                        disabled={isDisabled}
                        readOnly={isReadOnly}
                        onChange={(event) => onChange ? onChange(event.target.value) : {}}
                        className={classNames("block w-full rounded-l-md text-sm",
                            errors.length > 0
                                ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:border-slate-900 focus:ring-slate-900",
                            isDisabled
                                ? "disabled:border-slate-200 disabled:text-slate-500 disabled:bg-slate-50"
                                : ""
                        )}
                    />
                    {errors.length > 0 && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ExclamationCircleIcon className="size-5 text-red-500"/>
                        </div>
                    )}
                </div>
                <Popover>
                    <PopoverButton
                        disabled={isDisabled}
                        className={classNames("relative inline-flex items-center",
                            "-ml-px border rounded-r-md px-4 py-2 bg-slate-50",
                            "focus:outline-none focus:ring-1",
                            errors.length > 0
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:border-slate-900 focus:ring-slate-900",
                            isDisabled
                                ? "disabled:border-slate-200 disabled:text-slate-500 disabled:bg-slate-100"
                                : "hover:bg-slate-100 "
                        )}>
                        <VariableIcon className="size-5 text-slate-700"/>
                    </PopoverButton>
                    <Transition
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <PopoverPanel
                            className={"absolute top-full left-0 z-10 w-[var(--popover-panel-width)] text-sm"
                                + " mt-1 shadow-md ring-1 ring-black ring-opacity-5 rounded-md p-1 bg-white"
                                + " focus:outline-none"
                            }
                        >
                            {({close}) => (
                                <Combobox
                                    immediate
                                    onChange={(value: string) => {
                                        handleComboboxSelect(value);
                                        close()
                                    }}
                                    onClose={() => setQuery("")}
                                >
                                    <ComboboxInput
                                        autoFocus
                                        placeholder="Search..."
                                        onChange={(event) => setQuery(event.target.value)}
                                        className={"w-full rounded-md border-0 bg-slate-100 px-4 py-2.5 focus:ring-0"
                                            + " text-sm text-slate-900 placeholder-slate-500 "
                                        }
                                    />
                                    {filteredOptions.length > 0 ? (
                                        <ComboboxOptions
                                            className="-mb-2 max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-slate-800">
                                            {filteredOptions.map((variable) => (
                                                <ComboboxOption
                                                    key={variable}
                                                    value={variable}
                                                    className={"cursor-default select-none rounded-md px-4 py-2"
                                                        + " data-[focus]:bg-slate-100"
                                                    }
                                                >
                                                    {variable}
                                                </ComboboxOption>
                                            ))}
                                        </ComboboxOptions>
                                    ) : (
                                        <div className="py-8 px-4 text-center sm:px-14">
                                            <p className="mt-4 text-sm text-slate-900">
                                                No results for &quot;<strong className="font-bold text-slate-900">{query}</strong>&quot;
                                            </p>
                                        </div>
                                    )}
                                </Combobox>
                            )}
                        </PopoverPanel>
                    </Transition>
                </Popover>
            </div>
            {errors.length > 0 && errors.map((err) => (
                <p key={err} id={`${name}-error`} className="mt-2 text-sm text-red-600">{err}</p>
            ))}
            {description && (
                <Description id={`${name}-description`} className="mt-2 text-sm text-slate-500">{description}</Description>
            )}
        </Field>
    );
}
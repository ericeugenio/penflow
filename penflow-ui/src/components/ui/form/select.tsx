import { Description, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

import { classNames } from "@/lib/utils";

export type Option = {
    text: string,
    value: string | null,
    description?: string,
    disabled?: boolean
};

const emptyOption: Option = {
    text: "--Please choose an option--",
    value: null
};

type SelectProps = {
    name: string,
    value?: Option,
    options: Option[],
    onChange?: (newValue: Option) => void,
    displayName?: string,
    description?: string,
    errors?: string[],
    isRequired?: boolean,
    empty?: boolean,
    className?: string
};

export function Select({
    name,
    value,
    options,
    onChange,
    displayName,
    description,
    errors = [],
    isRequired = false,
    empty = true,
    className
}: SelectProps) {
    const optionsCopy = empty ? [emptyOption, ...options] : [...options];

    return (
        <Field className={className}>
            {displayName && (
                <Label className="block text-sm font-medium text-slate-700">
                    {displayName}
                    {isRequired && <span className="text-red-700 font-bold">*</span>}
                </Label>
            )}
            <Listbox
                as="div"
                name={name}
                value={value || optionsCopy[0] || null}
                onChange={onChange}
                className="mt-1 relative"
            >
                <ListboxButton
                    className={classNames("relative w-full text-sm text-left cursor-default",
                        "border rounded-md pl-3 py-2 bg-white focus:ring-1",
                        errors?.length > 0
                        ? "pr-16 border-red-300 text-red-500 focus:border-red-500 focus:ring-red-500"
                        : "pr-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                    )}
                >
                    <span className="block truncate">{value?.text || emptyOption.text}</span>
                    {errors?.length > 0 && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-9 pointer-events-none">
                            <ExclamationCircleIcon className="size-5 text-red-500" />
                        </span>
                    )}
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDownIcon
                            className={classNames("size-5",
                                errors?.length > 0 ? "text-red-500" : "text-slate-300"
                            )
                        }/>
                    </span>
                </ListboxButton>
                <Transition
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <ListboxOptions
                        anchor="bottom"
                        className={"absolute z-10 w-[var(--button-width)] max-h-60 overflow-auto text-sm"
                            + " mt-1 shadow-md ring-1 ring-black ring-opacity-5 rounded-md p-1 bg-white"
                            + " focus:outline-none "
                        }
                    >
                        {optionsCopy.map((option) => (
                            <ListboxOption
                                key={option.text}
                                value={option}
                                disabled={option.disabled}
                                className={"group cursor-default select-none flex items-center gap-2 text-slate-900 rounded-md py-2 px-4"
                                     + " data-[focus]:bg-slate-100 data-[disabled]:opacity-50"
                                }
                            >
                                <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                                <div className="block truncate font-normal group-data-[selected]:font-semibold">{option.text}</div>
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Transition>
            </Listbox>
            {errors?.length > 0 && errors.map((err) => (
                <p key={err} id={`${name}-error`} className="mt-2 text-sm text-red-600">{err}</p>
            ))}
            {description && (
                <Description as="p" className="mt-2 text-sm text-slate-500">
                    {description}
                </Description>
            )}
        </Field>
    );
}
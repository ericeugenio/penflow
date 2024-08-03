import React from "react";
import {
    Description,
    Field,
    Label,
    Switch
} from "@headlessui/react";

type InputProps = {
    name: string,
    checked?: boolean,
    onChange?: (checked: boolean) => void,
    displayName: string,
    description?: string,
    isRequired?: boolean,
    className?: string
};

export function Toggle({
    name,
    checked,
    onChange,
    displayName,
    description,
    isRequired = false,
}: InputProps) {
    return (
        <Field className="flex items-center justify-between gap-x-4">
            <span className="flex flex-col flex-grow">
                <Label as="span" className="text-sm font-medium text-slate-700" passive>
                    {displayName}
                    {isRequired && <span className="text-red-700 font-bold">*</span>}
                </Label>
                { description && (
                    <Description as="span" className="text-sm text-slate-500">
                        {description}
                    </Description>
                )}
            </span>
            <Switch
                name={name}
                checked={checked}
                onChange={onChange}
                className={"group cursor-pointer relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full bg-slate-200"
                    + " transition-colors ease-in-out duration-200"
                    + " focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    + " data-[checked]:bg-slate-900"
                }
            >
                <span
                    className={"pointer-events-none inline-block h-5 w-5 rounded-full shadow ring-0 bg-white"
                        + " transform translate-x-0 transition ease-in-out duration-200"
                        + " group-data-[checked]:translate-x-5"
                    }
                />
            </Switch>
        </Field>
    );
}
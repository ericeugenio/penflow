import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/ui/badge";
import { classNames } from "@/lib/utils";
import { Description, Field, Input as HeadlessInput, Label } from "@headlessui/react";

type InputProps = {
    name: string,
    type?: string,
    value?: string,
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

export function Input({
    name,
    type,
    value,
    onChange,
    displayName,
    displayNameHelp,
    description,
    errors = [],
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    className
}: InputProps) {
    return (
        <Field className={className}>
            {displayName && (
                <div className="flex items-center gap-x-3">
                    <Label htmlFor={name} className="block text-sm font-medium text-slate-700">
                        {displayName}
                        {isRequired && <span className="text-red-700 font-bold">*</span>}
                    </Label>
                    {displayNameHelp && <Badge text={displayNameHelp} color="slate"/>}
                </div>
            )}
            <div className="mt-1 relative">
                <HeadlessInput
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={(event) => onChange ? onChange(event.target.value) : {}}
                    disabled={isDisabled}
                    readOnly={isReadOnly}
                    className={classNames("block w-full rounded-md text-sm",
                        errors?.length > 0
                            ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-slate-300 focus:border-slate-900 focus:ring-slate-900",
                        isDisabled
                            ? "disabled:border-slate-200 disabled:text-slate-500 disabled:bg-slate-50"
                            : ""
                    )}
                />
                {errors?.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="size-5 text-red-500"/>
                    </div>
                )}
            </div>
            {errors?.length > 0 && errors.map((err) => (
                <p key={err} id={`${name}-error`} className="mt-2 text-sm text-red-600">{err}</p>
            ))}
            {description && <Description id={`${name}-description`} className="mt-2 text-sm text-slate-500">{description}</Description>}
        </Field>
    );
}
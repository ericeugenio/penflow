import React, { useEffect, useRef, useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/ui/badge";
import { classNames } from "@/lib/utils";

type InputTogglableProps = {
    name: string,
    type?: string,
    value?: string,
    enabled?: boolean,
    onEnable?: (isEnabled: boolean) => void,
    onChange?: (newValue: string) => void,
    displayName: string,
    displayNameHelp?: string,
    description?: string,
    errors?: string[],
    isRequired?: boolean,
    isDisabled?: boolean,
    className?: string
};

export function InputTogglable({
    name,
    type,
    value,
    enabled = false,
    onEnable,
    onChange,
    displayName,
    displayNameHelp,
    description,
    errors = [],
    isRequired = false,
    isDisabled = false,
    className
}: InputTogglableProps) {
    const [isEnabled, setIsEnabled] = useState<boolean>(enabled);
    const inputRef = useRef<HTMLInputElement>(null)

    const handleEnable = (enabled: boolean) => {
        if (onEnable) {
            onEnable(enabled);
        }

        setIsEnabled(enabled);
    };

    useEffect(() => {
        if (inputRef.current && isEnabled) {
            inputRef.current.focus();
        }
    }, [isEnabled]);

    return (
        <div className={className}>
            <div className="relative flex items-center gap-x-3">
                <input
                    id={`${name}-toggle`}
                    name={`${name}-toggle`}
                    type="checkbox"
                    checked={isEnabled}
                    disabled={isDisabled}
                    onChange={(event) => handleEnable(event.target.checked)}
                    className="size-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                />
                <div className="flex items-center gap-x-3">
                    <label htmlFor={name} className="block text-sm font-medium text-slate-700">
                        {displayName}
                        {isRequired && <span className="text-red-700 font-bold">*</span>}
                    </label>
                    {displayNameHelp && <Badge text={displayNameHelp} color="slate"/>}
                </div>
            </div>
            <div className="ml-7">
                <div
                    className={classNames("mt-1 relative",
                        displayNameHelp ? "mt-2" : "mt-1"
                    )}
                >
                    <input
                        id={name}
                        name={name}
                        ref={inputRef}
                        type={type}
                        value={value}
                        disabled={!isEnabled}
                        onChange={(event) => onChange ? onChange(event.target.value) : {}}
                        className={classNames("block w-full rounded-md text-sm",
                            errors?.length > 0
                            ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-slate-300 focus:border-slate-900 focus:ring-slate-900",
                        isEnabled
                            ? ""
                            : "disabled:border-slate-200 disabled:text-slate-500 disabled:bg-slate-50"
                    )}
                />
                {errors?.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="size-5 text-red-500" />
                    </div>
                )}
            </div>
            {errors?.length > 0 && errors.map((err) => (
                <p key={err} id={`${name}-error`} className="mt-2 text-sm text-red-600">{err}</p>
            ))}
            {description && <p id={`${name}-description`} className="mt-2 text-sm text-slate-500">{description}</p>}
            </div>
        </div>
    );
}
import React from "react";

type TextareaProps = {
    name: string,
    rows?: number,
    value?: string,
    onChange?: (newValue: string) => void,
    displayName: string,
    description?: string,
    errors?: string[],
    isRequired?: boolean,
    className?: string,
    maxCharacters?: number
    minHeight?: string,
    maxHeight?: string,
};

export function Textarea({
    name,
    rows,
    value,
    onChange,
    displayName,
    description,
    isRequired = false,
    className,
    maxCharacters,
    minHeight,
    maxHeight
}: TextareaProps) {
    return (
        <div className={className}>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">
                {displayName}
                {isRequired && <span className="text-red-700 font-bold">*</span>}
            </label>
            <div className="mt-1 relative">
                <textarea
                    id={name}
                    name={name}
                    rows={rows}
                    value={value}
                    onChange={(event) => {
                        onChange ? maxCharacters ? event.target.value.length <= maxCharacters ?
                            onChange(event.target.value)
                            : {}
                            : onChange(event.target.value)
                            : {}
                    }}
                    className={"block w-full rounded-md text-sm"
                        + ` ${minHeight} ${maxHeight} resize-y`
                        + " border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                    }
                />
                {maxCharacters && (
                    <p className="flex items-center justify-end text-xs text-slate-400 mt-1">
                        {`${value?.length} / ${maxCharacters}`}
                    </p>
                )}
            </div>
            {description && <p id={`${name}-description`} className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
    );
}
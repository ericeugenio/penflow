import React, { useEffect, useRef, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

import { IconButton } from "@/components/ui/button";

type EditableTextProps = {
    value: string,
    className?: string,
    textClassName: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onBlur?: () => void,
};

export function EditableText({
    value,
    className,
    textClassName,
    onChange,
    onBlur
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    const handleOnBlur = () => {
        if (onBlur) {
            onBlur();
        }
        setIsEditing(!isEditing);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "Escape":
            case "Enter":
                event.stopPropagation();
                break;
            default:
                break;
        }
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "Escape":
            case "Enter":
                event.stopPropagation();
                input.current?.blur();
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (isEditing && input.current) {
            input.current.focus();
            input.current.style.width = (value.length + 1).toString() + "ch";
        }
    }, [value, isEditing]);

    return (
        <div className={"flex items-center " + className}>
            {!isEditing ? (
                <h2 className={textClassName}>{value}</h2>
            ) : (
                <input
                    ref={input}
                    type="text"
                    value={value}
                    onChange={onChange}
                    onBlur={handleOnBlur}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    disabled={!isEditing}
                    className={"border-0 p-0 bg-transparent focus:ring-0 " + textClassName}
                />
            )}
            <IconButton
                Icon={PencilIcon}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "" : "ml-6" }
            />
        </div>
    );
}
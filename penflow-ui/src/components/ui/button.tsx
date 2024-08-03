import React, { type ReactNode } from "react";

const buttonColorMap: {[role: string]: { [a:string]: string }} = {
    primary: {
        text: "text-white",
        bg: "bg-slate-900",
        border: "border-transparent",
        focus: "focus:ring-slate-400",
        hover: "hover:bg-slate-800"
    },
    secondary: {
        text: "text-slate-700",
        bg: "bg-white",
        border: "border-slate-200",
        focus: "focus:ring-slate-400",
        hover: "hover:bg-slate-100"
    },
    danger: {
        text: "text-white",
        bg: "bg-red-500",
        border: "border-transparent",
        focus: "focus:ring-red-200",
        hover: "hover:bg-red-400"
    }
};

type ButtonProps = {
    Icon?: React.ElementType,
    type?: "button"
        | "submit"
        | "reset",
    role?: "primary"
        | "secondary"
        | "danger",
    className?: string,
    onClick?: () => void,
    disabled?: boolean
    children: ReactNode,
};

export function Button({
    Icon,
    type,
    role = "primary",
    className,
    onClick,
    disabled = false,
    children
}: ButtonProps) {
    const color = buttonColorMap[role];
    return (
        <div className={className}>
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={"w-fit inline-flex items-center text-sm font-semibold size-9 shadow-sm border rounded-md px-6 py-2"
                    + ` ${color.text} ${color.border} ${color.bg} ${color.hover} ${color.focus}`
                    + " focus:outline-none focus:ring-2 focus:ring-offset-2"
                }
            >
                { Icon && <Icon className={`size-4 mr-2 ${color.text} ${color.hover}`} /> }
                {children}
            </button>
        </div>
    );
}

const iconButtonColorMap: {[role: string]: { [a:string]: string }} = {
    primary: {
        text: "text-slate-700",
        bg: "bg-transparent",
        border: "border-transparent",
        focus: "focus:ring-slate-900",
        hover: "group-hover:text-slate-900"
    },
    danger: {
        text: "text-red-500",
        bg: "bg-transparent",
        border: "border-transparent",
        focus: "focus:ring-red-700",
        hover: "group-hover:text-red-700"
    }
};

type IconButtonProps = {
    Icon: React.ElementType,
    type?: "button"
        | "submit",
    role?: "primary"
        | "danger",
    className?: string,
    onClick?: () => void,
    disabled?: boolean,
};

export function IconButton({
    Icon,
    type="button",
    role="primary",
    className,
    onClick,
    disabled=false
}: IconButtonProps) {
    const color = iconButtonColorMap[role];
    return (
        <div className={"group " + className}>
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={"flex items-center justify-center -m-1 p-1 rounded-md"
                    + ` ${color.border} ${color.bg} ${color.focus}`
                    + " focus:outline-none focus:ring-2 focus:ring-offset-1"
                }
            >
                <Icon className={`size-6 ${color.text} ${color.hover}`} />
            </button>
        </div>
    );
}

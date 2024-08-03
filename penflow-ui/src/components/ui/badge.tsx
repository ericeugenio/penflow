
const badgeColorMap: {[color: string]: string[]} = {
    slate: ["text-slate-600", "bg-slate-100", "ring-slate-500/10"],
    green: ["text-green-600", "bg-green-100", "ring-green-500/10"],
    red: ["text-red-600", "bg-red-100", "ring-red-500/10"],
};

type BadgeProps = {
    text: string,
    className?: string,
    color: "slate"
        | "green"
        | "red",
};

export function Badge({ color, text, className }: BadgeProps) {
    const [textColor, bgColor, borderColor] = badgeColorMap[color];
    return (
        <span className={`inline-flex items-center text-xs font-medium whitespace-nowrap ${textColor} ring-1 ring-inset ${borderColor} rounded-md px-2 py-1 ${bgColor} ${className}`}>
            {text}
        </span>
    );
}
import type { FlowTask } from "@/types/FlowTask";

type FlowTaskSummaryProps = {
    summaryTemplate: string,
    context: FlowTask
};

function renderPlaceholder(placeholder: string, context: FlowTask): string | undefined {
    let indices = placeholder.substring(1).split(".");
    let value: any = indices.reduce((prev, index) => prev && prev[index], context);

    if (typeof value === "string" && value === "") {
        value = undefined;
    } else if (Array.isArray(value)) {
        if (value.length === 0) {
            value = undefined;
        } else {
            value = "list";
        }
    }

    return value;
}

export default function FlowTaskSummary({ summaryTemplate, context }: FlowTaskSummaryProps) {
    const words = summaryTemplate.split(" ");

    return (
        <p className="text-xs text-slate-500 line-clamp-2 whitespace-normal leading-relaxed">
            {words.map((word, index) => {
                if (word.startsWith("$")) {
                    return (
                        <span key={index} className="px-2 py-1 rounded-xl text-slate-700 bg-slate-100 truncate">
                            {renderPlaceholder(word, context)}
                        </span>
                    );
                } else {
                    return " " + word + " ";
                }
            })}
        </p>
    );
}
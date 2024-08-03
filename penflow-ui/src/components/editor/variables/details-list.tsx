import React from "react";

import VariableListItem from "@/components/editor/variables/details-list-item";
import type { FlowVariable } from "@/types/FlowVariable";

type VariableListProps = {
    variables: { [p: string]: FlowVariable }
};

export default function VariableList({ variables }: VariableListProps) {
    return (
        <ul className="divide-y divide-slate-200">
            {Object.entries(variables).map(([name, variable]) => (
                <li key={name}>
                    <VariableListItem variableName={name} variable={variable} />
                </li>
            ))}
        </ul>
    );
}
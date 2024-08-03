import type { Property } from "@/types/Property";

export type FlowVariableScope = "in" | "out" | "local";

export type FlowVariable = Property & {
    displayName: string,
    scope: FlowVariableScope,
    declaredBy?: any
};

export type NamedFlowVariable = FlowVariable & {
    name: string
};

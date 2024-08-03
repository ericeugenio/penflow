export type PropertyType = "any" | "string" | "number" | "boolean" | "array" | "object" | "enum";

export type Property = {
    type: PropertyType,
    description?: string,

    options?: string[],
    items?: Property,
    properties?: {[key: string]: Property},
};

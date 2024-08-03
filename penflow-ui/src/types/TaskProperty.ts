import type { Property } from "@/types/Property";

export type TaskProperty = Property & {
    displayName: string,
    order: number,
    default?: any
}
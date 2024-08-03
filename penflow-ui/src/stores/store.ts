import { createStore } from "zustand";

import { type FlowSlice, createFlowSlice, initFlowSlice} from "@/stores/store-flow";

export type PenflowStore = FlowSlice;

export const createPenflowStore = () => createStore<PenflowStore>()((...a) => ({
    ...createFlowSlice(initFlowSlice())(...a),
}));



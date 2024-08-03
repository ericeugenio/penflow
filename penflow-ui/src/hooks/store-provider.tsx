"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";

import { type PenflowStore, createPenflowStore } from "@/stores/store";

export const PenflowStoreContext = createContext<StoreApi<PenflowStore> | null>(null);

export const usePenflowStore = <T,>(
    selector: (store: PenflowStore) => T,
): T => {
    const penflowStoreContext = useContext(PenflowStoreContext);

    if (!penflowStoreContext) {
        throw new Error("useFlowStore must be use within StoreProvider");
    }

    return useStore(penflowStoreContext, selector);
}

type PenflowStoreProviderProps = {
    children: ReactNode
}

export default function StoreProvider({ children }: PenflowStoreProviderProps) {
    const storeRef = useRef<StoreApi<PenflowStore>>();

    if (!storeRef.current) {
        storeRef.current = createPenflowStore();
    }

    return(
        <PenflowStoreContext.Provider value={storeRef.current}>
            {children}
        </PenflowStoreContext.Provider>
    );
}
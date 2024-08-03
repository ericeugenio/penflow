import type React from "react";

import SideNav from "@/components/ui/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-screen h-screen bg-slate-50">
            <SideNav />
            <main className="flex flex-col h-[calc(100%-64px)] py-9 lg:h-full lg:pl-72">
                <div className="flex flex-col grow overflow-y-auto px-4 sm:px-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

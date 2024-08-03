"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Squares2X2Icon, ServerStackIcon, FolderIcon, Bars3Icon } from "@heroicons/react/24/outline";

import { classNames } from "@/lib/utils";
import { Overlay, OverlayPanel } from "@/components/ui/overlay";

const navigation = [
    //{ name: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
    //{ name: "Projects", href: "/projects", icon: FolderIcon },
    { name: "Flows", href: "/flows", icon: ServerStackIcon },
];

type SideNavProps = {
}

export default function SideNav({}: SideNavProps) {
    const [isNavOpen, setIsNavOpen] = useState(false)
    const pathname = usePathname();

    const getPageName = useCallback(() => {
        if (pathname.startsWith("/flows/")) {
            return "Flow Editor"
        } else {
            return navigation.find(item => item.href === pathname)?.name;
        }
    }, [pathname]);

    return (
        <>
            {/* Mobile */}
            <div className="sticky top-0 flex items-center gap-x-6 h-16 shadow-sm p-4 bg-white sm:px-6 lg:hidden">
                <button
                    type="button"
                    className="h-6 w-6 text-slate-600 hover:text-slate-900"
                    onClick={() => setIsNavOpen(true)}
                >
                    <Bars3Icon />
                </button>
                <div className="flex-1 font-semibold leading-6">{getPageName()}</div>
            </div>
            <Overlay isVisible={isNavOpen} onClose={setIsNavOpen}>
                <div className="fixed inset-0 flex">
                    <OverlayPanel
                        animation={{
                            enter: "transform transition ease-in-out duration-500 sm:duration-700",
                            enterFrom: "-translate-x-full",
                            enterTo: "translate-x-0",
                            leave: "transform transition ease-in-out duration-500 sm:duration-700",
                            leaveFrom: "translate-x-0",
                            leaveTo: "-translate-x-full",
                        }}
                        className="relative w-full max-w-sm flex flex-1"
                    >
                        <SideNavBody pathname={pathname} onNavigation ={setIsNavOpen}/>
                    </OverlayPanel>
                </div>
            </Overlay>
            {/* Desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:w-72 lg:flex lg:flex-col">
                <SideNavBody pathname={pathname} />
            </div>
        </>
    );
}

type SideNavBodyProps = {
    pathname: string,
    onNavigation?: (isOpen: boolean) => void,
};

function SideNavBody({ pathname, onNavigation = () => {} }: SideNavBodyProps) {
    return (
        <div className="flex flex-col grow gap-y-5 overflow-y-auto border-r border-slate-200 p-6 bg-white">
            <div className="flex items-center flex-shrink-0 h-16">
                <h1 className="text-2xl font-semibold text-slate-900">Penflow</h1>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul className="space-y-1">
                    {navigation.map((item) => (
                    <li key={item.name}>
                        <Link
                            href={item.href}
                            onClick={() => onNavigation!(false)}
                            className={classNames(
                                pathname.startsWith(item.href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                "group flex items-center gap-x-3 p-2 rounded-md text-sm font-semibold leading-6 "
                            )}
                        >
                            <item.icon
                                className={classNames(
                                    pathname.startsWith(item.href) ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900",
                                    "mr-3 flex-shrink-0 h-6 w-6"
                                )}
                            />
                            {item.name}
                        </Link>
                    </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

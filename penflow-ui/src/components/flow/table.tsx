import Link from "next/link";

import type { FlowAPI } from "@/types/Flow";

const headers = ["Name"]

type FlowTableProps = {
    flows: FlowAPI[]
};

export default function FlowTable({ flows }: FlowTableProps) {
    return (
        <div className="border border-slate-200 rounded-lg bg-white ">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 bg-slate-100">
                    <tr>
                    {headers.map((header) => (
                        <th
                            key={header}
                            scope="col"
                            className="text-left text-sm font-semibold text-slate-900 tracking-wider px-6 py-3.5 "
                        >
                            {header}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                {flows.map((flow) => (
                    <tr key={flow.id} className="hover:bg-slate-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 cursor-pointer ">
                            <Link href={"/flows/" + flow.id}>
                                {flow.name}
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

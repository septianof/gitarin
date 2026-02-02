"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Printer, Eye } from "lucide-react";

interface ShipmentItem {
    id: string;
    orderId: string;
    date: Date;
    resi: string;
    courier: string;
    service: string;
    recipientName: string;
    status: string;
    biteshipOrderId: string | null;
}

export function ShipmentHistoryTable({ data }: { data: ShipmentItem[] }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "DIKIRIM":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Dalam Perjalanan
                    </span>
                );
            case "SELESAI":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Selesai
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">ID Pesanan</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">No. Resi (Biteship)</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">Ekspedisi</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">Nama Penerima</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 font-bold tracking-wider text-center whitespace-nowrap">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-bold text-zinc-900 whitespace-nowrap">
                                {item.orderId}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-zinc-900">
                                    {item.resi}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                                {item.courier} {item.service}
                            </td>
                            <td className="px-4 py-4 text-zinc-900 font-medium whitespace-nowrap">
                                {item.recipientName}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                {getStatusBadge(item.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    <Link
                                        href={`/dashboard/riwayat-pengiriman/${item.id}/print`}
                                        className="p-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Cetak Ulang Resi"
                                    >
                                        <Printer size={16} />
                                    </Link>
                                    <Link
                                        href={`/dashboard/riwayat-pengiriman/${item.id}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                                    >
                                        <Eye size={14} />
                                        Detail
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

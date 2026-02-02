"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Printer, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { processShippingLabel } from "@/app/actions/shipping";

interface QueueItem {
    id: string;
    orderId: string;
    date: Date;
    productName: string;
    courier: string;
    service: string;
    weight: number;
    status: string;
    recipient?: string;
}

export default function QueueTable({ data }: { data: QueueItem[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handlePrintResi = async (orderId: string) => {
        setProcessingId(orderId);
        try {
            const result = await processShippingLabel(orderId);

            if (result.success) {
                toast.success("Resi berhasil dicetak!", {
                    description: `Resi: ${result.trackingId}`
                });
            } else {
                toast.error("Gagal mencetak resi", {
                    description: result.error
                });
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setProcessingId(null);
        }
    };

    if (data.length === 0) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <Printer size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Tidak ada antrean</h3>
                    <p className="text-gray-500 text-sm">Semua pesanan sudah diproses.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-white uppercase bg-black border-b border-black">
                    <tr>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">ID Pesanan</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">Tanggal</th>
                        <th className="px-4 py-3 font-bold tracking-wider">Produk</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">Ekspedisi (Biteship)</th>
                        <th className="px-4 py-3 font-bold tracking-wider whitespace-nowrap">Berat</th>
                        <th className="px-4 py-3 font-bold tracking-wider text-left whitespace-nowrap">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-zinc-900 whitespace-nowrap">
                                {item.orderId}
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                                {format(new Date(item.date), "dd MMM yyyy", { locale: idLocale })}
                            </td>
                            <td className="px-4 py-3">
                                <div className="max-w-[250px] truncate font-medium text-zinc-900 text-xs" title={item.productName}>
                                    {item.productName}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                                {item.courier} {item.service !== "-" ? item.service : ""}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono whitespace-nowrap text-xs bg-gray-50/50">
                                {item.weight}g
                            </td>
                            <td className="px-4 py-3 text-left whitespace-nowrap">
                                <div className="flex items-center justify-start gap-2">
                                    <button
                                        className="p-2 text-gray-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-gray-100"
                                        title="Lihat Detail"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handlePrintResi(item.id)}
                                        disabled={!!processingId}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                    >
                                        {processingId === item.id ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                Proses
                                            </>
                                        ) : (
                                            <>
                                                <Printer size={12} />
                                                Cetak Resi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Mockup */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium tracking-wide"></p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-zinc-900 disabled:opacity-50" disabled>
                        &lt; Sebelumnya
                    </button>
                    <button className="size-7 bg-black text-white text-xs font-bold rounded flex items-center justify-center">
                        1
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-zinc-900">
                        Selanjutnya &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}

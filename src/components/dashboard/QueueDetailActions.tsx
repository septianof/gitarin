"use client";

import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { processShippingLabel } from "@/app/actions/shipping";

export function QueueDetailActions({ orderId, status, resi }: { orderId: string, status: string, resi?: string | null }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePrint = async () => {
        if (status === "DIKIRIM" && resi) {
            toast.info("Resi sudah dicetak", { description: `Nomor Resi: ${resi}` });
            return; // Or open PDF logic if we had the URL
        }

        setIsProcessing(true);
        try {
            const result = await processShippingLabel(orderId);
            if (result.success) {
                toast.success("Resi Berhasil Dicetak!", {
                    description: `Resi: ${result.trackingId}`
                });
            } else {
                toast.error("Gagal Mencetak Resi", {
                    description: result.error
                });
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <button
            onClick={handlePrint}
            disabled={isProcessing || (status !== "DIKEMAS" && !resi)} // Enable if Dikemas OR if we want to reprint (though reprint logic not full yet)
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10"
        >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Memproses...
                </>
            ) : (
                <>
                    <Printer size={20} />
                    {status === "DIKIRIM" ? "Cetak Ulang Resi" : "Cetak Label Pengiriman"}
                </>
            )}
        </button>
    );
}

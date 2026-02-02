"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { processShippingLabel } from "@/app/actions/shipping";

export function QueueDetailActions({ orderId, status, resi }: { orderId: string, status: string, resi?: string | null }) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGenerateResi = async () => {
        setIsProcessing(true);
        try {
            const result = await processShippingLabel(orderId);
            if (result.success) {
                toast.success("Resi Berhasil Dibuat!", {
                    description: `Resi: ${result.trackingId}`
                });
                // Redirect to print label page
                router.push(`/dashboard/antrean/${orderId}/print`);
            } else {
                toast.error("Gagal Membuat Resi", {
                    description: result.error
                });
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintLabel = () => {
        router.push(`/dashboard/antrean/${orderId}/print`);
    };

    // If resi already exists, show print button
    if (resi) {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={handlePrintLabel}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                >
                    <FileText size={20} />
                    Cetak Ulang Resi
                </button>
            </div>
        );
    }

    // If no resi yet, show generate button
    return (
        <button
            onClick={handleGenerateResi}
            disabled={isProcessing || status !== "DIKEMAS"}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10"
        >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Memproses...
                </>
            ) : (
                <>
                    <Printer size={20} />
                    Request Pickup & Cetak Resi
                </>
            )}
        </button>
    );
}

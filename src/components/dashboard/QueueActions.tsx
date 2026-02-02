"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Printer, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { processShippingLabel } from "@/app/actions/shipping";

interface QueueActionsProps {
    orderIds: string[];
    totalOrders: number;
}

export function QueueActions({ orderIds, totalOrders }: QueueActionsProps) {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPrintingAll, setIsPrintingAll] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success("Data berhasil diperbarui");
        }, 500);
    };

    const handlePrintAllConfirm = () => {
        setShowConfirmDialog(true);
    };

    const handlePrintAllExecute = async () => {
        setShowConfirmDialog(false);
        setIsPrintingAll(true);

        let successCount = 0;
        let failCount = 0;

        for (const orderId of orderIds) {
            try {
                const result = await processShippingLabel(orderId);
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        setIsPrintingAll(false);

        if (successCount > 0) {
            toast.success(`${successCount} resi berhasil dicetak!`);
        }
        if (failCount > 0) {
            toast.error(`${failCount} resi gagal dicetak`);
        }

        router.refresh();
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    {isRefreshing ? "Memuat..." : "Refresh Data"}
                </button>
                <button 
                    onClick={handlePrintAllConfirm}
                    disabled={isPrintingAll || totalOrders === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[#111417] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPrintingAll ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <Printer size={16} />
                            Cetak Semua Resi
                        </>
                    )}
                </button>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">Konfirmasi Cetak Semua Resi</h3>
                                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-amber-800">
                                Anda akan mencetak <strong>{totalOrders} resi</strong> sekaligus. 
                                Semua pesanan akan otomatis berubah status menjadi <strong>DIKIRIM</strong> dan 
                                request pickup akan dikirim ke kurir masing-masing.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePrintAllExecute}
                                className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors"
                            >
                                Ya, Cetak Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export function ShipmentHistoryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get("status") || "ALL";

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === "ALL") {
            params.delete("status");
        } else {
            params.set("status", status);
        }
        params.delete("page"); // Reset to page 1
        router.push(`/dashboard/riwayat-pengiriman?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                <button
                    onClick={() => handleStatusChange("ALL")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        currentStatus === "ALL"
                            ? "bg-zinc-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <Filter size={14} />
                    Semua
                </button>
                <button
                    onClick={() => handleStatusChange("DIKIRIM")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        currentStatus === "DIKIRIM"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Dikirim
                </button>
                <button
                    onClick={() => handleStatusChange("SELESAI")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        currentStatus === "SELESAI"
                            ? "bg-emerald-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Selesai
                </button>
            </div>
        </div>
    );
}

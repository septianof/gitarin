"use client";

import { useState } from "react";
import { OrderCard } from "./OrderCard";
import { useRouter, useSearchParams } from "next/navigation";
import { SerializedOrder } from "@/types";

interface OrderListProps {
    initialOrders: SerializedOrder[];
}

const TABS = [
    { label: "Semua", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Dikemas", value: "DIKEMAS" },
    { label: "Dikirim", value: "DIKIRIM" },
    { label: "Selesai", value: "SELESAI" },
    { label: "Dibatalkan", value: "DIBATALKAN" },
];

export function OrderList({ initialOrders }: OrderListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get("status") || "ALL";
    const orders = initialOrders;

    const handleTabChange = (status: string) => {
        // Optimistic UI or just navigation
        const params = new URLSearchParams(searchParams.toString());
        if (status === "ALL") {
            params.delete("status");
        } else {
            params.set("status", status);
        }
        router.push(`/profil/pesanan?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h1 className="text-zinc-900 tracking-tight text-[28px] font-bold leading-tight">
                    Pesanan Saya
                </h1>

                {/* Desktop Tabs */}
                <div className="hidden xl:flex gap-2">
                    {TABS.map((tab) => {
                        const isActive = currentStatus === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => handleTabChange(tab.value)}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${isActive
                                    ? "bg-zinc-900 text-white"
                                    : "bg-gray-100 text-zinc-900 hover:bg-gray-200"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Scrollable Tabs */}
            <div className="xl:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {TABS.map((tab) => {
                    const isActive = currentStatus === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${isActive
                                ? "bg-zinc-900 text-white"
                                : "bg-gray-100 text-zinc-900 hover:bg-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Order List */}
            <div className="flex flex-col gap-4">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                        <p>Tidak ada pesanan ditemukan.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))
                )}
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils"; // Assuming you have utils, if not will use Intl
import { OrderStatus } from "@prisma/client";
import { SerializedOrder } from "@/types";

interface OrderCardProps {
    order: SerializedOrder;
}

export function OrderCard({ order }: OrderCardProps) {
    const firstItem = order.items[0];
    const otherItemsCount = order.items.length - 1;
    const date = new Date(order.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const getStatusStyle = (status: OrderStatus) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "DIKEMAS":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "DIKIRIM":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "SELESAI":
                return "bg-green-100 text-green-800 border-green-200";
            case "DIBATALKAN":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const CardContent = (
        <div className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-gray-200 transition-all p-4 rounded-xl shadow-sm ${order.status === 'PENDING' ? 'hover:border-zinc-900 cursor-pointer' : ''}`}>
            <div className="flex items-center gap-4 flex-1">
                {/* Product Image */}
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 sm:size-20 shrink-0 bg-gray-50 border border-gray-100"
                    style={{ backgroundImage: `url(${firstItem?.product.image || '/placeholder.png'})` }}
                />

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-900 text-sm font-bold">
                            #{order.id.slice(0, 8).toUpperCase()}...
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        <span className="text-gray-500 text-xs">{date}</span>
                    </div>

                    <p className="text-zinc-900 text-base font-semibold leading-normal line-clamp-1">
                        {firstItem?.product.name}
                        {otherItemsCount > 0 && ` + ${otherItemsCount} barang lainnya`}
                    </p>

                    <p className="text-gray-500 text-sm font-normal">
                        Total: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(order.totalAmount))}
                    </p>
                </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex justify-between sm:justify-end items-center mt-2 sm:mt-0 gap-4">
                <div className={`flex items-center justify-center rounded-full border px-3 py-1 ${getStatusStyle(order.status)}`}>
                    <span className="text-xs font-bold uppercase tracking-wider">{order.status}</span>
                </div>
            </div>
        </div>
    );

    if (order.status === "PENDING") {
        return (
            <Link href={`/pembayaran/${order.id}`} className="block">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}

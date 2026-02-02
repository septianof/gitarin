"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        price: number;
    };
}

interface Order {
    id: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    items: OrderItem[];
    shipment: {
        cost: number;
    } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface SalesReportTableProps {
    orders: Order[];
    pagination: Pagination | null;
}

export function SalesReportTable({ orders, pagination }: SalesReportTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(date));
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/dashboard/laporan?${params.toString()}`);
    };

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada data</h3>
                <p className="text-sm text-gray-500 text-center">
                    Pesanan yang sudah selesai akan muncul di sini.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID Pesanan
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Tanggal
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Pelanggan
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Produk
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Subtotal
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Ongkir
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => {
                            const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
                            const shippingCost = order.shipment ? Number(order.shipment.cost) : 0;
                            const total = subtotal + shippingCost;
                            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                            
                            return (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-gray-900">
                                            {order.id.substring(0, 8)}...
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900 truncate max-w-[150px]">
                                                {order.user.name || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                {order.user.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[200px]">
                                            <p className="text-sm text-gray-900 truncate">
                                                {order.items.length > 0 
                                                    ? order.items[0].product.name 
                                                    : "-"}
                                            </p>
                                            {order.items.length > 1 && (
                                                <p className="text-xs text-gray-500">
                                                    +{order.items.length - 1} produk lainnya
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {itemCount} item
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600">
                                            {formatCurrency(shippingCost)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(total)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pesanan
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            Halaman {pagination.page} dari {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

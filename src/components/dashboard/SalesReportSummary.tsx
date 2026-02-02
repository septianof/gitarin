"use client";

import { DollarSign, Package, Truck, TrendingUp } from "lucide-react";

interface TopProduct {
    productId: string;
    productName: string;
    totalSold: number;
}

interface SalesReportSummaryProps {
    summary: {
        totalOrders: number;
        totalRevenue: number;
        totalShipping: number;
    };
    topProducts: TopProduct[];
}

export function SalesReportSummary({ summary, topProducts }: SalesReportSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const netRevenue = summary.totalRevenue - summary.totalShipping;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-100">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pesanan</p>
                        <p className="text-xl font-bold text-gray-900">{summary.totalOrders}</p>
                    </div>
                </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Penjualan</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Shipping Cost */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-orange-100">
                        <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Ongkir</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalShipping)}</p>
                    </div>
                </div>
            </div>

            {/* Net Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-100">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pendapatan Bersih</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(netRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            {topProducts.length > 0 && (
                <div className="md:col-span-2 lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Produk Terlaris</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {topProducts.map((product, index) => (
                            <div 
                                key={product.productId} 
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-amber-500 text-white' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                    index === 2 ? 'bg-amber-700 text-white' :
                                    'bg-gray-200 text-gray-600'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {product.productName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {product.totalSold} terjual
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

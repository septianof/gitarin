"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportSalesReport } from "@/app/actions/report";

interface ExportButtonProps {
    startDate?: string;
    endDate?: string;
}

export function ExportButton({ startDate, endDate }: ExportButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleExport = () => {
        startTransition(async () => {
            const result = await exportSalesReport({ startDate, endDate });
            
            if (!result.success || !result.data) {
                alert(result.error || "Gagal mengekspor data");
                return;
            }

            // Generate CSV content
            const headers = [
                "ID Pesanan",
                "Tanggal",
                "Nama Pelanggan",
                "Email Pelanggan",
                "Produk",
                "Jumlah Item",
                "Subtotal",
                "Ongkir",
                "Total",
                "Alamat Pengiriman",
            ];

            const rows = result.data.map(order => [
                order.orderId,
                order.orderDate,
                order.customerName,
                order.customerEmail,
                `"${order.items}"`, // Wrap in quotes for CSV
                order.itemsCount,
                order.subtotal,
                order.shippingCost,
                order.total,
                `"${order.shippingAddress}"`,
            ]);

            // Add summary rows
            const emptyRow = new Array(headers.length).fill("");
            const summaryRows = [
                emptyRow,
                ["RINGKASAN", "", "", "", "", "", "", "", "", ""],
                ["Periode", `${result.summary.dateRange.start} - ${result.summary.dateRange.end}`, "", "", "", "", "", "", "", ""],
                ["Total Pesanan", result.summary.totalOrders, "", "", "", "", "", "", "", ""],
                ["Total Penjualan", "", "", "", "", "", "", "", result.summary.totalRevenue, ""],
                ["Total Ongkir", "", "", "", "", "", "", result.summary.totalShipping, "", ""],
                ["Pendapatan Bersih", "", "", "", "", "", "", "", result.summary.totalRevenue - result.summary.totalShipping, ""],
            ];

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(",")),
                ...summaryRows.map(row => row.join(",")),
            ].join("\n");

            // Create and download file
            const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            const filename = startDate && endDate 
                ? `laporan-penjualan-${startDate}-${endDate}.csv`
                : `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`;
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isPending}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengekspor...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </>
            )}
        </Button>
    );
}

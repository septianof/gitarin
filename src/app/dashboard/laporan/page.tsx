import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSalesReport } from "@/app/actions/report";
import { SalesReportTable } from "@/components/dashboard/SalesReportTable";
import { SalesReportFilters } from "@/components/dashboard/SalesReportFilters";
import { SalesReportSummary } from "@/components/dashboard/SalesReportSummary";
import { ExportButton } from "@/components/dashboard/ExportButton";

export const metadata = {
    title: "Laporan Penjualan - Gitarin Admin",
};

interface PageProps {
    searchParams: Promise<{
        page?: string;
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function LaporanPenjualanPage({ searchParams }: PageProps) {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const startDate = params.startDate || "";
    const endDate = params.endDate || "";

    const result = await getSalesReport({ 
        page, 
        limit: 10, 
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

    const orders = result.success ? result.orders : [];
    const pagination = result.success ? result.pagination : null;
    const summary = result.success ? result.summary : { totalOrders: 0, totalRevenue: 0, totalShipping: 0 };
    const topProducts = result.success ? result.topProducts : [];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Laporan Penjualan</h1>
                    <p className="text-sm text-gray-500 mt-1">Laporan pesanan yang sudah selesai.</p>
                </div>
                <ExportButton startDate={startDate} endDate={endDate} />
            </div>

            {/* Filters */}
            <SalesReportFilters />

            {/* Summary Cards */}
            <SalesReportSummary 
                summary={summary || { totalOrders: 0, totalRevenue: 0, totalShipping: 0 }} 
                topProducts={topProducts || []} 
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <SalesReportTable 
                    orders={orders || []} 
                    pagination={pagination}
                />
            </div>
        </div>
    );
}

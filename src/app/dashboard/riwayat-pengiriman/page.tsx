import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentHistoryTable } from "@/components/dashboard/ShipmentHistoryTable";
import { ShipmentHistoryFilters } from "@/components/dashboard/ShipmentHistoryFilters";
import { Truck } from "lucide-react";

export const metadata = {
    title: "Riwayat Pengiriman - Gitarin Gudang",
};

interface PageProps {
    searchParams: Promise<{
        search?: string;
        status?: string;
        page?: string;
    }>;
}

export default async function RiwayatPengirimanPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const search = params.search || "";
    const statusFilter = params.status || "ALL";
    const page = Number(params.page) || 1;
    const limit = 10;

    // Build where clause
    const whereClause: any = {
        status: {
            in: ["DIKIRIM", "SELESAI"]
        }
    };

    // Filter by status
    if (statusFilter && statusFilter !== "ALL") {
        whereClause.status = statusFilter;
    }

    // Search
    if (search) {
        whereClause.OR = [
            { id: { contains: search, mode: "insensitive" } },
            { shipment: { resi: { contains: search, mode: "insensitive" } } },
            { shipment: { recipientName: { contains: search, mode: "insensitive" } } },
        ];
    }

    // Fetch orders
    const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                shipment: true,
                user: true
            }
        }),
        prisma.order.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Format for Table
    const formattedOrders = orders.map(order => ({
        id: order.id,
        orderId: `#GG-${order.id.slice(-4).toUpperCase()}`,
        date: order.createdAt,
        resi: order.shipment?.resi || "-",
        courier: order.shipment?.courier.toUpperCase() || "-",
        service: order.shipment?.service || "-",
        recipientName: order.shipment?.recipientName || "-",
        status: order.status,
        biteshipOrderId: order.shipment?.biteshipOrderId || null
    }));

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Riwayat Pengiriman</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Monitoring paket terintegrasi dengan <span className="font-semibold text-zinc-700">Biteship</span>
                    </p>
                </div>
                <ShipmentHistoryFilters />
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <form method="GET" className="flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Cari nomor resi, ID pesanan, atau nama penerima..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {formattedOrders.length > 0 ? (
                    <ShipmentHistoryTable data={formattedOrders} />
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <Truck size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Tidak ada data pengiriman</h3>
                            <p className="text-gray-500 text-sm">
                                {search ? "Coba ubah kata kunci pencarian." : "Belum ada pesanan yang dikirim."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)} dari {totalCount} pengiriman
                    </p>
                    <div className="flex items-center gap-2">
                        {page > 1 && (
                            <a
                                href={`/dashboard/riwayat-pengiriman?page=${page - 1}${search ? `&search=${search}` : ""}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                                className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-zinc-900"
                            >
                                &lt; Sebelumnya
                            </a>
                        )}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <a
                                    key={pageNum}
                                    href={`/dashboard/riwayat-pengiriman?page=${pageNum}${search ? `&search=${search}` : ""}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                                    className={`size-8 flex items-center justify-center text-sm font-medium rounded ${
                                        page === pageNum
                                            ? "bg-zinc-900 text-white"
                                            : "text-gray-500 hover:bg-gray-100"
                                    }`}
                                >
                                    {pageNum}
                                </a>
                            );
                        })}
                        {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
                        {totalPages > 5 && (
                            <a
                                href={`/dashboard/riwayat-pengiriman?page=${totalPages}${search ? `&search=${search}` : ""}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                                className={`size-8 flex items-center justify-center text-sm font-medium rounded ${
                                    page === totalPages
                                        ? "bg-zinc-900 text-white"
                                        : "text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                {totalPages}
                            </a>
                        )}
                        {page < totalPages && (
                            <a
                                href={`/dashboard/riwayat-pengiriman?page=${page + 1}${search ? `&search=${search}` : ""}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                                className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-zinc-900"
                            >
                                Selanjutnya &gt;
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

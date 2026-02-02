import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { RecentQueue } from "@/components/dashboard/RecentQueue";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { Package, Truck, Calendar, ArrowRight, Wallet, ShoppingBag, UserPlus, Bell } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Dashboard - Gitarin Panel",
};

export default async function DashboardPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (role === "GUDANG") {
        return <GudangDashboard />;
    }

    return <AdminDashboard />;
}

// ==================== GUDANG VIEW ====================
async function GudangDashboard() {
    // Data Fetching (Gudang)
    const pendingPackingCount = await prisma.order.count({ where: { status: "DIKEMAS" } });
    const todayOrdersCount = await prisma.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    });

    // Recent specific orders
    const recentOrders = await prisma.order.findMany({
        where: { status: { in: ["DIKEMAS", "DIKIRIM"] } },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { items: { take: 1, include: { product: true } }, shipment: true }
    });

    const formattedQueue = recentOrders.map(order => ({
        id: order.id,
        date: order.createdAt,
        productName: order.items[0]?.product.name || "Unknown Product",
        courier: order.shipment?.courier.toUpperCase() || "PENDING",
        status: order.status
    }));

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-zinc-900">Dashboard Utama</h1>
                    <p className="text-gray-500 text-sm">Ringkasan aktivitas harian dan metrik operasional gudang.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100 w-fit">
                    Status: Online
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard icon={Package} label="Pesanan Dikemas" value={pendingPackingCount.toString()} subtext="+2 sejak 1 jam lalu" trend="up" subtextClassName="text-emerald-600" />
                <StatsCard icon={Truck} label="Siap Kirim" value={pendingPackingCount.toString()} subtext="JNE, POS menunggu pickup" subtextClassName="text-gray-500" />
                <StatsCard icon={Calendar} label="Total Hari Ini" value={todayOrdersCount.toString()} subtext="98% terpenuhi" subtextClassName="text-gray-500" />
            </div>

            <DashboardCharts />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#111417]">Antrian Pengiriman Terbaru</h3>
                    <Link href="/dashboard/antrean" className="text-sm font-medium text-gray-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                        Lihat Semua di Riwayat Pengiriman <ArrowRight size={16} />
                    </Link>
                </div>
                <RecentQueue items={formattedQueue} />
            </div>
        </div>
    );
}

// ==================== ADMIN VIEW ====================
async function AdminDashboard() {
    const session = await auth();

    // Data Fetching (Admin)
    const totalRevenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "SELESAI" } // Only count completed orders
    });

    const totalOrders = await prisma.order.count();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const newCustomers = await prisma.user.count({
        where: {
            role: "CUSTOMER",
            createdAt: { gte: startOfMonth }
        }
    });

    // Mock Top Products (Using real products db)
    const products = await prisma.product.findMany({
        take: 3,
        include: { category: true }
    });

    const topProducts = products.map((p, i) => ({
        id: p.id,
        name: p.name,
        category: p.category.name,
        image: p.image || "/placeholder-product.jpg",
        sold: 120 - (i * 35), // Mock Descending
        revenue: Number(p.price) * (120 - (i * 35)),
        status: p.stock > 0 ? "Stok Tersedia" : "Habis"
    }));

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-zinc-900">Dashboard Admin</h1>
                    <p className="text-gray-500 text-sm">Ringkasan performa toko hari ini</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={Wallet}
                    label="Total Pendapatan"
                    value={`Rp ${Number(totalRevenue._sum.totalAmount || 0).toLocaleString('id-ID')}`}
                    subtext="+12% dari bulan lalu"
                    trend="up"
                    subtextClassName="text-emerald-600"
                />
                <StatsCard
                    icon={ShoppingBag}
                    label="Total Pesanan"
                    value={totalOrders.toString()}
                    subtext="+5% dari bulan lalu"
                    trend="up"
                    subtextClassName="text-emerald-600"
                />
                <StatsCard
                    icon={UserPlus}
                    label="Pelanggan Baru"
                    value={newCustomers.toString()}
                    subtext="+8% dari bulan lalu"
                    trend="up"
                    subtextClassName="text-emerald-600"
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart />

            {/* Top Products */}
            <TopProducts products={topProducts} />
        </div>
    );
}

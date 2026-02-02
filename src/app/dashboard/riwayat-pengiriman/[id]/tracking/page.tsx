import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, MapPin, Package, Truck, User, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getOrderDetail } from "@/lib/biteship";

export const metadata = {
    title: "Lacak Pengiriman - Gitarin",
};

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            shipment: true,
            user: true
        }
    });

    if (!order || !order.shipment) {
        notFound();
    }

    // Fetch tracking from Biteship API using biteshipOrderId
    let trackingData = null;
    if (order.shipment.biteshipOrderId) {
        trackingData = await getOrderDetail(order.shipment.biteshipOrderId);
    }

    const orderIdFormatted = `#GG-${order.id.slice(-4).toUpperCase()}`;

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
            case "allocated":
                return <Clock size={20} className="text-blue-500" />;
            case "picking_up":
            case "picked":
                return <Package size={20} className="text-amber-500" />;
            case "dropping_off":
            case "delivered":
                return <CheckCircle2 size={20} className="text-emerald-500" />;
            case "rejected":
            case "cancelled":
            case "returned":
                return <AlertCircle size={20} className="text-red-500" />;
            default:
                return <Circle size={20} className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        if (["delivered"].includes(statusLower)) {
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
        if (["picking_up", "picked", "dropping_off"].includes(statusLower)) {
            return "bg-blue-50 text-blue-700 border-blue-200";
        }
        if (["confirmed", "allocated"].includes(statusLower)) {
            return "bg-amber-50 text-amber-700 border-amber-200";
        }
        if (["rejected", "cancelled", "returned"].includes(statusLower)) {
            return "bg-red-50 text-red-700 border-red-200";
        }
        return "bg-gray-50 text-gray-700 border-gray-200";
    };

    const formatStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            "confirmed": "Pesanan Dikonfirmasi",
            "allocated": "Kurir Dialokasikan",
            "picking_up": "Kurir Dalam Perjalanan Pickup",
            "picked": "Paket Sudah Diambil",
            "dropping_off": "Paket Dalam Perjalanan",
            "delivered": "Paket Terkirim",
            "rejected": "Ditolak",
            "cancelled": "Dibatalkan",
            "returned": "Dikembalikan",
            "on_hold": "Ditahan",
            "courierNotFound": "Kurir Tidak Ditemukan",
        };
        return statusMap[status.toLowerCase()] || status;
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/riwayat-pengiriman/${order.id}`}
                        className="p-2 -ml-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Lacak Pengiriman</h1>
                        <p className="text-sm text-gray-500">{orderIdFormatted}</p>
                    </div>
                </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck size={18} className="text-zinc-900" />
                        <h3 className="font-bold text-zinc-900">Informasi Pengiriman</h3>
                    </div>
                    {trackingData && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(trackingData.status)}`}>
                            {formatStatus(trackingData.status)}
                        </span>
                    )}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">No. Resi</h4>
                        <p className="font-mono text-lg font-bold text-zinc-900 bg-gray-100 px-3 py-2 rounded-lg w-fit">
                            {order.shipment.resi || "Belum tersedia"}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kurir</h4>
                        <p className="font-medium text-zinc-900">
                            {order.shipment.courier.toUpperCase()} - {order.shipment.service}
                        </p>
                    </div>
                </div>
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pengirim</h4>
                        <p className="font-medium text-zinc-900">Gitarin Store</p>
                        <p className="text-sm text-gray-500">Bandung, Jawa Barat</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Penerima</h4>
                        <p className="font-medium text-zinc-900">{order.shipment.recipientName}</p>
                        <p className="text-sm text-gray-500">{order.shipment.addressCity}</p>
                    </div>
                </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <MapPin size={18} className="text-zinc-900" />
                    <h3 className="font-bold text-zinc-900">Riwayat Tracking</h3>
                </div>
                <div className="p-6">
                    {trackingData && trackingData.history && trackingData.history.length > 0 ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />
                            
                            <div className="space-y-6">
                                {trackingData.history.map((item, index) => (
                                    <div key={index} className="flex gap-4 relative">
                                        <div className="z-10 bg-white">
                                            {getStatusIcon(item.status)}
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-zinc-900">
                                                        {formatStatus(item.status)}
                                                    </p>
                                                    {item.note && (
                                                        <p className="text-sm text-gray-600 mt-0.5">{item.note}</p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 whitespace-nowrap">
                                                    {format(new Date(item.updated_at), "dd MMM, HH:mm", { locale: idLocale })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="size-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-amber-500" />
                            </div>
                            <h4 className="font-bold text-zinc-900 mb-2">Data Tracking Belum Tersedia</h4>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                {order.shipment.biteshipOrderId 
                                    ? "Informasi tracking sedang diproses oleh kurir. Silakan cek kembali nanti."
                                    : "Order ini belum memiliki Biteship Order ID. Hubungi admin untuk informasi lebih lanjut."}
                            </p>
                            
                            {/* Sandbox Mode Notice */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-left max-w-md mx-auto">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Mode Sandbox/Testing</p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Tracking real-time hanya tersedia di production mode. Dalam sandbox mode, data tracking adalah simulasi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="size-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <Package size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold mb-1">Butuh Bantuan?</h4>
                        <p className="text-sm text-zinc-300">
                            Jika ada pertanyaan tentang pengiriman, hubungi customer service kami atau langsung ke kurir {order.shipment.courier.toUpperCase()} dengan menyebutkan nomor resi di atas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

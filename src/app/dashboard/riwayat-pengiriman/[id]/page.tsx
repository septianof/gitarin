import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Package, Truck, User, Printer, MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { UploadedImage } from "@/components/ui/uploaded-image";

export const metadata = {
    title: "Detail Pengiriman - Gitarin Gudang",
};

export default async function RiwayatDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Only allow viewing DIKIRIM or SELESAI orders
    if (!["DIKIRIM", "SELESAI"].includes(order.status)) {
        notFound();
    }

    const orderIdFormatted = `#GG-${order.id.slice(-4).toUpperCase()}`;
    const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalWeight = order.items.reduce((sum, item) => sum + (item.product.weight * item.quantity), 0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "DIKIRIM":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "SELESAI":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/riwayat-pengiriman"
                        className="p-2 -ml-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-zinc-900">{orderIdFormatted}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                                {order.status === "DIKIRIM" ? "Dalam Perjalanan" : order.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Dipesan pada {format(order.createdAt, "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/riwayat-pengiriman/${order.id}/print`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                    >
                        <Printer size={18} />
                        Cetak Ulang Resi
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Info) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Shipping Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <MapPin size={18} className="text-zinc-900" />
                            <h3 className="font-bold text-zinc-900">Informasi Pengiriman</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Penerima</h4>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{order.shipment.recipientName}</p>
                                        <p className="text-sm text-gray-600">{order.shipment.recipientPhone}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Alamat Tujuan</h4>
                                <p className="text-sm text-zinc-900 leading-relaxed">
                                    {order.shipment.addressDetail}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {order.shipment.addressCity}, {order.shipment.postalCode}
                                </p>
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-gray-100 flex items-center gap-4">
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kurir (Biteship)</h4>
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-zinc-900" />
                                        <span className="font-medium text-zinc-900">
                                            {order.shipment.courier.toUpperCase()} - {order.shipment.service}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">No. Resi</h4>
                                    <p className="font-mono text-zinc-900 bg-gray-100 px-2 py-1 rounded w-fit text-sm">
                                        {order.shipment.resi || "Belum tersedia"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product List Card */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <Package size={18} className="text-zinc-900" />
                            <h3 className="font-bold text-zinc-900">Rincian Barang</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex gap-4">
                                    <div className="relative size-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                        <UploadedImage
                                            src={item.product.image || "/placeholder.jpg"}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="font-bold text-zinc-900">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">Berat: {item.product.weight}g</p>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <p className="font-bold text-zinc-900">{formatPrice(Number(item.price))}</p>
                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                        <h3 className="font-bold text-zinc-900 mb-4">Ringkasan Biaya</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Berat</span>
                                <span className="font-medium text-zinc-900">{totalWeight}g</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal Produk</span>
                                <span className="font-medium text-zinc-900">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ongkos Kirim</span>
                                <span className="font-medium text-zinc-900">{formatPrice(Number(order.shipment.cost))}</span>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex justify-between">
                                    <span className="font-bold text-zinc-900">Total Order</span>
                                    <span className="font-bold text-zinc-900 text-lg">{formatPrice(Number(order.totalAmount))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold text-sm">PEMBAYARAN LUNAS</span>
                            </div>
                            <p className="text-xs text-emerald-600 mt-1">Order ini sudah dibayar.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

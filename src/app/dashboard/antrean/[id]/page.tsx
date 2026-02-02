import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, MapPin, Package, Truck, User, CreditCard, Printer } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QueueDetailActions } from "@/components/dashboard/QueueDetailActions";

export const metadata = {
    title: "Detail Antrean - Gitarin Gudang",
};

export default async function AntreanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch detailed order
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

    if (!order) {
        notFound();
    }

    const orderIdFormatted = `#GG-${order.id.slice(-4).toUpperCase()}`;
    const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalWeight = order.items.reduce((sum, item) => sum + (item.product.weight * item.quantity), 0);

    // Format Currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/antrean"
                        className="p-2 -ml-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-zinc-900">{orderIdFormatted}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${order.status === "DIKEMAS" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                order.status === "DIKIRIM" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    "bg-gray-50 text-gray-700 border-gray-200"
                                }`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Dipesan pada {format(order.createdAt, "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                        </p>
                    </div>
                </div>

                <QueueDetailActions orderId={order.id} status={order.status} resi={order.shipment?.resi} />
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
                                        <p className="font-bold text-zinc-900">{order.shipment?.recipientName || "-"}</p>
                                        <p className="text-sm text-gray-600">{order.shipment?.recipientPhone || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Alamat Tujuan</h4>
                                <p className="text-sm text-zinc-900 leading-relaxed">
                                    {order.shipment?.addressDetail}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {order.shipment?.addressCity}, {order.shipment?.postalCode}
                                </p>
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-gray-100 flex items-center gap-4">
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kurir (Biteship)</h4>
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-zinc-900" />
                                        <span className="font-medium text-zinc-900">
                                            {order.shipment?.courier.toUpperCase()} - {order.shipment?.service}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">No. Resi</h4>
                                    <p className="font-mono text-zinc-900 bg-gray-100 px-2 py-1 rounded w-fit text-sm">
                                        {order.shipment?.resi || "Belum dicetak"}
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
                                        <Image
                                            src={item.product.image || "/placeholder.jpg"}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-zinc-900 mb-1">{item.product.name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">Berat: {item.product.weight}g</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                x{item.quantity}
                                            </span>
                                            <span className="font-medium text-zinc-900">
                                                {formatPrice(Number(item.price))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Summary) */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                        <h3 className="font-bold text-zinc-900 mb-4">Ringkasan Biaya</h3>

                        <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 text-sm">
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
                                <span className="font-medium text-zinc-900">{formatPrice(Number(order.shipment?.cost || 0))}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <span className="font-bold text-zinc-900">Total Order</span>
                            <span className="font-bold text-xl text-zinc-900">{formatPrice(Number(order.totalAmount))}</span>
                        </div>

                        <div className="mt-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3">
                            <CreditCard size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-emerald-700 uppercase">Pembayaran Lunas</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Order ini sudah dibayar otomatis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

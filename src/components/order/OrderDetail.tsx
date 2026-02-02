"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SerializedOrder } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Package, Truck, CheckCircle, MapPin, Phone, User as UserIcon, ChevronLeft, PackageCheck, Loader2 } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { markOrderAsCompleted } from "@/app/actions/order";

interface OrderDetailProps {
    order: SerializedOrder;
}

export function OrderDetail({ order }: OrderDetailProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const date = new Date(order.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const getStatusStep = (status: OrderStatus) => {
        switch (status) {
            case "DIKEMAS": return 1;
            case "DIKIRIM": return 2;
            case "SELESAI": return 3;
            default: return 0; // PENDING or DIBATALKAN
        }
    };

    const currentStep = getStatusStep(order.status);

    const handleMarkAsCompleted = async () => {
        setIsLoading(true);
        try {
            const result = await markOrderAsCompleted(order.id);
            if (result.success) {
                router.refresh();
                setShowConfirmDialog(false);
            } else {
                alert(result.error || "Gagal mengubah status pesanan");
            }
        } catch (error) {
            alert("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <PackageCheck size={32} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">Konfirmasi Pesanan Diterima</h3>
                                <p className="text-gray-500 text-sm">
                                    Apakah Anda yakin telah menerima pesanan ini? Status pesanan akan diubah menjadi <span className="font-bold">Selesai</span>.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-zinc-900 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleMarkAsCompleted}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        "Ya, Pesanan Diterima"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Link href="/profil/pesanan" className="flex items-center gap-2 text-gray-500 hover:text-zinc-900 transition-colors w-fit">
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Kembali</span>
            </Link>

            <div className="flex flex-col border-b border-[#f0f2f4] pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-[#111417] tracking-tight text-2xl sm:text-[28px] font-bold leading-tight">
                            Detail Pesanan #{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                        <span className="bg-[#111417] text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {order.status}
                        </span>
                    </div>
                    <div className="text-[#647587] text-sm">
                        Dipesan pada {date}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Status Tracker */}
                    <div className="bg-white border border-[#f0f2f4] rounded-xl p-6 shadow-sm">
                        <h3 className="text-[#111417] text-lg font-bold mb-6">Status Pesanan</h3>
                        <div className="relative flex flex-col sm:flex-row justify-between w-full">
                            {/* Line */}
                            <div className="absolute top-0 sm:top-1/2 left-4 sm:left-0 h-full sm:h-0.5 w-0.5 sm:w-full bg-[#f0f2f4] -z-10 transform sm:-translate-y-1/2 sm:translate-x-0 translate-x-1/2"></div>

                            {/* Step 1: Dikemas */}
                            <div className={`flex sm:flex-col items-center gap-4 sm:gap-2 mb-6 sm:mb-0 ${currentStep >= 1 ? '' : 'opacity-50'}`}>
                                <div className={`size-8 rounded-full ${currentStep >= 1 ? 'bg-[#111417] text-white' : 'bg-[#f0f2f4] text-[#647587]'} flex items-center justify-center ring-4 ring-white`}>
                                    <Package size={16} />
                                </div>
                                <div className="sm:text-center pt-1 sm:pt-2">
                                    <p className={`${currentStep >= 1 ? 'text-[#111417] font-bold' : 'text-[#647587] font-medium'} text-sm`}>Dikemas</p>
                                    {currentStep >= 1 && <p className="text-[#647587] text-xs">Sedang diproses</p>}
                                </div>
                            </div>

                            {/* Step 2: Dikirim */}
                            <div className={`flex sm:flex-col items-center gap-4 sm:gap-2 mb-6 sm:mb-0 ${currentStep >= 2 ? '' : 'opacity-50'}`}>
                                <div className={`size-8 rounded-full ${currentStep >= 2 ? 'bg-[#111417] text-white' : 'bg-[#f0f2f4] text-[#647587]'} flex items-center justify-center ring-4 ring-white`}>
                                    <Truck size={16} />
                                </div>
                                <div className="sm:text-center pt-1 sm:pt-2">
                                    <p className={`${currentStep >= 2 ? 'text-[#111417] font-bold' : 'text-[#647587] font-medium'} text-sm`}>Dikirim</p>
                                </div>
                            </div>

                            {/* Step 3: Selesai */}
                            <div className={`flex sm:flex-col items-center gap-4 sm:gap-2 ${currentStep >= 3 ? '' : 'opacity-50'}`}>
                                <div className={`size-8 rounded-full ${currentStep >= 3 ? 'bg-[#111417] text-white' : 'bg-[#f0f2f4] text-[#647587]'} flex items-center justify-center ring-4 ring-white`}>
                                    <CheckCircle size={16} />
                                </div>
                                <div className="sm:text-center pt-1 sm:pt-2">
                                    <p className={`${currentStep >= 3 ? 'text-[#111417] font-bold' : 'text-[#647587] font-medium'} text-sm`}>Selesai</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Detail */}
                    {order.shipment && (
                        <div className="bg-white border border-[#f0f2f4] rounded-xl p-6 shadow-sm">
                            <h3 className="text-[#111417] text-lg font-bold mb-4 pb-4 border-b border-[#f0f2f4]">Detail Pengiriman</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#647587] text-xs font-bold uppercase tracking-wider mb-1">Penerima</p>
                                    <p className="text-[#111417] text-base font-bold">{order.shipment.recipientName}</p>
                                    <p className="text-[#111417] text-sm">{order.shipment.recipientPhone}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#647587] text-xs font-bold uppercase tracking-wider mb-1">Alamat</p>
                                    <p className="text-[#111417] text-sm leading-relaxed">
                                        {order.shipment.addressDetail}<br />
                                        {order.shipment.addressCity}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#647587] text-xs font-bold uppercase tracking-wider mb-1">Kurir Pengiriman</p>
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} />
                                        <p className="text-[#111417] text-sm font-medium">{order.shipment.courier.toUpperCase()} - {order.shipment.service}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#647587] text-xs font-bold uppercase tracking-wider mb-1">No. Resi</p>
                                    {order.shipment.resi ? (
                                        <p className="text-[#111417] text-sm font-mono bg-[#f0f2f4] inline-block px-2 py-1 rounded w-fit select-all">
                                            {order.shipment.resi}
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-[#111417] text-sm font-mono bg-[#f0f2f4] inline-block px-2 py-1 rounded w-fit select-all">-</p>
                                            <p className="text-[#647587] text-xs mt-1 italic">Resi belum tersedia</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tombol Pesanan Diterima - hanya tampil saat status DIKIRIM */}
                            {order.status === "DIKIRIM" && (
                                <div className="mt-6 pt-6 border-t border-[#f0f2f4]">
                                    <button
                                        onClick={() => setShowConfirmDialog(true)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        <PackageCheck size={20} />
                                        Pesanan Diterima
                                    </button>
                                    <p className="text-center text-[#647587] text-xs mt-2">
                                        Klik tombol di atas jika pesanan sudah sampai
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    {/* Ringkasan Produk */}
                    <div className="bg-white border border-[#f0f2f4] rounded-xl p-6 shadow-sm h-fit">
                        <h3 className="text-[#111417] text-lg font-bold mb-4 pb-4 border-b border-[#f0f2f4]">Ringkasan Produk</h3>
                        <div className="flex flex-col gap-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-start">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0 bg-[#f8f9fa] border border-[#f0f2f4]"
                                        style={{ backgroundImage: `url("${item.product.image || '/placeholder.png'}")` }}
                                    />
                                    <div className="flex flex-col flex-1">
                                        <p className="text-[#111417] text-sm font-semibold line-clamp-2">{item.product.name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[#647587] text-xs">{item.quantity} x {formatCurrency(item.price)}</p>
                                            <p className="text-[#111417] text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rincian Pembayaran */}
                    <div className="bg-white border border-[#f0f2f4] rounded-xl p-6 shadow-sm h-fit">
                        <h3 className="text-[#111417] text-lg font-bold mb-4 pb-4 border-b border-[#f0f2f4]">Rincian Pembayaran</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#647587]">Metode Pembayaran</span>
                                <span className="text-[#111417] font-medium">Virtual Account BCA</span> {/* Hardcoded for now per design */}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#647587]">Subtotal Produk</span>
                                <span className="text-[#111417] font-medium">
                                    {formatCurrency(order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#647587]">Biaya Pengiriman</span>
                                <span className="text-[#111417] font-medium">{formatCurrency(order.shipment?.cost || 0)}</span>
                            </div>
                            <div className="h-px bg-[#f0f2f4] my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#111417] font-bold text-base">Total Bayar</span>
                                <span className="text-[#111417] font-bold text-xl">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

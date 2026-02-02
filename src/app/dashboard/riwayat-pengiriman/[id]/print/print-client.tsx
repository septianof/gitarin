"use client";

import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Printer, Download } from "lucide-react";

type OrderData = {
    id: string;
    createdAt: string;
    status: string;
    items: {
        id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            weight: number;
            image: string | null;
        };
    }[];
    shipment: {
        recipientName: string;
        recipientPhone: string;
        addressCity: string;
        addressDetail: string;
        postalCode: string;
        courier: string;
        service: string;
        cost: number;
        resi: string | null;
    };
};

export default function PrintClientRiwayat({ order }: { order: OrderData }) {
    const printRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const orderIdFormatted = `GG-${order.id.slice(-4).toUpperCase()}`;
    const totalWeight = order.items.reduce((sum, item) => sum + (item.product.weight * item.quantity), 0);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        router.push("/dashboard/riwayat-pengiriman");
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
            {/* Action Buttons - Hide when printing */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between px-4 print:hidden">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-zinc-900 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft size={18} />
                    Kembali ke Riwayat
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                    >
                        <Printer size={18} />
                        Cetak Label
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                    >
                        <Download size={18} />
                        Simpan PDF
                    </button>
                </div>
            </div>

            {/* Print Label */}
            <div
                ref={printRef}
                className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none"
            >
                {/* Header */}
                <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between print:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/images/logo-white.png"
                            alt="Gitarin"
                            width={100}
                            height={32}
                            className="h-8 w-auto"
                            priority
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                        <span className="text-lg font-bold">GITARIN</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-300">ID Pesanan</p>
                        <p className="font-bold text-lg">{orderIdFormatted}</p>
                    </div>
                </div>

                {/* Resi/AWB Section */}
                <div className="border-b border-gray-200 p-6 text-center bg-gray-50">
                    <p className="text-sm text-gray-500 uppercase font-medium tracking-wider mb-2">Nomor Resi / AWB</p>
                    <div className="flex items-center justify-center gap-4">
                        <p className="text-3xl font-mono font-bold text-zinc-900 tracking-wider">
                            {order.shipment.resi || "Belum tersedia"}
                        </p>
                    </div>
                    {order.shipment.resi && (
                        <div className="mt-4 flex justify-center">
                            <div className="bg-white p-3 border border-gray-200 rounded-lg">
                                {/* Barcode visual representation */}
                                <div className="flex items-end gap-px h-14">
                                    {order.shipment.resi.split('').map((char, i) => {
                                        const height = (char.charCodeAt(0) % 30) + 30;
                                        return (
                                            <div
                                                key={i}
                                                className="bg-zinc-900"
                                                style={{
                                                    height: `${height}px`,
                                                    width: i % 3 === 0 ? '3px' : '1.5px'
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="mt-2 text-sm font-medium text-zinc-900">
                        {order.shipment.courier.toUpperCase()} - {order.shipment.service}
                    </p>
                </div>

                {/* Address Section */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
                    {/* Sender */}
                    <div className="p-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pengirim</p>
                        <div className="space-y-1">
                            <p className="font-bold text-zinc-900">Gitarin Store</p>
                            <p className="text-sm text-gray-600">+62 812 3456 7890</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Jl. Gitar No. 123, Kelurahan Musik,<br />
                                Kecamatan Harmoni, Kota Bandung<br />
                                Jawa Barat, 40135
                            </p>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="p-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Penerima</p>
                        <div className="space-y-1">
                            <p className="font-bold text-zinc-900">{order.shipment.recipientName}</p>
                            <p className="text-sm text-gray-600">{order.shipment.recipientPhone}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {order.shipment.addressDetail}<br />
                                {order.shipment.addressCity}<br />
                                {order.shipment.postalCode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="p-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Isi Paket</p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-4 font-medium text-gray-500">Produk</th>
                                    <th className="text-center py-2 px-4 font-medium text-gray-500">Qty</th>
                                    <th className="text-right py-2 px-4 font-medium text-gray-500">Berat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2 px-4 text-zinc-900">{item.product.name}</td>
                                        <td className="py-2 px-4 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-2 px-4 text-right text-gray-600">{item.product.weight * item.quantity}g</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td className="py-2 px-4 font-medium text-zinc-900">Total</td>
                                    <td className="py-2 px-4 text-center font-medium text-zinc-900">
                                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                                    </td>
                                    <td className="py-2 px-4 text-right font-medium text-zinc-900">{totalWeight}g</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Dicetak pada: {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                    </p>
                    <p className="text-xs text-gray-500">
                        Tanggal order: {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: idLocale })}
                    </p>
                </div>
            </div>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
            `}</style>
        </div>
    );
}

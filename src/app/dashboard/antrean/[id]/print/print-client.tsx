"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, Download } from "lucide-react";

interface LabelData {
    orderId: string;
    orderDate: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    senderPostalCode: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    recipientCity: string;
    recipientPostalCode: string;
    courier: string;
    service: string;
    resi: string;
    totalWeight: number;
    totalItems: number;
    itemsSummary: { name: string; qty: number; weight: number }[];
}

export function PrintLabelClient({ labelData }: { labelData: LabelData }) {
    const router = useRouter();
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const formatWeight = (grams: number) => {
        if (grams >= 1000) {
            return `${(grams / 1000).toFixed(1)} kg`;
        }
        return `${grams} g`;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Control Bar - Hidden when printing */}
            <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-zinc-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Kembali</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-all shadow-lg"
                        >
                            <Printer size={18} />
                            Print / Save PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Area */}
            <div className="max-w-4xl mx-auto py-8 px-4 print:py-0 print:px-0 print:max-w-none">
                <div
                    ref={printRef}
                    className="bg-white shadow-lg print:shadow-none"
                >
                    {/* Label Container - A5 size approximation */}
                    <div className="p-8 print:p-6" style={{ minHeight: '210mm' }}>
                        
                        {/* Header with Logo */}
                        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl">🎸</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">GITARIN</h1>
                                    <p className="text-xs text-gray-500">Guitar & Music Store</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-zinc-900">{labelData.orderId}</p>
                                <p className="text-xs text-gray-500">{labelData.orderDate}</p>
                            </div>
                        </div>

                        {/* Courier & Resi - Prominent Display */}
                        <div className="bg-zinc-900 text-white p-4 rounded-lg mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-300 uppercase tracking-wider">Kurir</p>
                                    <p className="text-xl font-bold">{labelData.courier} - {labelData.service}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-300 uppercase tracking-wider">No. Resi</p>
                                    <p className="text-xl font-mono font-bold tracking-wider">{labelData.resi}</p>
                                </div>
                            </div>
                        </div>

                        {/* Barcode Representation */}
                        <div className="flex justify-center mb-6">
                            <div className="text-center">
                                {/* Simple Barcode Visual using CSS */}
                                <div className="flex items-end justify-center gap-[2px] h-16 mb-2">
                                    {labelData.resi.split('').map((char, idx) => {
                                        const height = (char.charCodeAt(0) % 30) + 40;
                                        const width = idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1;
                                        return (
                                            <div
                                                key={idx}
                                                className="bg-zinc-900"
                                                style={{ height: `${height}px`, width: `${width}px` }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="font-mono text-sm tracking-[0.3em]">{labelData.resi}</p>
                            </div>
                        </div>

                        {/* Address Section - Two Column */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Sender */}
                            <div className="border-2 border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs">📤</span>
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pengirim</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-zinc-900">{labelData.senderName}</p>
                                    <p className="text-sm text-gray-600">{labelData.senderPhone}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {labelData.senderAddress}
                                    </p>
                                    <p className="text-sm text-gray-500">{labelData.senderPostalCode}</p>
                                </div>
                            </div>

                            {/* Recipient */}
                            <div className="border-2 border-zinc-900 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                                        <span className="text-xs">📥</span>
                                    </div>
                                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Penerima</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-zinc-900 text-lg">{labelData.recipientName}</p>
                                    <p className="text-sm text-gray-700 font-medium">{labelData.recipientPhone}</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {labelData.recipientAddress}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {labelData.recipientCity}, {labelData.recipientPostalCode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Package Info */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Total Berat</p>
                                        <p className="text-lg font-bold text-zinc-900">{formatWeight(labelData.totalWeight)}</p>
                                    </div>
                                    <div className="w-px h-10 bg-gray-300" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Jumlah Item</p>
                                        <p className="text-lg font-bold text-zinc-900">{labelData.totalItems} pcs</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase">Jenis Paket</p>
                                    <p className="text-sm font-medium text-zinc-900">📦 Reguler</p>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Isi Paket</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-200">
                                            <th className="pb-2 font-medium">Produk</th>
                                            <th className="pb-2 font-medium text-center">Qty</th>
                                            <th className="pb-2 font-medium text-right">Berat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-zinc-900">
                                        {labelData.itemsSummary.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 last:border-0">
                                                <td className="py-2 font-medium">{item.name}</td>
                                                <td className="py-2 text-center">{item.qty}x</td>
                                                <td className="py-2 text-right text-gray-600">{formatWeight(item.weight * item.qty)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t-2 border-gray-200 pt-4 flex items-center justify-between text-xs text-gray-400">
                            <p>Dicetak dari Sistem Gitarin</p>
                            <p>Terima kasih telah berbelanja di Gitarin 🎸</p>
                        </div>

                    </div>
                </div>

                {/* Print Instructions - Hidden when printing */}
                <div className="print:hidden mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Tips Print</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Klik tombol <strong>"Print / Save PDF"</strong> di atas</li>
                        <li>• Untuk menyimpan sebagai PDF: pilih <strong>"Save as PDF"</strong> di menu Destination/Printer</li>
                        <li>• Untuk print langsung: pilih printer Anda dan klik Print</li>
                        <li>• Disarankan menggunakan kertas A5 atau A4</li>
                    </ul>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A5;
                        margin: 10mm;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

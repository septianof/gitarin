
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingBag, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
    id: string;
    totalAmount: number | string;
    status: string;
    snapToken?: string | null;
    createdAt: Date;
    items: {
        id: string;
        quantity: number;
        price: number | string;
        product: {
            name: string;
            image: string;
        };
    }[];
    shipment?: {
        cost: number | string;
        recipientName: string;
    } | null;
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function PaymentView({ order, midtransClientKey }: { order: Order; midtransClientKey: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [snapToken, setSnapToken] = useState(order.snapToken);

    // Load Snap Script
    useEffect(() => {
        const scriptId = "midtrans-script";
        const scriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";

        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement("script");
            script.src = scriptUrl;
            script.id = scriptId;
            script.setAttribute("data-client-key", midtransClientKey);
            document.body.appendChild(script);
        }

        return () => {
            // Clean up if needed
        };
    }, [midtransClientKey]);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            let token = snapToken;

            // If no token, fetch one
            if (!token) {
                const res = await fetch("/api/payment/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: order.id }),
                });
                const data = await res.json();
                if (data.token) {
                    token = data.token;
                    setSnapToken(token);
                } else {
                    toast.error(data.error || "Gagal memproses pembayaran");
                    setIsLoading(false);
                    return;
                }
            }

            if (token && window.snap) {
                window.snap.pay(token, {
                    onSuccess: function (result: any) {
                        toast.success("Pembayaran Berhasil!");
                        router.push("/profil/pesanan");
                    },
                    onPending: function (result: any) {
                        toast.info("Menunggu pembayaran...");
                        router.push("/profil/pesanan");
                    },
                    onError: function (result: any) {
                        toast.error("Pembayaran gagal!");
                    },
                    onClose: function () {
                        setIsLoading(false);
                    },
                });
            } else {
                toast.error("Sistem pembayaran belum siap (Script belum load). Coba refresh.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan");
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number | string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(price));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Payment Action */}
            <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Selesaikan pembayaran</span>
                        <div className="flex items-center gap-2 text-zinc-900">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-bold">24:00:00</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    <p className="text-gray-500 mb-2">Total Pembayaran</p>
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-8">
                        {formatPrice(order.totalAmount)}
                    </h2>

                    <div className="w-full max-w-md space-y-4">
                        <Button
                            onClick={handlePayment}
                            size="lg"
                            disabled={isLoading}
                            className="w-full h-14 text-lg font-bold bg-zinc-900 hover:bg-zinc-800"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Bayar Sekarang"
                            )}
                        </Button>
                        <p className="text-xs text-gray-500">
                            Klik tombol di atas untuk memilih metode pembayaran (BCA, Mandiri, QRIS, dll).
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-center">
                    <div className="flex items-center gap-2 text-gray-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Midtrans Secured</span>
                    </div>
                </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[360px] shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Ringkasan Pesanan
                    </h3>

                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden shrink-0 relative">
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-zinc-900 line-clamp-2">{item.product.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Biaya Pengiriman</span>
                                <span className="font-medium text-zinc-900">
                                    {order.shipment ? formatPrice(order.shipment.cost) : "-"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-base font-bold text-zinc-900">Total Bayar</span>
                                <span className="text-lg font-bold text-zinc-900">{formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

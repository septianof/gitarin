"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, Lock, ChevronDown, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadedImage } from "@/components/ui/uploaded-image";
import { getCart, updateCartItem, removeCartItem } from "@/app/actions/cart";
import { createOrder } from "@/app/actions/order";
import { BiteshipArea, BiteshipRate } from "@/lib/biteship";

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: string | number;
        image: string;
        weight: number;
        stock: number;
        category: {
            name: string;
        };
    };
}

export default function KeranjangPage() {
    const router = useRouter();
    const { status } = useSession();

    // Cart state
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [totalWeight, setTotalWeight] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

    // Shipping form state
    const [shippingForm, setShippingForm] = useState({
        recipientName: "",
        recipientPhone: "",
        areaId: "",
        postalCode: "",
        addressDetail: "",
        service: "", // Biteship returns full rate object, we store index or key
    });

    // Area Search state
    const [areaQuery, setAreaQuery] = useState("");
    const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
    const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaResults, setShowAreaResults] = useState(false);

    // Shipping cost
    const [shippingRates, setShippingRates] = useState<BiteshipRate[]>([]);
    const [loadingShipping, setLoadingShipping] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Silakan login terlebih dahulu");
            router.push("/login?callbackUrl=/keranjang");
        }
    }, [status, router]);

    // Fetch cart
    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        const result = await getCart();
        if (result.success && result.cart) {
            setCartItems(result.cart.items as unknown as CartItem[]);
            setSubtotal(result.subtotal || 0);
            setTotalWeight(result.totalWeight || 0);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchCart();
        }
    }, [status, fetchCart]);

    // Area Search Debounce & Fetch
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!areaQuery || areaQuery.length < 3) {
                setAreaResults([]);
                return;
            }

            // Don't search if query matches selected area to avoid re-opening
            if (selectedArea && areaQuery === selectedArea.name) return;

            setIsSearchingArea(true);
            try {
                const res = await fetch(`/api/shipping/areas?query=${encodeURIComponent(areaQuery)}`);
                const data = await res.json();
                setAreaResults(data.areas || []);
                setShowAreaResults(true);
            } catch (error) {
                console.error("Error searching areas:", error);
            }
            setIsSearchingArea(false);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [areaQuery, selectedArea]);

    // Select Area Handler
    const handleSelectArea = (area: BiteshipArea) => {
        setSelectedArea(area);
        setShippingForm(prev => ({ ...prev, areaId: area.id, postalCode: area.postal_code.toString() }));
        setAreaQuery(area.name);
        setShowAreaResults(false);
        setAreaResults([]);
    };

    // Calculate shipping when area chosen
    useEffect(() => {
        if (!shippingForm.areaId || totalWeight === 0) {
            setShippingRates([]);
            return;
        }

        const calculateShipping = async () => {
            setLoadingShipping(true);
            try {
                const res = await fetch("/api/shipping/cost", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        destinationAreaId: shippingForm.areaId,
                    }),
                });

                const data = await res.json();

                if (data.rates) {
                    setShippingRates(data.rates);
                    // Reset service selection
                    setShippingForm(prev => ({ ...prev, service: "" }));
                } else if (data.error) {
                    toast.error(data.error);
                }
            } catch (error) {
                console.error("Error calculating shipping:", error);
                toast.error("Gagal menghitung ongkir");
            }
            setLoadingShipping(false);
        };
        calculateShipping();
    }, [shippingForm.areaId, totalWeight]);

    // Handle quantity update
    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        setUpdatingItems((prev) => new Set(prev).add(itemId));
        const result = await updateCartItem(itemId, newQuantity);
        if (result.success) {
            await fetchCart();
            window.dispatchEvent(new CustomEvent("cart-updated"));
        } else {
            toast.error(result.error || "Gagal mengupdate");
        }
        setUpdatingItems((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    };

    // Handle remove item
    const handleRemoveItem = async (itemId: string) => {
        setUpdatingItems((prev) => new Set(prev).add(itemId));
        const result = await removeCartItem(itemId);
        if (result.success) {
            toast.success("Item dihapus dari keranjang");
            await fetchCart();
            window.dispatchEvent(new CustomEvent("cart-updated"));
        } else {
            toast.error(result.error || "Gagal menghapus");
        }
        setUpdatingItems((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    };

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (!shippingForm.recipientName || !shippingForm.recipientPhone) {
            toast.error("Lengkapi data penerima");
            return;
        }
        if (!shippingForm.areaId) {
            toast.error("Pilih area pengiriman");
            return;
        }
        if (!shippingForm.addressDetail) {
            toast.error("Isi detail alamat");
            return;
        }
        if (shippingForm.service === "") {
            toast.error("Pilih layanan pengiriman");
            return;
        }

        setIsLoading(true);

        // Get selected rate
        const selectedRate = shippingRates[Number(shippingForm.service)];

        const result = await createOrder({
            recipientName: shippingForm.recipientName,
            recipientPhone: shippingForm.recipientPhone,
            areaId: shippingForm.areaId,
            areaName: selectedArea?.name || areaQuery,
            postalCode: shippingForm.postalCode,
            addressDetail: shippingForm.addressDetail,
            courierCompany: selectedRate.company,           // e.g., "jne"
            courierName: selectedRate.courier_name,         // e.g., "JNE"
            courierType: selectedRate.courier_service_code, // e.g., "reg"
            service: selectedRate.courier_service_name,     // e.g., "Regular"
            shippingCost: selectedRate.price,
        });

        if (result.success && result.orderId) {
            toast.success("Pesanan dibuat!");
            router.push(`/pembayaran/${result.orderId}`);
        } else {
            toast.error(result.error || "Gagal membuat pesanan");
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Find selected rate logic
    const selectedRate = shippingRates.find((_r, idx) => idx.toString() === shippingForm.service);
    const shippingCost = selectedRate ? selectedRate.price : 0;
    const total = subtotal + shippingCost;

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <ShoppingBag className="w-16 h-16 text-zinc-300" />
                <h1 className="text-2xl font-bold text-zinc-900">Keranjang Kosong</h1>
                <p className="text-gray-500 text-center">
                    Belum ada produk di keranjang Anda. Yuk, mulai belanja!
                </p>
                <Button
                    onClick={() => router.push("/produk")}
                    className="mt-4 bg-zinc-900 hover:bg-zinc-800"
                >
                    Lihat Produk
                </Button>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-zinc-900 mb-8">Keranjang & Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Column - Cart Items & Shipping Form */}
                <div className="flex-1 lg:w-2/3 flex flex-col gap-8">
                    {/* Cart Items */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-zinc-900">Daftar Barang</h2>

                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                            >
                                {/* Product Image */}
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                    <UploadedImage
                                        src={item.product.image}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-col sm:flex-row flex-1 justify-between sm:items-center gap-4">
                                    <div className="flex flex-col justify-center">
                                        <p className="text-zinc-900 font-bold line-clamp-1">
                                            {item.product.name}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {item.product.category.name}
                                        </p>
                                        <p className="text-zinc-900 font-bold text-sm mt-1">
                                            {formatPrice(Number(item.product.price))}
                                        </p>
                                    </div>

                                    {/* Quantity & Delete */}
                                    <div className="flex items-center justify-between sm:justify-end gap-6">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={updatingItems.has(item.id) || item.quantity <= 1}
                                                className="flex items-center justify-center w-6 h-6 rounded-full text-zinc-900 hover:bg-gray-200 transition disabled:opacity-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {updatingItems.has(item.id) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={updatingItems.has(item.id) || item.quantity >= item.product.stock}
                                                className="flex items-center justify-center w-6 h-6 rounded-full text-zinc-900 hover:bg-gray-200 transition disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={updatingItems.has(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Shipping Form */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-zinc-900">Alamat Pengiriman</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Left Column */}
                            <div className="flex flex-col gap-4">
                                {/* Recipient Name */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Nama Penerima</Label>
                                    <Input
                                        name="recipientName"
                                        value={shippingForm.recipientName}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan nama lengkap"
                                        className="h-11"
                                    />
                                </div>

                                {/* Area Search (Replaces Province/City) */}
                                <div className="flex flex-col gap-1 relative z-20">
                                    <Label className="text-sm font-medium">Kecamatan / Kota</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {isSearchingArea ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        </div>
                                        <Input
                                            value={areaQuery}
                                            onChange={(e) => {
                                                setAreaQuery(e.target.value);
                                                setShowAreaResults(true);
                                                if (!e.target.value) {
                                                    setShippingForm(prev => ({ ...prev, areaId: "" }));
                                                    setSelectedArea(null);
                                                }
                                            }}
                                            placeholder="Ketik Kecamatan / Kota..."
                                            className="h-11 pl-10"
                                        />
                                    </div>

                                    {/* Area Results Dropdown */}
                                    {showAreaResults && areaResults.length > 0 && (
                                        <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                            {areaResults.map((area) => (
                                                <button
                                                    key={area.id}
                                                    onClick={() => handleSelectArea(area)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="font-medium text-zinc-900">{area.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Detail Address */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Detail Alamat</Label>
                                    <textarea
                                        name="addressDetail"
                                        value={shippingForm.addressDetail}
                                        onChange={handleInputChange}
                                        placeholder="Nama Jalan, No. Rumah, RT/RW, Patokan"
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-4">
                                {/* Phone */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Nomor Telepon</Label>
                                    <Input
                                        name="recipientPhone"
                                        value={shippingForm.recipientPhone}
                                        onChange={handleInputChange}
                                        placeholder="08xxxxxxxxxx"
                                        className="h-11"
                                    />
                                </div>

                                {/* Postal Code */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Kode Pos</Label>
                                    <Input
                                        name="postalCode"
                                        value={shippingForm.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="Otomatis"
                                        className="h-11 bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                {/* Service Selection */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Pilih Pengiriman</Label>
                                    <div className="relative">
                                        <select
                                            name="service"
                                            value={shippingForm.service}
                                            onChange={handleInputChange}
                                            disabled={!shippingForm.areaId || loadingShipping}
                                            className="w-full h-11 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingShipping ? "Menghitung ongkir..." : shippingRates.length > 0 ? "Pilih Layanan" : "Isi alamat dulu"}
                                            </option>
                                            {shippingRates.map((rate, idx) => (
                                                <option key={idx} value={idx.toString()}>
                                                    {rate.courier_name} {rate.courier_service_name} ({rate.duration}) - {formatPrice(rate.price)}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    {loadingShipping && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Mencari kurir terbaik...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:w-1/3 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-zinc-900 mb-6">Ringkasan Pesanan</h2>

                        <div className="flex flex-col gap-4 pb-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">
                                    Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} Barang)
                                </span>
                                <span className="text-zinc-900 font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Biaya Pengiriman</span>
                                <span className="text-zinc-900 font-medium">
                                    {shippingCost > 0 ? formatPrice(shippingCost) : "-"}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-6">
                            <span className="text-zinc-900 text-lg font-bold">Total Bayar</span>
                            <span className="text-zinc-900 text-xl font-bold">{formatPrice(total)}</span>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                        >
                            Bayar Sekarang
                        </Button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                            <Lock className="w-4 h-4" />
                            <span>Pembayaran Aman & Terenkripsi</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

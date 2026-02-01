"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, Lock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCart, updateCartItem, removeCartItem } from "@/app/actions/cart";

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

interface Province {
    province_id: string;
    province: string;
}

interface City {
    city_id: string;
    city_name: string;
    type: string;
    postal_code: string;
}

interface ShippingService {
    service: string;
    description: string;
    cost: {
        value: number;
        etd: string;
    }[];
}

const COURIERS = [
    { code: "jne", name: "JNE (Jalur Nugraha Ekakurir)" },
    { code: "pos", name: "POS Indonesia" },
    { code: "tiki", name: "TIKI (Titipan Kilat)" },
];

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
        provinceId: "",
        cityId: "",
        postalCode: "",
        addressDetail: "",
        courier: "",
        service: "",
    });

    // Location data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Shipping cost
    const [shippingServices, setShippingServices] = useState<ShippingService[]>([]);
    const [shippingCost, setShippingCost] = useState(0);
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

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const res = await fetch("/api/shipping/provinces");
                const data = await res.json();
                setProvinces(data.provinces || []);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
            setLoadingProvinces(false);
        };
        fetchProvinces();
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (!shippingForm.provinceId) {
            setCities([]);
            return;
        }

        const fetchCities = async () => {
            setLoadingCities(true);
            try {
                const res = await fetch(`/api/shipping/cities?province_id=${shippingForm.provinceId}`);
                const data = await res.json();
                setCities(data.cities || []);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
            setLoadingCities(false);
        };
        fetchCities();
    }, [shippingForm.provinceId]);

    // Calculate shipping when city and courier selected
    useEffect(() => {
        if (!shippingForm.cityId || !shippingForm.courier || totalWeight === 0) {
            setShippingServices([]);
            setShippingCost(0);
            return;
        }

        const calculateShipping = async () => {
            setLoadingShipping(true);
            try {
                const res = await fetch("/api/shipping/cost", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        destination: shippingForm.cityId,
                        weight: totalWeight,
                        courier: shippingForm.courier,
                    }),
                });
                const data = await res.json();
                if (data.result?.costs) {
                    setShippingServices(data.result.costs);
                    // Auto-select first service if none selected
                    if (data.result.costs.length > 0 && !shippingForm.service) {
                        setShippingForm((prev) => ({
                            ...prev,
                            service: data.result.costs[0].service,
                        }));
                        setShippingCost(data.result.costs[0].cost[0]?.value || 0);
                    }
                }
            } catch (error) {
                console.error("Error calculating shipping:", error);
            }
            setLoadingShipping(false);
        };
        calculateShipping();
    }, [shippingForm.cityId, shippingForm.courier, totalWeight, shippingForm.service]);

    // Update shipping cost when service changes
    useEffect(() => {
        if (shippingForm.service && shippingServices.length > 0) {
            const selectedService = shippingServices.find((s) => s.service === shippingForm.service);
            if (selectedService?.cost[0]) {
                setShippingCost(selectedService.cost[0].value);
            }
        }
    }, [shippingForm.service, shippingServices]);

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
        setShippingForm((prev) => {
            const updated = { ...prev, [name]: value };
            // Reset dependent fields
            if (name === "provinceId") {
                updated.cityId = "";
                updated.postalCode = "";
            }
            if (name === "courier") {
                updated.service = "";
            }
            return updated;
        });
    };

    // Handle city change (also set postal code)
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        const selectedCity = cities.find((c) => c.city_id === cityId);
        setShippingForm((prev) => ({
            ...prev,
            cityId,
            postalCode: selectedCity?.postal_code || "",
        }));
    };

    // Handle checkout
    const handleCheckout = () => {
        // Validate form
        if (!shippingForm.recipientName) {
            toast.error("Nama penerima harus diisi");
            return;
        }
        if (!shippingForm.recipientPhone) {
            toast.error("Nomor telepon harus diisi");
            return;
        }
        if (!shippingForm.provinceId || !shippingForm.cityId) {
            toast.error("Pilih provinsi dan kota/kabupaten");
            return;
        }
        if (!shippingForm.addressDetail) {
            toast.error("Detail alamat harus diisi");
            return;
        }
        if (!shippingForm.courier || !shippingForm.service) {
            toast.error("Pilih kurir dan layanan pengiriman");
            return;
        }

        // For now, just show a placeholder
        toast.success("Fitur pembayaran akan segera hadir!");
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                    <Image
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

                                {/* Province */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Provinsi</Label>
                                    <div className="relative">
                                        <select
                                            name="provinceId"
                                            value={shippingForm.provinceId}
                                            onChange={handleInputChange}
                                            disabled={loadingProvinces}
                                            className="w-full h-11 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingProvinces ? "Memuat..." : "Pilih Provinsi"}
                                            </option>
                                            {provinces.map((p) => (
                                                <option key={p.province_id} value={p.province_id}>
                                                    {p.province}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
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

                                {/* City */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Kota/Kabupaten</Label>
                                    <div className="relative">
                                        <select
                                            name="cityId"
                                            value={shippingForm.cityId}
                                            onChange={handleCityChange}
                                            disabled={!shippingForm.provinceId || loadingCities}
                                            className="w-full h-11 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingCities ? "Memuat..." : "Pilih Kota/Kabupaten"}
                                            </option>
                                            {cities.map((c) => (
                                                <option key={c.city_id} value={c.city_id}>
                                                    {c.type} {c.city_name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Postal Code */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Kode Pos</Label>
                                    <Input
                                        name="postalCode"
                                        value={shippingForm.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 12345"
                                        className="h-11"
                                    />
                                </div>

                                {/* Courier */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-sm font-medium">Kurir Pengiriman</Label>
                                    <div className="relative">
                                        <select
                                            name="courier"
                                            value={shippingForm.courier}
                                            onChange={handleInputChange}
                                            disabled={!shippingForm.cityId}
                                            className="w-full h-11 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">Pilih Kurir</option>
                                            {COURIERS.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Service */}
                                {shippingServices.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-sm font-medium">Layanan Pengiriman</Label>
                                        <div className="relative">
                                            <select
                                                name="service"
                                                value={shippingForm.service}
                                                onChange={handleInputChange}
                                                className="w-full h-11 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none"
                                            >
                                                {shippingServices.map((s) => (
                                                    <option key={s.service} value={s.service}>
                                                        {s.service} - {s.description} ({s.cost[0]?.etd || "-"} hari) - {formatPrice(s.cost[0]?.value || 0)}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {loadingShipping && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menghitung ongkos kirim...
                                    </div>
                                )}
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

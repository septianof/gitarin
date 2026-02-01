"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/actions/cart";

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    stock: number;
    className?: string;
}

export function AddToCartButton({
    productId,
    productName,
    stock,
    className = "",
}: AddToCartButtonProps) {
    const router = useRouter();
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = async () => {
        if (status === "unauthenticated") {
            toast.error("Silakan login terlebih dahulu");
            router.push(`/login?callbackUrl=/produk`);
            return;
        }

        if (stock <= 0) {
            toast.error("Stok habis");
            return;
        }

        setIsLoading(true);
        const result = await addToCart(productId, 1);

        if (result.success) {
            toast.success(`${productName} ditambahkan ke keranjang`);
            window.dispatchEvent(new CustomEvent("cart-updated"));
        } else {
            toast.error(result.error || "Gagal menambahkan ke keranjang");
        }

        setIsLoading(false);
    };

    return (
        <Button
            onClick={handleAddToCart}
            disabled={isLoading || stock <= 0}
            size="lg"
            className={`bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5" />
                    {stock <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                </>
            )}
        </Button>
    );
}

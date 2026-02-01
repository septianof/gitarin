"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart } from "lucide-react";
import { getCartCount } from "@/app/actions/cart";

export function CartBadge() {
    const { status } = useSession();
    const [count, setCount] = useState(0);

    const fetchCount = useCallback(async () => {
        if (status !== "authenticated") {
            setCount(0);
            return;
        }
        const cartCount = await getCartCount();
        setCount(cartCount);
    }, [status]);

    useEffect(() => {
        fetchCount();
    }, [fetchCount]);

    // Listen for cart-updated events (realtime)
    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCount();
        };

        window.addEventListener("cart-updated", handleCartUpdate);
        return () => window.removeEventListener("cart-updated", handleCartUpdate);
    }, [fetchCount]);

    // Refresh count when window regains focus
    useEffect(() => {
        const handleFocus = () => fetchCount();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [fetchCount]);

    return (
        <Link
            href="/keranjang"
            className="relative p-2 text-gray-500 hover:text-zinc-900 transition"
        >
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}

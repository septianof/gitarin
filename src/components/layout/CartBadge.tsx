"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart } from "lucide-react";
import { getCartCount } from "@/app/actions/cart";

export function CartBadge() {
    const { status } = useSession();
    const [count, setCount] = useState(0);
    const [shouldBounce, setShouldBounce] = useState(false);
    const prevCountRef = useRef(0);

    const fetchCount = useCallback(async () => {
        if (status !== "authenticated") {
            setCount(0);
            return;
        }
        const cartCount = await getCartCount();
        
        // Trigger bounce animation if count increased
        if (cartCount > prevCountRef.current) {
            setShouldBounce(true);
            setTimeout(() => setShouldBounce(false), 300);
        }
        prevCountRef.current = cartCount;
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
            className="relative p-2 text-gray-500 hover:text-zinc-900 transition-colors duration-200"
        >
            <ShoppingCart className="w-6 h-6 transition-transform duration-200 hover:scale-110" />
            {count > 0 && (
                <span 
                    className={`absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center transition-transform duration-200 ${shouldBounce ? 'animate-cart-bounce' : ''}`}
                >
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}

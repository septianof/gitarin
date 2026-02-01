"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CartContextType {
    count: number;
    refreshCart: () => void;
    incrementCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState(0);

    const refreshCart = useCallback(() => {
        // Trigger a re-render in CartBadge by updating count
        // This will be called after add/remove operations
        setCount((prev) => prev); // Force update signal
        // Dispatch custom event for components to react
        window.dispatchEvent(new CustomEvent("cart-updated"));
    }, []);

    const incrementCount = useCallback(() => {
        setCount((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent("cart-updated"));
    }, []);

    return (
        <CartContext.Provider value={{ count, refreshCart, incrementCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

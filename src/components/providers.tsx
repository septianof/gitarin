"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#18181b",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "12px 20px",
                        fontSize: "14px",
                        fontWeight: "500",
                    },
                    classNames: {
                        success: "[&>svg]:text-white",
                        error: "[&>svg]:text-white",
                    },
                }}
            />
        </SessionProvider>
    );
}

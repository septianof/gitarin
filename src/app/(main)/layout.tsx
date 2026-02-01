import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Suspense fallback={<div className="h-20 bg-white border-b" />}>
                <Navbar />
            </Suspense>
            {children}
            <Footer />
        </>
    );
}

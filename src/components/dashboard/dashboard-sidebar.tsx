"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    Settings,
    LogOut,
    ShoppingBag
} from "lucide-react";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
    user: {
        name: string;
        email: string;
        role: string;
        photo?: string | null;
    };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname();

    const GUDANG_LINKS = [
        { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
        { label: "Pesanan Masuk", href: "/dashboard/pesanan", icon: Package },
        { label: "Riwayat Pengiriman", href: "/dashboard/pengiriman", icon: Truck },
    ];

    const ADMIN_LINKS = [
        { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
        { label: "Kelola Produk", href: "/dashboard/produk", icon: ShoppingBag },
        { label: "Kelola User", href: "/dashboard/users", icon: Users },
        { label: "Laporan", href: "/dashboard/laporan", icon: Settings }, // Placeholder
    ];

    const links = user.role === "ADMIN" ? ADMIN_LINKS : GUDANG_LINKS;

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
                {/* User Info */}
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-4 mb-1">
                        <div
                            className="size-12 rounded-full bg-cover bg-center border border-gray-200"
                            style={{ backgroundImage: `url(${user.photo || '/placeholder-user.jpg'})` }}
                        />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 font-medium truncate">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-2 flex flex-col gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-zinc-900 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-zinc-900"
                                    }`}
                            >
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-gray-200 mt-2">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left"
                    >
                        <LogOut size={18} />
                        Keluar
                    </button>
                </div>
            </div>
        </aside>
    );
}

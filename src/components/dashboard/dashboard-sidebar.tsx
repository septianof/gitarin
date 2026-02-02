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
    ShoppingBag,
    ListTodo,
    History,
    Shapes,
    FileText,
    Wallet,
    UserPlus
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
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Daftar Antrean", href: "/dashboard/antrean", icon: ListTodo },
        { label: "Riwayat Pengiriman", href: "/dashboard/riwayat", icon: History },
    ];

    const ADMIN_LINKS = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Kelola Kategori", href: "/dashboard/kategori", icon: Shapes },
        { label: "Kelola Produk", href: "/dashboard/produk", icon: Package },
        { label: "Kelola Pengguna", href: "/dashboard/users", icon: Users },
        { label: "Laporan Penjualan", href: "/dashboard/laporan", icon: FileText },
    ];

    const links = user.role === "ADMIN" ? ADMIN_LINKS : GUDANG_LINKS;
    const title = user.role === "ADMIN" ? "Gitarin Admin" : "Gitarin Gudang";

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white h-full min-h-[calc(100vh-80px)] p-4 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                {/* Brand */}
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="size-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold shrink-0 border border-gray-100 overflow-hidden text-sm">
                        {user.photo ? (
                            <img
                                src={user.photo}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user.name?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-sm font-bold text-zinc-900 leading-tight">{title}</h2>
                        <p className="text-xs text-gray-500 font-medium truncate">{user.email}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 flex-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-[#111417] text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-200 hover:text-zinc-900"
                                    }`}
                            >
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all text-left"
                    >
                        <LogOut size={18} />
                        Keluar
                    </button>
                </div>
            </div>
        </aside>
    );
}

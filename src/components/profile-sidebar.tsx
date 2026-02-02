"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, Package2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSidebarProps {
    user: {
        name: string;
        email: string;
        photo?: string | null;
    };
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
    const pathname = usePathname();

    const navigation = [
        { name: "Informasi Akun", href: "/profil", icon: User },
        { name: "Daftar Pesanan", href: "/profil/pesanan", icon: Package2 },
    ];

    return (
        <aside className="w-full md:w-80 flex-shrink-0">
            <div className="flex flex-col bg-white rounded-xl border border-[#f0f2f4] p-6 shadow-sm sticky top-24">
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-14 border border-gray-100 bg-gray-200"
                        style={{
                            backgroundImage: user.photo ? `url("${user.photo}")` : undefined,
                        }}
                    >
                        {!user.photo && (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <User size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-[#111417] text-base font-bold leading-tight truncate">
                            {user.name}
                        </h1>
                        <p className="text-[#647587] text-sm font-normal leading-normal truncate">
                            {user.email}
                        </p>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-[#111417] text-white"
                                        : "hover:bg-[#f0f2f4] text-[#647587] hover:text-[#111417]"
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={cn(isActive ? "text-white" : "")}
                                />
                                <p className="text-sm font-medium leading-normal">
                                    {item.name}
                                </p>
                            </Link>
                        );
                    })}


                    <div className="h-px bg-[#f0f2f4] my-2"></div>

                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 text-[#647587] hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <p className="text-sm font-medium leading-normal">Keluar</p>
                    </button>
                </nav>
            </div>
        </aside>
    );
}

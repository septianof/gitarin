"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Music, Menu, X } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const isUserTyping = useRef(false);
    const lastSearched = useRef(searchParams.get("search") || "");

    // Handle search with debounce
    useEffect(() => {
        // Only search if user is typing (not URL sync)
        if (!isUserTyping.current) return;

        const timer = setTimeout(() => {
            const trimmedQuery = searchQuery.trim();

            // Don't navigate if query hasn't actually changed
            if (trimmedQuery === lastSearched.current) {
                isUserTyping.current = false;
                return;
            }

            lastSearched.current = trimmedQuery;

            const params = new URLSearchParams();

            if (trimmedQuery) {
                params.set("search", trimmedQuery);
            }
            params.set("page", "1");

            router.push(`/produk?${params.toString()}`);
            isUserTyping.current = false;
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, router]);

    // Sync input with URL when navigating (external navigation only)
    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        if (urlSearch !== lastSearched.current) {
            lastSearched.current = urlSearch;
            setSearchQuery(urlSearch);
        }
    }, [searchParams]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        isUserTyping.current = true;
        setSearchQuery(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        isUserTyping.current = true;
        setSearchQuery("");
        lastSearched.current = "";
        router.push("/produk?page=1");
    }, [router]);

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 gap-8">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center shrink-0 cursor-pointer">
                        <div className="bg-zinc-900 text-white p-2 rounded-full mr-3">
                            <Music className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-zinc-900">Gitarin</span>
                    </Link>

                    {/* Center Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className={`font-medium transition ${isActive('/')
                                    ? "text-zinc-900"
                                    : "text-gray-500 hover:text-zinc-900"
                                }`}
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/produk"
                            className={`font-medium transition ${isActive('/produk')
                                    ? "text-zinc-900"
                                    : "text-gray-500 hover:text-zinc-900"
                                }`}
                        >
                            Produk
                        </Link>
                    </div>

                    {/* Search Bar - Live Search */}
                    <div className="hidden md:flex flex-1 max-w-lg">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-400 w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-all"
                                placeholder="Cari gitar impianmu..."
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:text-zinc-900 transition">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-500 hover:text-zinc-900 transition"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-gray-200"
                            >
                                Daftar
                            </Link>
                        </div>

                        <button className="md:hidden p-2 text-gray-600">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

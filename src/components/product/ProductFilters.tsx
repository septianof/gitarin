"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { type Category } from "@prisma/client";

interface ProductFiltersProps {
    categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("categoryId") || "";
    const currentSort = searchParams.get("sortBy") || "newest";

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset page to 1 on filter change
        params.set("page", "1");

        router.push(`/produk?${params.toString()}`);
        router.refresh(); // Force refresh to ensure server data updates
    };

    return (
        <div className="flex flex-wrap gap-3">
            {/* Category Dropdown */}
            <div className="relative">
                <select
                    value={currentCategory}
                    onChange={(e) => handleFilterChange("categoryId", e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium shadow-sm transition-colors cursor-pointer min-w-[180px]"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
                <select
                    value={currentSort}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium shadow-sm transition-colors cursor-pointer min-w-[180px]"
                >
                    <option value="newest">Urutkan: Terbaru</option>
                    <option value="price-asc">Harga: Terendah</option>
                    <option value="price-desc">Harga: Tertinggi</option>
                    <option value="name-asc">Nama: A - Z</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ArrowUpDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

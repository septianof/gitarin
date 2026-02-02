"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Category {
    id: number;
    name: string;
}

interface ProductFiltersAdminProps {
    categories: Category[];
}

export function ProductFiltersAdmin({ categories }: ProductFiltersAdminProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentSearch = searchParams.get("search") || "";
    const currentCategory = searchParams.get("category") || "";

    const [searchValue, setSearchValue] = useState(currentSearch);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset to page 1 when filtering
        params.delete("page");
        
        startTransition(() => {
            router.push(`/dashboard/produk?${params.toString()}`);
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters("search", searchValue);
    };

    const clearFilters = () => {
        setSearchValue("");
        startTransition(() => {
            router.push("/dashboard/produk");
        });
    };

    const hasActiveFilters = currentSearch || currentCategory;

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Cari produk..."
                        className="pl-10 pr-4"
                    />
                </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                        value={currentCategory}
                        onChange={(e) => updateFilters("category", e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent appearance-none bg-white min-w-[180px]"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}

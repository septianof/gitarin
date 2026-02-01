import { Suspense } from "react";
import { getProducts, getAllCategories, type SortOption } from "@/app/actions/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/pagination-custom";

interface ProdukPageProps {
    searchParams: Promise<{
        page?: string;
        categoryId?: string;
        sortBy?: string;
        search?: string;
    }>;
}

export const dynamic = "force-dynamic";

export default async function ProdukPage({ searchParams }: ProdukPageProps) {
    // Await searchParams (required in Next.js 15)
    const params = await searchParams;

    console.log("ProductPage Params:", params);

    // Parse params
    const page = Number(params.page) || 1;
    const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
    const sortBy = (params.sortBy as SortOption) || "newest";
    const search = params.search || "";

    console.log("Parsed Params:", { page, categoryId, sortBy, search });

    // Fetch data
    const [productsData, categories] = await Promise.all([
        getProducts({
            page,
            limit: 12,
            categoryId,
            sortBy,
            search,
        }),
        getAllCategories(),
    ]);

    const { products, totalPages, currentPage } = productsData;

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-zinc-900">Katalog Gitar</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Temukan instrumen impian Anda dari koleksi terbaik kami.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters & Sort */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="text-sm text-gray-500">
                        Menampilkan <span className="font-bold text-zinc-900">{products.length}</span> produk
                        {search && <span> untuk pencarian "{search}"</span>}
                    </div>

                    <Suspense fallback={<div className="h-10 w-[380px] bg-gray-100 rounded-lg animate-pulse" />}>
                        <ProductFilters categories={categories} />
                    </Suspense>
                </div>

                {/* Product Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-medium text-gray-900">Produk tidak ditemukan</h3>
                        <p className="mt-1 text-gray-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-12 flex justify-center">
                    <Suspense fallback={<div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse" />}>
                        <Pagination currentPage={currentPage} totalPages={totalPages} />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}

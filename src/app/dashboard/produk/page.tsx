import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProducts, getCategoriesForDropdown } from "@/app/actions/product";
import { ProductTable } from "@/components/dashboard/ProductTable";
import { ProductActions } from "@/components/dashboard/ProductActions";
import { ProductFiltersAdmin } from "@/components/dashboard/ProductFiltersAdmin";

export const metadata = {
    title: "Kelola Produk - Gitarin Admin",
};

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        category?: string;
    }>;
}

export default async function KelolaProdukPage({ searchParams }: PageProps) {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const categoryId = params.category ? parseInt(params.category) : undefined;

    const [productsResult, categoriesResult] = await Promise.all([
        getProducts({ page, limit: 10, search, categoryId }),
        getCategoriesForDropdown()
    ]);

    const products = productsResult.success ? productsResult.products : [];
    const pagination = productsResult.success ? productsResult.pagination : null;
    const categories = categoriesResult.success ? categoriesResult.categories : [];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Kelola Produk</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola katalog produk toko Anda.</p>
                </div>
                <ProductActions categories={categories || []} />
            </div>

            {/* Search & Filters */}
            <ProductFiltersAdmin categories={categories || []} />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <ProductTable 
                    products={products || []} 
                    categories={categories || []}
                    pagination={pagination || null}
                />
            </div>
        </div>
    );
}

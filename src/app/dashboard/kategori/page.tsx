import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategories } from "@/app/actions/category";
import { CategoryTable } from "@/components/dashboard/CategoryTable";
import { CategoryActions } from "@/components/dashboard/CategoryActions";

export const metadata = {
    title: "Kelola Kategori - Gitarin Admin",
};

export default async function KelolaKategoriPage() {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/login");
    }

    const result = await getCategories();
    const categories = result.success ? result.categories : [];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Kelola Kategori</h1>
                    <p className="text-sm text-gray-500 mt-1">Atur kategori alat musik untuk etalase toko.</p>
                </div>
                <CategoryActions />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <CategoryTable categories={categories || []} />
            </div>
        </div>
    );
}

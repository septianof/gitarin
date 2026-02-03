"use client";

import { useState } from "react";
import { Pencil, Trash2, ImageIcon } from "lucide-react";
import { UploadedImage } from "@/components/ui/uploaded-image";
import { deleteCategory } from "@/app/actions/category";
import { CategoryFormModal } from "./CategoryFormModal";
import { toast } from "sonner";

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
}

interface CategoryTableProps {
    categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteCategory(deleteId);
            if (result.success) {
                toast.success("Kategori berhasil dihapus");
                setDeleteId(null);
            } else {
                toast.error(result.error || "Gagal menghapus kategori");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsDeleting(false);
        }
    };

    if (categories.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">Belum ada kategori</h3>
                <p className="text-sm text-gray-500">Tambahkan kategori pertama Anda</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-wider">No</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Gambar</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Nama Kategori</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.map((category, index) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="size-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                                        <UploadedImage
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                            fallback={
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon size={20} className="text-gray-400" />
                                                </div>
                                            }
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-zinc-900">{category.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setEditCategory(category)}
                                            className="p-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(category.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <CategoryFormModal
                isOpen={!!editCategory}
                onClose={() => setEditCategory(null)}
                mode="edit"
                category={editCategory || undefined}
            />

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="size-16 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">Hapus Kategori?</h3>
                                <p className="text-gray-500 text-sm">
                                    Kategori yang dihapus tidak dapat dikembalikan. Pastikan kategori tidak memiliki produk.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-zinc-900 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

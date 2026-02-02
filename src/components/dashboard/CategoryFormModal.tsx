"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { createCategory, updateCategory } from "@/app/actions/category";
import { toast } from "sonner";

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
}

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    category?: Category;
}

export function CategoryFormModal({ isOpen, onClose, mode, category }: CategoryFormModalProps) {
    const [name, setName] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            setName(category?.name || "");
            setImagePreview(category?.image || null);
            setImageFile(null);
            setRemoveImage(false);
        }
    }, [isOpen, category]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ukuran gambar maksimal 2MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            if (imageFile) {
                formData.append("image", imageFile);
            }
            if (removeImage) {
                formData.append("removeImage", "true");
            }

            let result;
            if (mode === "create") {
                result = await createCategory(formData);
            } else if (category) {
                result = await updateCategory(category.id, formData);
            }

            if (result?.success) {
                toast.success(mode === "create" ? "Kategori berhasil ditambahkan" : "Kategori berhasil diupdate");
                handleClose();
            } else {
                toast.error(result?.error || "Terjadi kesalahan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName("");
        setImagePreview(null);
        setImageFile(null);
        setRemoveImage(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-zinc-900">
                        {mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 mb-2">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Gitar Akustik"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 mb-2">
                            Gambar Kategori
                        </label>
                        
                        {imagePreview ? (
                            <div className="relative">
                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-400 hover:bg-gray-50 transition-all"
                            >
                                <div className="size-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Upload size={24} className="text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">Klik untuk upload gambar</p>
                                <p className="text-xs text-gray-400">PNG, JPG (max. 2MB)</p>
                            </div>
                        )}
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border border-gray-200 text-zinc-900 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {mode === "create" ? "Menambahkan..." : "Menyimpan..."}
                                </>
                            ) : (
                                mode === "create" ? "Tambah Kategori" : "Simpan Perubahan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

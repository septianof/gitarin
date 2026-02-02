"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct, updateProduct } from "@/app/actions/product";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    weight: number;
    image: string | null;
    categoryId: number;
}

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    product?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, categories, product }: ProductFormModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [weight, setWeight] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    // Reset form when modal opens/closes or product changes
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setName(product.name);
                setDescription(product.description || "");
                setPrice(product.price.toString());
                setStock(product.stock.toString());
                setWeight(product.weight.toString());
                setCategoryId(product.categoryId.toString());
                setImagePreview(product.image);
            } else {
                setName("");
                setDescription("");
                setPrice("");
                setStock("");
                setWeight("");
                setCategoryId(categories.length > 0 ? categories[0].id.toString() : "");
                setImagePreview(null);
            }
            setImageFile(null);
            setRemoveImage(false);
            setError(null);
        }
    }, [isOpen, product, categories]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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
        setError(null);

        // Validation
        if (!name.trim()) {
            setError("Nama produk wajib diisi");
            return;
        }
        if (!categoryId) {
            setError("Kategori wajib dipilih");
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            setError("Harga harus lebih dari 0");
            return;
        }
        if (!stock || parseInt(stock) < 0) {
            setError("Stok tidak boleh negatif");
            return;
        }
        if (!weight || parseInt(weight) <= 0) {
            setError("Berat harus lebih dari 0");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("description", description.trim());
        formData.append("price", price);
        formData.append("stock", stock);
        formData.append("weight", weight);
        formData.append("categoryId", categoryId);
        
        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (removeImage) {
            formData.append("removeImage", "true");
        }

        startTransition(async () => {
            const result = product 
                ? await updateProduct(product.id, formData)
                : await createProduct(formData);

            if (result.success) {
                router.refresh();
                onClose();
            } else {
                setError(result.error || "Terjadi kesalahan");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        {product ? "Edit Produk" : "Tambah Produk Baru"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700">
                            Foto Produk
                        </Label>
                        <div className="mt-2 flex items-start gap-4">
                            <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                {imagePreview ? (
                                    <>
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                        <span className="text-xs text-gray-500 mt-1 block">
                                            Upload
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="product-image"
                                />
                                <label
                                    htmlFor="product-image"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Pilih Gambar
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    Format: JPG, PNG. Maks 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nama Produk <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Gitar Yamaha F310"
                            className="mt-1"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                            Kategori <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Deskripsi
                        </Label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Deskripsi produk..."
                            rows={4}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Price, Stock, Weight - Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                                Harga (Rp) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="mt-1"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                                Stok <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="mt-1"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                                Berat (gram) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="weight"
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="mt-1"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-zinc-900 hover:bg-zinc-800 text-white"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                product ? "Simpan Perubahan" : "Tambah Produk"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

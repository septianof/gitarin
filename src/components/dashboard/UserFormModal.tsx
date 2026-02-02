"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Upload, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser, updateUser } from "@/app/actions/users";

interface Role {
    value: string;
    label: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    photo: string | null;
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles: Role[];
    user?: User | null;
}

export function UserFormModal({ isOpen, onClose, roles, user }: UserFormModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("CUSTOMER");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (isOpen) {
            if (user) {
                setName(user.name || "");
                setEmail(user.email);
                setRole(user.role);
                setImagePreview(user.photo);
                setPassword(""); // Don't show existing password
            } else {
                setName("");
                setEmail("");
                setRole("CUSTOMER");
                setPassword("");
                setImagePreview(null);
            }
            setImageFile(null);
            setRemoveImage(false);
            setShowPassword(false);
            setError(null);
        }
    }, [isOpen, user]);

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
            setError("Nama wajib diisi");
            return;
        }
        if (!email.trim()) {
            setError("Email wajib diisi");
            return;
        }
        // Password required for new user
        if (!user && (!password || password.length < 6)) {
            setError("Password minimal 6 karakter");
            return;
        }
        // If editing and password provided, validate length
        if (user && password && password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("role", role);
        
        if (password) {
            formData.append("password", password);
        }
        
        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (removeImage) {
            formData.append("removeImage", "true");
        }

        startTransition(async () => {
            const result = user 
                ? await updateUser(user.id, formData)
                : await createUser(formData);

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
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        {user ? "Edit Pengguna" : "Tambah Pengguna Baru"}
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
                            Foto Profil
                        </Label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
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
                                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <Upload className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="user-image"
                                />
                                <label
                                    htmlFor="user-image"
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Pilih Gambar
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nama <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama lengkap"
                            className="mt-1"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="mt-1"
                            required
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                            Role <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            required
                        >
                            {roles.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password {!user && <span className="text-red-500">*</span>}
                            {user && <span className="text-gray-400 text-xs ml-1">(kosongkan jika tidak ingin mengubah)</span>}
                        </Label>
                        <div className="relative mt-1">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={user ? "••••••••" : "Minimal 6 karakter"}
                                className="pr-10"
                                required={!user}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                                user ? "Simpan Perubahan" : "Tambah Pengguna"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

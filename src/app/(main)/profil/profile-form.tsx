"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/app/actions/user";
import { User as UserIcon, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
    user: {
        name: string;
        email: string;
        photo?: string | null;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(user.photo || null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 2MB");
                return;
            }
            const objectUrl = URL.createObjectURL(file);
            setPhotoPreview(objectUrl);
            // Clean up memory when component unmounts or changes
            // This cleanup should ideally be in a useEffect with photoPreview as a dependency
            // or when the component unmounts. For a simple onChange, it's often managed
            // by the browser's garbage collection or explicit cleanup in a useEffect.
            // For now, we'll keep it as per the instruction.
            // return () => URL.revokeObjectURL(objectUrl); 
        } else {
            setPhotoPreview(user.photo || null); // Revert to original if no file selected
        }
    };

    const { update } = useSession(); // Get update function from session hook
    const [handleUpdate, setHandleUpdate] = useState(false); // Force re-render trigger if needed

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const newPassword = formData.get("newPassword") as string;
        const currentPassword = formData.get("currentPassword") as string;
        const name = formData.get("name") as string;

        try {
            // 1. Update Profile (Name & Photo)
            const profileRes = await updateProfile(null, formData);

            if (!profileRes.success) {
                toast.error(profileRes.error || "Gagal memperbarui profil");
                setIsLoading(false);
                return;
            }

            // Update Session on Client side to reflect changes in Navbar immediately
            // We pass the new data to optimize the update without fetch, or just call update() to refetch
            if (profileRes.user) {
                await update({
                    name: profileRes.user.name,
                    photo: profileRes.user.photo
                });
            } else {
                // Fallback if no user data returned (shouldn't happen with new backend)
                await update();
            }

            // Force a router refresh to be safe for server components
            // router.refresh(); // Not imported yet, but update() should handle client side session

            // 2. Update Password (if provided)
            if (newPassword || currentPassword) {
                const passwordRes = await changePassword(null, formData);

                if (!passwordRes.success) {
                    toast.error(passwordRes.error || "Gagal mengubah password");
                    setIsLoading(false);
                    return;
                }
            }

            toast.success("Perubahan berhasil disimpan");

            // Reset password fields
            const form = event.target as HTMLFormElement;
            const passInputs = form.querySelectorAll('input[type="password"]');
            passInputs.forEach((input) => ((input as HTMLInputElement).value = ""));

        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-[#f0f2f4] shadow-sm p-6 md:p-10">
            {/* Page Heading */}
            <div className="mb-8 pb-6 border-b border-[#f0f2f4]">
                <h2 className="text-[#111417] text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
                    Informasi Akun
                </h2>
                <p className="text-[#647587] text-base font-normal">
                    Kelola profil dan keamanan akun Anda.
                </p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Profile Photo Section (Inside Form to capture formData) */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-2">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-24 sm:size-32 border-2 border-gray-100 shadow-sm bg-gray-100 flex items-center justify-center relative overflow-hidden"
                        style={{
                            backgroundImage: photoPreview ? `url("${photoPreview}")` : undefined,
                        }}
                    >
                        {!photoPreview && <UserIcon className="size-12 text-gray-400" />}
                    </div>
                    <div className="flex flex-col gap-3 items-center sm:items-start pt-2">
                        <div>
                            <h3 className="text-[#111417] text-lg font-bold leading-tight">
                                Foto Profil
                            </h3>
                            <p className="text-[#647587] text-sm mt-1">
                                Format: JPG, GIF atau PNG. Maks 2MB.
                            </p>
                        </div>
                        <label className="flex items-center justify-center h-9 px-4 rounded-lg border border-[#dce0e5] bg-white text-[#111417] text-sm font-bold hover:bg-[#f0f2f4] transition-colors cursor-pointer">
                            <span>Ubah Foto</span>
                            <input
                                type="file"
                                name="photo"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </label>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="flex flex-col gap-5">
                    <label className="flex flex-col w-full">
                        <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                            Nama Lengkap
                        </p>
                        <Input
                            name="name"
                            defaultValue={user.name}
                            className="bg-white h-12 text-base border-gray-300 focus-visible:ring-black"
                            type="text"
                            required
                        />
                    </label>
                    <label className="flex flex-col w-full">
                        <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                            Email
                        </p>
                        <Input
                            defaultValue={user.email}
                            disabled
                            className="bg-gray-100 h-12 text-base border-gray-200 text-gray-500 cursor-not-allowed"
                            type="email"
                        />
                        <span className="text-xs text-[#647587] mt-1.5 ml-1">
                            Email tidak dapat diubah.
                        </span>
                    </label>
                </div>

                <div className="h-px bg-[#f0f2f4] w-full"></div>

                {/* Password Section */}
                <div className="flex flex-col gap-5">
                    <h3 className="text-[#111417] text-lg font-bold">Ubah Password</h3>
                    <label className="flex flex-col w-full">
                        <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                            Password Lama
                        </p>
                        <div className="relative">
                            <Input
                                name="currentPassword"
                                className="bg-white h-12 text-base border-gray-300 focus-visible:ring-black"
                                placeholder="••••••••"
                                type="password"
                            />
                        </div>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="flex flex-col w-full">
                            <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                                Password Baru
                            </p>
                            <Input
                                name="newPassword"
                                className="bg-white h-12 text-base border-gray-300 focus-visible:ring-black"
                                type="password"
                            />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                                Konfirmasi Password Baru
                            </p>
                            <Input
                                name="confirmPassword"
                                className="bg-white h-12 text-base border-gray-300 focus-visible:ring-black"
                                type="password"
                            />
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 mt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center h-12 px-8 rounded-lg bg-[#111417] text-white text-base font-bold hover:bg-black/80 transition-all shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
}

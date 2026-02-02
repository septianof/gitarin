"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/app/actions/user";
import { User as UserIcon, Camera } from "lucide-react";

interface ProfileFormProps {
    user: {
        name: string;
        email: string;
        photo?: string | null;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const newPassword = formData.get("newPassword") as string;
        const currentPassword = formData.get("currentPassword") as string;

        try {
            // 1. Update Profile (Name)
            // Always run this as name might have changed
            const profileRes = await updateProfile(null, formData);

            if (!profileRes.success) {
                toast.error(profileRes.error || "Gagal memperbarui profil");
                setIsLoading(false);
                return;
            }

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

            {/* Profile Photo Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
                <div
                    className="bg-center bg-no-repeat bg-cover rounded-full size-24 sm:size-32 border-2 border-gray-100 shadow-sm bg-gray-100 flex items-center justify-center"
                    style={{
                        backgroundImage: user.photo ? `url("${user.photo}")` : undefined,
                    }}
                >
                    {!user.photo && <UserIcon className="size-12 text-gray-400" />}
                </div>
                <div className="flex flex-col gap-3 items-center sm:items-start pt-2">
                    <div>
                        <h3 className="text-[#111417] text-lg font-bold leading-tight">
                            Foto Profil
                        </h3>
                        <p className="text-[#647587] text-sm mt-1">
                            Format: JPG, GIF atau PNG. Maks 800K.
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="flex items-center justify-center h-9 px-4 rounded-lg border border-[#dce0e5] bg-white text-[#111417] text-sm font-bold hover:bg-[#f0f2f4] transition-colors opacity-50 cursor-not-allowed"
                        title="Fitur upload foto belum tersedia"
                    >
                        Ubah Foto
                    </button>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Personal Info */}
                <div className="flex flex-col gap-5">
                    <label className="flex flex-col w-full">
                        <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                            Nama Lengkap
                        </p>
                        <input
                            name="name"
                            defaultValue={user.name}
                            className="flex w-full rounded-lg text-[#111417] focus:ring-2 focus:ring-black focus:border-black border-[#dce0e5] bg-white h-12 px-4 text-base placeholder:text-[#9aa2ac]"
                            type="text"
                            required
                        />
                    </label>
                    <label className="flex flex-col w-full">
                        <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                            Email
                        </p>
                        <input
                            defaultValue={user.email}
                            disabled
                            className="flex w-full rounded-lg text-[#647587] border-[#f0f2f4] bg-[#f8f9fa] h-12 px-4 text-base cursor-not-allowed"
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
                            <input
                                name="currentPassword"
                                className="flex w-full rounded-lg text-[#111417] focus:ring-2 focus:ring-black focus:border-black border-[#dce0e5] bg-white h-12 px-4 text-base placeholder:text-[#9aa2ac]"
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
                            <input
                                name="newPassword"
                                className="flex w-full rounded-lg text-[#111417] focus:ring-2 focus:ring-black focus:border-black border-[#dce0e5] bg-white h-12 px-4 text-base placeholder:text-[#9aa2ac]"
                                type="password"
                            />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-[#111417] text-sm font-bold leading-normal pb-2">
                                Konfirmasi Password Baru
                            </p>
                            <input
                                name="confirmPassword"
                                className="flex w-full rounded-lg text-[#111417] focus:ring-2 focus:ring-black focus:border-black border-[#dce0e5] bg-white h-12 px-4 text-base placeholder:text-[#9aa2ac]"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Music, User, Mail, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await register(formData);

        if (!result.success) {
            toast.error(result.error || "Terjadi kesalahan");
            setIsLoading(false);
            return;
        }

        // Success - show toast and redirect to login
        toast.success("Registrasi berhasil! Silakan login.");
        router.push("/login");
    };

    return (
        <div className="w-full max-w-[480px] mx-auto flex flex-col gap-8 animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 text-white">
                    <Music className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Gitarin</h1>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-zinc-900">
                    Buat Akun Baru
                </h2>
                <p className="text-gray-500 text-base">
                    Lengkapi data diri Anda untuk memulai perjalanan musik bersama Gitarin.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Name Field */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-zinc-900">
                        Nama Lengkap
                    </Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <User className="w-5 h-5" />
                        </div>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={formData.name}
                            onChange={handleChange}
                            className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-zinc-900">
                        Email
                    </Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Masukkan alamat email Anda"
                            value={formData.email}
                            onChange={handleChange}
                            className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-zinc-900">
                        Password
                    </Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Buat password (min. 8 karakter, huruf & angka)"
                            value={formData.password}
                            onChange={handleChange}
                            className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-zinc-900">
                        Konfirmasi Password
                    </Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Ulangi password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base tracking-wide"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Memproses...
                            </>
                        ) : (
                            "Daftar"
                        )}
                    </Button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-gray-500 text-sm">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="text-zinc-900 font-bold hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>

                {/* Terms */}
                <p className="text-gray-400 text-xs text-center mt-4">
                    Dengan mendaftar, Anda menyetujui{" "}
                    <span className="underline cursor-pointer">Syarat & Ketentuan</span> serta{" "}
                    <span className="underline cursor-pointer">Kebijakan Privasi</span> Gitarin.
                </p>
            </form>
        </div>
    );
}

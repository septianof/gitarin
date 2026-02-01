"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Music, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            // Fetch session to get role for redirect
            const response = await fetch("/api/auth/session");
            const session = await response.json();

            if (session?.user?.role) {
                switch (session.user.role) {
                    case "ADMIN":
                    case "GUDANG":
                        router.push("/dashboard");
                        break;
                    default:
                        router.push("/");
                }
            } else {
                router.push("/");
            }

            toast.success("Login berhasil! Selamat datang kembali.");
            router.refresh();
        } catch {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[480px] mx-auto flex flex-col gap-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 text-white">
                    <Music className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Gitarin</h1>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900">
                    Selamat Datang Kembali
                </h2>
                <p className="text-gray-500 text-base">
                    Masuk untuk melanjutkan perjalanan musikmu.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-zinc-900">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 px-4 border-gray-300 focus:border-zinc-900 focus:ring-zinc-900/20"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-sm font-semibold text-zinc-900">
                            Password
                        </Label>
                        {/* Lupa Password - disabled for now */}
                        <span className="text-sm text-gray-400 cursor-not-allowed">
                            Lupa Password?
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 px-4 pr-12 border-gray-300 focus:border-zinc-900 focus:ring-zinc-900/20"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-zinc-900 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base tracking-wide shadow-md"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Memproses...
                        </>
                    ) : (
                        "Masuk"
                    )}
                </Button>

                <div className="flex justify-center gap-1 mt-2">
                    <p className="text-gray-600 text-sm">Belum punya akun?</p>
                    <Link
                        href="/register"
                        className="text-sm font-bold text-zinc-900 hover:underline decoration-2 underline-offset-4"
                    >
                        Daftar Sekarang
                    </Link>
                </div>
            </form>
        </div>
    );
}

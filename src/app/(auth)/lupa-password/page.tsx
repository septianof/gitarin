"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Music, Mail, Lock, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestOTP, verifyOTP, resetPassword } from "@/app/actions/password-reset";

type Step = "email" | "otp" | "reset";

const COOLDOWN_SECONDS = 120; // 2 minutes

export default function LupaPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Format cooldown display
    const formatCooldown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Step 1: Request OTP
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await requestOTP(email);

        if (!result.success) {
            toast.error(result.error || "Gagal mengirim OTP");
            setIsLoading(false);
            return;
        }

        toast.success("Kode OTP telah dikirim ke email Anda");
        setCooldown(COOLDOWN_SECONDS);
        setStep("otp");
        setIsLoading(false);
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (cooldown > 0) return;

        setIsLoading(true);
        const result = await requestOTP(email);

        if (!result.success) {
            toast.error(result.error || "Gagal mengirim ulang OTP");
            setIsLoading(false);
            return;
        }

        toast.success("Kode OTP baru telah dikirim");
        setCooldown(COOLDOWN_SECONDS);
        setOtp(["", "", "", "", "", ""]);
        setIsLoading(false);
    };

    // OTP input handling
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        pastedData.split("").forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        if (pastedData.length === 6) {
            otpRefs.current[5]?.focus();
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            toast.error("Masukkan 6 digit kode OTP");
            return;
        }

        setIsLoading(true);
        const result = await verifyOTP(email, otpString);

        if (!result.success) {
            toast.error(result.error || "Kode OTP tidak valid");
            setIsLoading(false);
            return;
        }

        toast.success("Kode OTP terverifikasi");
        setStep("reset");
        setIsLoading(false);
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await resetPassword(email, otp.join(""), newPassword, confirmPassword);

        if (!result.success) {
            toast.error(result.error || "Gagal mereset password");
            setIsLoading(false);
            return;
        }

        toast.success("Password berhasil direset! Silakan login.");
        router.push("/login");
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

            {/* Step 1: Email */}
            {step === "email" && (
                <>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900">
                            Lupa Password
                        </h2>
                        <p className="text-gray-500 text-base">
                            Masukkan email yang terdaftar pada akun Anda untuk menerima kode OTP pemulihan.
                        </p>
                    </div>

                    <form onSubmit={handleRequestOTP} className="flex flex-col gap-5">
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
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Mengirim...
                                </>
                            ) : (
                                "Kirim OTP"
                            )}
                        </Button>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-zinc-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Login
                        </Link>
                    </form>
                </>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
                <>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900">
                            Verifikasi OTP
                        </h2>
                        <p className="text-gray-500 text-base">
                            Masukkan 6 digit kode yang dikirim ke email Anda untuk melanjutkan proses pemulihan kata sandi.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                        <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none transition-all"
                                    disabled={isLoading}
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Memverifikasi...
                                </>
                            ) : (
                                "Verifikasi"
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-500">Belum menerima kode? </span>
                            {cooldown > 0 ? (
                                <span className="text-gray-400">
                                    Kirim ulang kode ({formatCooldown(cooldown)})
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isLoading}
                                    className="text-zinc-900 font-semibold underline hover:no-underline disabled:opacity-50"
                                >
                                    Kirim ulang kode
                                </button>
                            )}
                        </div>
                    </form>
                </>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
                <>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900">
                            Atur Ulang Password
                        </h2>
                        <p className="text-gray-500 text-base">
                            Silakan masukkan password baru Anda yang aman. Gunakan kombinasi huruf dan angka.
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="newPassword" className="text-sm font-semibold text-zinc-900">
                                Password Baru
                            </Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Masukkan password baru"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-zinc-900">
                                Konfirmasi Password Baru
                            </Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Ulangi password baru"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-12 pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-zinc-900/20"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Password"
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-500">Kembali ke halaman </span>
                            <Link href="/login" className="text-zinc-900 font-semibold">
                                Masuk
                            </Link>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

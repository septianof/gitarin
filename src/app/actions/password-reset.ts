"use server";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import bcrypt from "bcryptjs";

// Config
const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_HOURS = 1;
const OTP_LENGTH = 6;

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check rate limit (5 requests per hour)
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remainingTime?: number }> {
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);

    const recentRequests = await prisma.passwordReset.count({
        where: {
            userId,
            createdAt: { gte: oneHourAgo },
        },
    });

    if (recentRequests >= RATE_LIMIT_REQUESTS) {
        // Find the oldest request in the window to calculate remaining time
        const oldestRequest = await prisma.passwordReset.findFirst({
            where: {
                userId,
                createdAt: { gte: oneHourAgo },
            },
            orderBy: { createdAt: "asc" },
        });

        if (oldestRequest) {
            const unlockTime = oldestRequest.createdAt.getTime() + RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000;
            const remainingTime = Math.ceil((unlockTime - Date.now()) / 60000); // in minutes
            return { allowed: false, remainingTime };
        }
    }

    return { allowed: true };
}

interface RequestOTPResult {
    success: boolean;
    error?: string;
    rateLimitedMinutes?: number;
}

export async function requestOTP(email: string): Promise<RequestOTPResult> {
    try {
        // Validate email
        if (!email || !email.includes("@")) {
            return { success: false, error: "Email tidak valid" };
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            // Don't reveal if email exists
            return { success: false, error: "Email tidak terdaftar" };
        }

        if (user.deletedAt) {
            return { success: false, error: "Akun tidak aktif" };
        }

        // Check rate limit
        const rateLimitCheck = await checkRateLimit(user.id);
        if (!rateLimitCheck.allowed) {
            return {
                success: false,
                error: `Terlalu banyak permintaan. Coba lagi dalam ${rateLimitCheck.remainingTime} menit.`,
                rateLimitedMinutes: rateLimitCheck.remainingTime,
            };
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Save to database
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                otp,
                expiresAt,
            },
        });

        // Send email
        const { error: emailError } = await resend.emails.send({
            from: "Gitarin <noreply@resend.dev>",
            to: email,
            subject: "Kode OTP Reset Password - Gitarin",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #18181b;">Reset Password Gitarin</h2>
          <p>Halo ${user.name},</p>
          <p>Gunakan kode OTP berikut untuk mereset password Anda:</p>
          <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${otp}</span>
          </div>
          <p style="color: #71717a; font-size: 14px;">Kode ini berlaku selama ${OTP_EXPIRY_MINUTES} menit.</p>
          <p style="color: #71717a; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;">
          <p style="color: #a1a1aa; font-size: 12px;">Tim Gitarin</p>
        </div>
      `,
        });

        if (emailError) {
            console.error("Email error:", emailError);
            return { success: false, error: "Gagal mengirim email. Coba lagi." };
        }

        return { success: true };
    } catch (error) {
        console.error("Request OTP error:", error);
        return { success: false, error: "Terjadi kesalahan. Silakan coba lagi." };
    }
}

interface VerifyOTPResult {
    success: boolean;
    error?: string;
}

export async function verifyOTP(email: string, otp: string): Promise<VerifyOTPResult> {
    try {
        if (!email || !otp || otp.length !== OTP_LENGTH) {
            return { success: false, error: "Kode OTP tidak valid" };
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return { success: false, error: "Email tidak valid" };
        }

        // Find valid OTP
        const passwordReset = await prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                otp,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!passwordReset) {
            return { success: false, error: "Kode OTP salah atau sudah kadaluarsa" };
        }

        return { success: true };
    } catch (error) {
        console.error("Verify OTP error:", error);
        return { success: false, error: "Terjadi kesalahan. Silakan coba lagi." };
    }
}

interface ResetPasswordResult {
    success: boolean;
    error?: string;
}

export async function resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
): Promise<ResetPasswordResult> {
    try {
        // Validate passwords
        if (!newPassword || newPassword.length < 8) {
            return { success: false, error: "Password minimal 8 karakter" };
        }

        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        if (!hasLetter || !hasNumber) {
            return { success: false, error: "Password harus mengandung huruf dan angka" };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, error: "Konfirmasi password tidak cocok" };
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return { success: false, error: "Email tidak valid" };
        }

        // Verify OTP again
        const passwordReset = await prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                otp,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!passwordReset) {
            return { success: false, error: "Sesi tidak valid. Ulangi proses reset password." };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and mark OTP as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            prisma.passwordReset.update({
                where: { id: passwordReset.id },
                data: { isUsed: true },
            }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("Reset password error:", error);
        return { success: false, error: "Terjadi kesalahan. Silakan coba lagi." };
    }
}

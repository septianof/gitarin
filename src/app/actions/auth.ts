"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface RegisterResult {
    success: boolean;
    error?: string;
}

// Password validation: min 8 chars, must contain letter and number
function validatePassword(password: string): string | null {
    if (password.length < 8) {
        return "Password minimal 8 karakter";
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
        return "Password harus mengandung huruf dan angka";
    }

    return null;
}

export async function register(data: RegisterData): Promise<RegisterResult> {
    try {
        const { name, email, password, confirmPassword } = data;

        // Validate required fields
        if (!name || !email || !password || !confirmPassword) {
            return { success: false, error: "Semua field harus diisi" };
        }

        // Validate name
        if (name.trim().length < 2) {
            return { success: false, error: "Nama minimal 2 karakter" };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: "Format email tidak valid" };
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return { success: false, error: "Email sudah terdaftar" };
        }

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            return { success: false, error: passwordError };
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return { success: false, error: "Konfirmasi password tidak cocok" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
                role: "CUSTOMER", // Default role for registration
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Terjadi kesalahan. Silakan coba lagi." };
    }
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

interface UpdateProfileState {
    success?: boolean;
    error?: string;
    message?: string;
}

export async function updateProfile(prevState: any, formData: FormData): Promise<UpdateProfileState> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Anda harus login terlebih dahulu" };
        }

        const name = formData.get("name") as string;

        // Validasi sederhana
        if (!name || name.trim().length < 2) {
            return { success: false, error: "Nama minimal 2 karakter" };
        }

        // TODO: Implement Photo Upload (requires storage service or local file handling)
        // const photo = formData.get("photo"); 

        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: name.trim() },
        });

        revalidatePath("/profil");
        return { success: true, message: "Profil berhasil diperbarui" };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Gagal memperbarui profil" };
    }
}

export async function changePassword(prevState: any, formData: FormData): Promise<UpdateProfileState> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Anda harus login terlebih dahulu" };
        }

        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return { success: false, error: "Semua kolom password harus diisi" };
        }

        if (newPassword.length < 8) {
            return { success: false, error: "Password baru minimal 8 karakter" };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, error: "Konfirmasi password baru tidak cocok" };
        }

        // Verify current password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return { success: false, error: "User tidak ditemukan" };
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return { success: false, error: "Password lama salah" };
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        revalidatePath("/profil");
        return { success: true, message: "Password berhasil diubah" };

    } catch (error) {
        console.error("Change password error:", error);
        return { success: false, error: "Gagal mengubah password" };
    }
}

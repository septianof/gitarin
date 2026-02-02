"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

interface UpdateProfileState {
    success?: boolean;
    error?: string;
    message?: string;
    user?: {
        name: string;
        photo: string | null;
    };
}

export async function updateProfile(prevState: any, formData: FormData): Promise<UpdateProfileState> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Anda harus login terlebih dahulu" };
        }

        const name = formData.get("name") as string;
        const photoFile = formData.get("photo") as File | null;

        // Validasi sederhana
        if (!name || name.trim().length < 2) {
            return { success: false, error: "Nama minimal 2 karakter" };
        }

        let photoPath = undefined;

        // Handle Photo Upload
        if (photoFile && photoFile.size > 0) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(photoFile.type)) {
                return { success: false, error: "Format file tidak didukung (gunakan JPG, PNG, GIF, atau WEBP)" };
            }

            // Validate file size (max 2MB)
            if (photoFile.size > 2 * 1024 * 1024) {
                return { success: false, error: "Ukuran file maksimal 2MB" };
            }

            try {
                const buffer = Buffer.from(await photoFile.arrayBuffer());
                const timestamp = Date.now();
                // Clean filename
                const cleanName = photoFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                const filename = `user-${session.user.id}-${timestamp}-${cleanName}`;
                const uploadDir = path.join(process.cwd(), "public/uploads/users");

                // Ensure directory exists (redundant safety)
                await fs.mkdir(uploadDir, { recursive: true });

                // Delete old photo if exists and is local
                const currentUser = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { photo: true }
                });

                if (currentUser?.photo && currentUser.photo.startsWith("/uploads/users/")) {
                    const oldFilename = currentUser.photo.split("/").pop();
                    if (oldFilename) {
                        const oldFilePath = path.join(uploadDir, oldFilename);
                        try {
                            await fs.unlink(oldFilePath);
                        } catch (unlinkError) {
                            console.warn("Failed to delete old photo:", unlinkError);
                            // Continue execution even if delete fails
                        }
                    }
                }

                const filepath = path.join(uploadDir, filename);
                await fs.writeFile(filepath, buffer);

                // Set public path for database
                photoPath = `/uploads/users/${filename}`;
            } catch (err) {
                console.error("File save error:", err);
                return { success: false, error: "Gagal menyimpan foto profil" };
            }
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name.trim(),
                ...(photoPath && { photo: photoPath })
            },
        });

        // We need to fetch the existing photo if it wasn't updated, or use the new one
        // Since we don't have the old one here easily without fetching, let's fetch the updated user to be safe and accurate
        const updatedUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, photo: true }
        });

        revalidatePath("/profil");

        return {
            success: true,
            message: "Profil berhasil diperbarui",
            user: {
                name: updatedUser?.name || name,
                photo: updatedUser?.photo || null
            }
        };
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

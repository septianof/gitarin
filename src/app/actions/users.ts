"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

// Ensure user directory exists
const USERS_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "users");

async function ensureUploadDir() {
    try {
        await fs.access(USERS_UPLOAD_DIR);
    } catch {
        await fs.mkdir(USERS_UPLOAD_DIR, { recursive: true });
    }
}

async function saveImage(file: File): Promise<string> {
    await ensureUploadDir();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `user-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(USERS_UPLOAD_DIR, filename);
    
    await fs.writeFile(filepath, buffer);
    return `/uploads/users/${filename}`;
}

async function deleteImage(imagePath: string) {
    if (!imagePath || !imagePath.startsWith('/uploads/users/')) return;
    
    try {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        await fs.unlink(fullPath);
    } catch (error) {
        console.error('Failed to delete image:', error);
    }
}

// Check if current user is admin
async function isAdmin() {
    const session = await auth();
    if (!session?.user?.id) return false;
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });
    
    return user?.role === "ADMIN";
}

// Valid roles
const VALID_ROLES: Role[] = ["CUSTOMER", "GUDANG", "ADMIN"];

// Get all users with pagination
export async function getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
}) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    try {
        // Build where clause dynamically
        const whereConditions: Prisma.UserWhereInput = {
            deletedAt: null,
        };

        if (search) {
            whereConditions.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role && VALID_ROLES.includes(role as Role)) {
            whereConditions.role = role as Role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereConditions,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    photo: true,
                    createdAt: true,
                    _count: {
                        select: {
                            orders: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.user.count({ where: whereConditions }),
        ]);

        return {
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Gagal mengambil data pengguna" };
    }
}

// Get single user
export async function getUser(id: string) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photo: true,
                createdAt: true,
            },
        });

        if (!user) {
            return { success: false, error: "Pengguna tidak ditemukan" };
        }

        return { success: true, user };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: "Gagal mengambil data pengguna" };
    }
}

// Create new user (admin only)
export async function createUser(formData: FormData) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;
    const imageFile = formData.get("image") as File | null;

    // Validation
    if (!name?.trim()) {
        return { success: false, error: "Nama wajib diisi" };
    }
    if (!email?.trim()) {
        return { success: false, error: "Email wajib diisi" };
    }
    if (!password || password.length < 6) {
        return { success: false, error: "Password minimal 6 karakter" };
    }
    if (!VALID_ROLES.includes(role as Role)) {
        return { success: false, error: "Role tidak valid" };
    }

    try {
        // Check if email exists
        const existingUser = await prisma.user.findFirst({
            where: { email, deletedAt: null }
        });

        if (existingUser) {
            return { success: false, error: "Email sudah digunakan" };
        }

        // Hash password
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle image upload
        let imagePath: string | null = null;
        if (imageFile && imageFile.size > 0) {
            imagePath = await saveImage(imageFile);
        }

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role: role as Role,
                password: hashedPassword,
                photo: imagePath,
            },
        });

        revalidatePath("/dashboard/users");
        return { success: true, user: { id: user.id } };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Gagal membuat pengguna" };
    }
}

// Update user (admin only)
export async function updateUser(id: string, formData: FormData) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string | null;
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    // Validation
    if (!name?.trim()) {
        return { success: false, error: "Nama wajib diisi" };
    }
    if (!email?.trim()) {
        return { success: false, error: "Email wajib diisi" };
    }
    if (!VALID_ROLES.includes(role as Role)) {
        return { success: false, error: "Role tidak valid" };
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { id, deletedAt: null }
        });

        if (!existingUser) {
            return { success: false, error: "Pengguna tidak ditemukan" };
        }

        // Check if email exists (for other users)
        const emailConflict = await prisma.user.findFirst({
            where: { 
                email: email.trim().toLowerCase(), 
                deletedAt: null,
                NOT: { id }
            }
        });

        if (emailConflict) {
            return { success: false, error: "Email sudah digunakan oleh pengguna lain" };
        }

        // Prepare update data
        const updateData: {
            name: string;
            email: string;
            role: Role;
            password?: string;
            photo?: string | null;
        } = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: role as Role,
        };

        // Update password if provided
        if (password && password.length >= 6) {
            const bcrypt = await import("bcryptjs");
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Handle image
        if (removeImage) {
            if (existingUser.photo) {
                await deleteImage(existingUser.photo);
            }
            updateData.photo = null;
        } else if (imageFile && imageFile.size > 0) {
            if (existingUser.photo) {
                await deleteImage(existingUser.photo);
            }
            updateData.photo = await saveImage(imageFile);
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Gagal memperbarui pengguna" };
    }
}

// Soft delete user (admin only)
export async function deleteUser(id: string) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get current user session to prevent self-delete
        const session = await auth();
        if (session?.user?.id === id) {
            return { success: false, error: "Tidak dapat menghapus akun sendiri" };
        }

        const user = await prisma.user.findFirst({
            where: { id, deletedAt: null }
        });

        if (!user) {
            return { success: false, error: "Pengguna tidak ditemukan" };
        }

        // Soft delete - set deletedAt
        await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Gagal menghapus pengguna" };
    }
}

// Get role options for dropdown
export async function getRoleOptions() {
    return {
        success: true,
        roles: [
            { value: "CUSTOMER", label: "Customer" },
            { value: "GUDANG", label: "Gudang" },
            { value: "ADMIN", label: "Admin" },
        ],
    };
}

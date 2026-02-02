"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Helper: Check if user is admin
async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        return { authorized: false, error: "Unauthorized" };
    }
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });
    
    if (user?.role !== "ADMIN") {
        return { authorized: false, error: "Forbidden: Admin only" };
    }
    
    return { authorized: true, userId: session.user.id };
}

// Helper: Generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Helper: Save uploaded image
async function saveImage(file: File, folder: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    
    // Create directory if not exists
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    return `/uploads/${folder}/${filename}`;
}

// Helper: Delete image file
async function deleteImage(imagePath: string) {
    if (!imagePath) return;
    
    try {
        const fullPath = path.join(process.cwd(), "public", imagePath);
        if (existsSync(fullPath)) {
            await unlink(fullPath);
        }
    } catch (error) {
        console.error("Failed to delete image:", error);
    }
}

// Get all categories (with product count)
export async function getCategories() {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const categories = await prisma.category.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { products: { where: { deletedAt: null } } }
                }
            },
            orderBy: { id: "asc" }
        });

        return { 
            success: true, 
            categories: categories.map(cat => ({
                ...cat,
                productCount: cat._count.products
            }))
        };
    } catch (error) {
        console.error("Get categories error:", error);
        return { success: false, error: "Gagal mengambil data kategori" };
    }
}

// Create category
export async function createCategory(formData: FormData) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const name = formData.get("name") as string;
        const imageFile = formData.get("image") as File | null;

        if (!name || name.trim() === "") {
            return { success: false, error: "Nama kategori wajib diisi" };
        }

        const slug = generateSlug(name);

        // Check if slug already exists
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
            return { success: false, error: "Kategori dengan nama serupa sudah ada" };
        }

        let imagePath: string | null = null;
        if (imageFile && imageFile.size > 0) {
            imagePath = await saveImage(imageFile, "categories");
        }

        await prisma.category.create({
            data: {
                name: name.trim(),
                slug,
                image: imagePath
            }
        });

        revalidatePath("/dashboard/kategori");
        return { success: true };
    } catch (error) {
        console.error("Create category error:", error);
        return { success: false, error: "Gagal membuat kategori" };
    }
}

// Update category
export async function updateCategory(id: number, formData: FormData) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const name = formData.get("name") as string;
        const imageFile = formData.get("image") as File | null;
        const removeImage = formData.get("removeImage") === "true";

        if (!name || name.trim() === "") {
            return { success: false, error: "Nama kategori wajib diisi" };
        }

        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
            return { success: false, error: "Kategori tidak ditemukan" };
        }

        const slug = generateSlug(name);

        // Check if slug already exists (excluding current)
        const existing = await prisma.category.findFirst({
            where: { slug, id: { not: id } }
        });
        if (existing) {
            return { success: false, error: "Kategori dengan nama serupa sudah ada" };
        }

        let imagePath = category.image;

        // Handle image update
        if (removeImage || (imageFile && imageFile.size > 0)) {
            // Delete old image
            if (category.image) {
                await deleteImage(category.image);
            }
            
            if (imageFile && imageFile.size > 0) {
                imagePath = await saveImage(imageFile, "categories");
            } else {
                imagePath = null;
            }
        }

        await prisma.category.update({
            where: { id },
            data: {
                name: name.trim(),
                slug,
                image: imagePath
            }
        });

        revalidatePath("/dashboard/kategori");
        return { success: true };
    } catch (error) {
        console.error("Update category error:", error);
        return { success: false, error: "Gagal mengupdate kategori" };
    }
}

// Delete category (soft delete)
export async function deleteCategory(id: number) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const category = await prisma.category.findUnique({ 
            where: { id },
            include: { _count: { select: { products: { where: { deletedAt: null } } } } }
        });

        if (!category) {
            return { success: false, error: "Kategori tidak ditemukan" };
        }

        // Check if category has products
        if (category._count.products > 0) {
            return { success: false, error: "Tidak dapat menghapus kategori yang memiliki produk" };
        }

        await prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        revalidatePath("/dashboard/kategori");
        return { success: true };
    } catch (error) {
        console.error("Delete category error:", error);
        return { success: false, error: "Gagal menghapus kategori" };
    }
}

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
    
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }
    
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

// Get all products with pagination
export async function getProducts(options?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
}) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = { deletedAt: null };

        if (options?.search) {
            where.OR = [
                { name: { contains: options.search, mode: "insensitive" } },
                { slug: { contains: options.search, mode: "insensitive" } },
            ];
        }

        if (options?.categoryId) {
            where.categoryId = options.categoryId;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.product.count({ where })
        ]);

        return {
            success: true,
            products: products.map(p => ({
                ...p,
                price: Number(p.price)
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Get products error:", error);
        return { success: false, error: "Gagal mengambil data produk" };
    }
}

// Get single product
export async function getProduct(id: string) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });

        if (!product) {
            return { success: false, error: "Produk tidak ditemukan" };
        }

        return {
            success: true,
            product: {
                ...product,
                price: Number(product.price)
            }
        };
    } catch (error) {
        console.error("Get product error:", error);
        return { success: false, error: "Gagal mengambil data produk" };
    }
}

// Create product
export async function createProduct(formData: FormData) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const name = formData.get("name") as string;
        const categoryId = parseInt(formData.get("categoryId") as string);
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const stock = parseInt(formData.get("stock") as string);
        const weight = parseInt(formData.get("weight") as string);
        const imageFile = formData.get("image") as File | null;

        // Validation
        if (!name?.trim()) return { success: false, error: "Nama produk wajib diisi" };
        if (!categoryId) return { success: false, error: "Kategori wajib dipilih" };
        if (!description?.trim()) return { success: false, error: "Deskripsi wajib diisi" };
        if (isNaN(price) || price <= 0) return { success: false, error: "Harga tidak valid" };
        if (isNaN(stock) || stock < 0) return { success: false, error: "Stok tidak valid" };
        if (isNaN(weight) || weight <= 0) return { success: false, error: "Berat tidak valid" };
        if (!imageFile || imageFile.size === 0) return { success: false, error: "Gambar produk wajib diupload" };

        const slug = generateSlug(name);

        // Check if slug already exists
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
            return { success: false, error: "Produk dengan nama serupa sudah ada" };
        }

        const imagePath = await saveImage(imageFile, "products");

        await prisma.product.create({
            data: {
                name: name.trim(),
                slug,
                categoryId,
                description: description.trim(),
                price,
                stock,
                weight,
                image: imagePath
            }
        });

        revalidatePath("/dashboard/produk");
        return { success: true };
    } catch (error) {
        console.error("Create product error:", error);
        return { success: false, error: "Gagal membuat produk" };
    }
}

// Update product
export async function updateProduct(id: string, formData: FormData) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const name = formData.get("name") as string;
        const categoryId = parseInt(formData.get("categoryId") as string);
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const stock = parseInt(formData.get("stock") as string);
        const weight = parseInt(formData.get("weight") as string);
        const imageFile = formData.get("image") as File | null;

        // Validation
        if (!name?.trim()) return { success: false, error: "Nama produk wajib diisi" };
        if (!categoryId) return { success: false, error: "Kategori wajib dipilih" };
        if (!description?.trim()) return { success: false, error: "Deskripsi wajib diisi" };
        if (isNaN(price) || price <= 0) return { success: false, error: "Harga tidak valid" };
        if (isNaN(stock) || stock < 0) return { success: false, error: "Stok tidak valid" };
        if (isNaN(weight) || weight <= 0) return { success: false, error: "Berat tidak valid" };

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return { success: false, error: "Produk tidak ditemukan" };
        }

        const slug = generateSlug(name);

        // Check if slug already exists (excluding current)
        const existing = await prisma.product.findFirst({
            where: { slug, id: { not: id } }
        });
        if (existing) {
            return { success: false, error: "Produk dengan nama serupa sudah ada" };
        }

        let imagePath = product.image;

        // Handle image update
        if (imageFile && imageFile.size > 0) {
            // Delete old image
            if (product.image) {
                await deleteImage(product.image);
            }
            imagePath = await saveImage(imageFile, "products");
        }

        await prisma.product.update({
            where: { id },
            data: {
                name: name.trim(),
                slug,
                categoryId,
                description: description.trim(),
                price,
                stock,
                weight,
                image: imagePath
            }
        });

        revalidatePath("/dashboard/produk");
        return { success: true };
    } catch (error) {
        console.error("Update product error:", error);
        return { success: false, error: "Gagal mengupdate produk" };
    }
}

// Delete product (soft delete)
export async function deleteProduct(id: string) {
    try {
        const authCheck = await checkAdmin();
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error };
        }

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return { success: false, error: "Produk tidak ditemukan" };
        }

        await prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        revalidatePath("/dashboard/produk");
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        return { success: false, error: "Gagal menghapus produk" };
    }
}

// Get categories for dropdown
export async function getCategoriesForDropdown() {
    try {
        const categories = await prisma.category.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true },
            orderBy: { name: "asc" }
        });

        return { success: true, categories };
    } catch (error) {
        console.error("Get categories error:", error);
        return { success: false, error: "Gagal mengambil data kategori", categories: [] };
    }
}

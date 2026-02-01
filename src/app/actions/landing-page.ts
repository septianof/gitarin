"use server";

import { prisma } from "@/lib/prisma";
import { Category, Product } from "@prisma/client";

/**
 * Type untuk kategori populer dengan count order items
 */
export type PopularCategory = Category & {
    _count: {
        products: number;
    };
    totalOrderItems: number;
};

/**
 * Type untuk produk unggulan dengan relasi kategori
 */
export type FeaturedProduct = Omit<Product, "price"> & {
    price: string | number;
    category: Category;
};

/**
 * Mengambil 3 kategori paling populer berdasarkan jumlah order items
 * 
 * @returns Array of 3 most popular categories with order count
 */
export async function getPopularCategories(): Promise<PopularCategory[]> {
    try {
        // Query untuk mendapatkan kategori dengan count order items
        const categories = await prisma.category.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
                products: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        orderItems: true,
                    },
                },
            },
        });

        // Hitung total order items per kategori
        const categoriesWithCount = categories.map(
            (category: typeof categories[number]) => {
                const totalOrderItems = category.products.reduce(
                    (total: number, product: (typeof category.products)[number]) => {
                        return total + product.orderItems.length;
                    },
                    0
                );

                return {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    image: category.image,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                    deletedAt: category.deletedAt,
                    _count: {
                        products: category._count.products,
                    },
                    totalOrderItems,
                };
            }
        );

        // Urutkan berdasarkan total order items (descending) dan ambil top 3
        const topCategories = categoriesWithCount
            .sort(
                (a: PopularCategory, b: PopularCategory) =>
                    b.totalOrderItems - a.totalOrderItems
            )
            .slice(0, 3);

        return topCategories;
    } catch (error) {
        console.error("Error fetching popular categories:", error);
        return [];
    }
}

/**
 * Mengambil 4 produk unggulan dengan harga tertinggi
 * Filter: stock > 0 dan deletedAt = null
 * 
 * @returns Array of 4 featured products with highest price
 */
export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
    try {
        const products = await prisma.product.findMany({
            where: {
                deletedAt: null,
                stock: {
                    gt: 0,
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                price: "desc",
            },
            take: 4,
        });

        // Convert Decimal to string
        return products.map((p) => ({
            ...p,
            price: p.price.toString(),
        }));
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
    }
}

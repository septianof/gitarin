"use server";

import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@prisma/client";

// Types
export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

export interface GetProductsParams {
    page?: number;
    limit?: number;
    categoryId?: number;
    sortBy?: SortOption;
    search?: string;
}

export interface ProductWithCategory extends Product {
    category: Category;
}

export interface GetProductsResponse {
    products: ProductWithCategory[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export async function getAllCategories() {
    try {
        return await prisma.category.findMany({
            orderBy: { id: 'asc' },
            where: { deletedAt: null }
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

/**
 * Get paginated products with filtering, sorting, and search
 * 
 * @param page - Current page number (default: 1)
 * @param limit - Items per page (default: 12, max: 100)
 * @param categoryId - Filter by category ID (optional)
 * @param sortBy - Sort order (default: 'newest')
 * @param search - Search by product name (optional, case-insensitive)
 * 
 * @returns Paginated products with metadata
 */
export async function getProducts({
    page = 1,
    limit = 12,
    categoryId,
    sortBy = "newest",
    search,
}: GetProductsParams = {}): Promise<GetProductsResponse> {
    console.log("getProducts called with:", { page, limit, categoryId, sortBy, search });
    try {
        // Validate inputs
        const validPage = Math.max(1, page);
        const validLimit = Math.min(Math.max(1, limit), 100);

        // Build WHERE clause
        const where: any = {
            deletedAt: null,
            stock: {
                gt: 0,
            },
        };

        // Add category filter
        if (categoryId) {
            where.categoryId = categoryId;
        }

        // Add search filter
        if (search && search.trim()) {
            where.name = {
                contains: search.trim(),
                mode: "insensitive",
            };
        }

        // Build ORDER BY clause
        let orderBy: any = {};
        switch (sortBy) {
            case "price-asc":
                orderBy = { price: "asc" };
                break;
            case "price-desc":
                orderBy = { price: "desc" };
                break;
            case "name-asc":
                orderBy = { name: "asc" };
                break;
            case "newest":
            default:
                orderBy = { createdAt: "desc" };
                break;
        }

        // Get total count
        const totalCount = await prisma.product.count({ where });

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / validLimit);
        const skip = (validPage - 1) * validLimit;

        // Fetch products
        const products = await prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: validLimit,
            include: {
                category: true,
            },
        });

        return {
            products: products as ProductWithCategory[],
            totalCount,
            totalPages,
            currentPage: validPage,
            hasNextPage: validPage < totalPages,
            hasPrevPage: validPage > 1,
        };
    } catch (error) {
        console.error("Error fetching products:", error);

        // Return empty result on error
        return {
            products: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: page || 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
    }
}

/**
 * Get single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
    try {
        const product = await prisma.product.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
            include: {
                category: true,
            },
        });

        return product as ProductWithCategory | null;
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        return null;
    }
}

/**
 * Get related products (same category, excluding current product)
 */
export async function getRelatedProducts(
    categoryId: number,
    excludeProductId: string,
    limit: number = 4
): Promise<ProductWithCategory[]> {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId,
                id: { not: excludeProductId },
                deletedAt: null,
                stock: { gt: 0 },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                category: true,
            },
        });

        return products as ProductWithCategory[];
    } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
}

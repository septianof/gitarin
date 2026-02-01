import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getPopularCategories,
    getFeaturedProducts,
} from "@/app/actions/landing-page";
import { prisma } from "@/lib/prisma";

// Mock data
const mockCategories = [
    {
        id: 1,
        name: "Gitar Akustik",
        slug: "gitar-akustik",
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        _count: { products: 5 },
        products: [
            {
                id: "1",
                orderItems: [{}, {}, {}], // 3 items
            },
            {
                id: "2",
                orderItems: [{}, {}], // 2 items
            },
        ],
    },
    {
        id: 2,
        name: "Gitar Elektrik",
        slug: "gitar-elektrik",
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        _count: { products: 5 },
        products: [
            {
                id: "3",
                orderItems: [{}], // 1 item
            },
        ],
    },
    {
        id: 3,
        name: "Bass",
        slug: "bass",
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        _count: { products: 5 },
        products: [],
    },
];

const mockProducts = [
    {
        id: "uuid-1",
        categoryId: 3,
        name: "Bass Series 15",
        slug: "bass-series-15",
        description: "Premium bass guitar",
        price: 9000000,
        stock: 10,
        weight: 4000,
        image: "https://example.com/bass1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        category: {
            id: 3,
            name: "Bass",
            slug: "bass",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
    {
        id: "uuid-2",
        categoryId: 3,
        name: "Bass Series 14",
        slug: "bass-series-14",
        description: "Premium bass guitar",
        price: 8500000,
        stock: 10,
        weight: 4000,
        image: "https://example.com/bass2.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        category: {
            id: 3,
            name: "Bass",
            slug: "bass",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
    {
        id: "uuid-3",
        categoryId: 2,
        name: "Elektrik Series 13",
        slug: "elektrik-series-13",
        description: "Premium electric guitar",
        price: 8000000,
        stock: 5,
        weight: 3500,
        image: "https://example.com/elektrik1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        category: {
            id: 2,
            name: "Gitar Elektrik",
            slug: "gitar-elektrik",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
    {
        id: "uuid-4",
        categoryId: 1,
        name: "Akustik Series 12",
        slug: "akustik-series-12",
        description: "Premium acoustic guitar",
        price: 7500000,
        stock: 8,
        weight: 3000,
        image: "https://example.com/akustik1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        category: {
            id: 1,
            name: "Gitar Akustik",
            slug: "gitar-akustik",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
];

describe("Landing Page Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getPopularCategories", () => {
        it("should return 3 most popular categories sorted by order items", async () => {
            // Mock Prisma response
            vi.mocked(prisma.category.findMany).mockResolvedValue(
                mockCategories as any
            );

            const result = await getPopularCategories();

            // Assertions
            expect(result).toHaveLength(3);
            expect(result[0].name).toBe("Gitar Akustik"); // 5 order items
            expect(result[0].totalOrderItems).toBe(5);
            expect(result[1].name).toBe("Gitar Elektrik"); // 1 order item
            expect(result[1].totalOrderItems).toBe(1);
            expect(result[2].name).toBe("Bass"); // 0 order items
            expect(result[2].totalOrderItems).toBe(0);
        });

        it("should filter out deleted categories", async () => {
            vi.mocked(prisma.category.findMany).mockResolvedValue(
                mockCategories as any
            );

            await getPopularCategories();

            // Verify Prisma was called with correct filters
            expect(prisma.category.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        deletedAt: null,
                    },
                })
            );
        });

        it("should return empty array on error", async () => {
            // Mock error
            vi.mocked(prisma.category.findMany).mockRejectedValue(
                new Error("Database error")
            );

            const result = await getPopularCategories();

            expect(result).toEqual([]);
        });

        it("should include product count for each category", async () => {
            vi.mocked(prisma.category.findMany).mockResolvedValue(
                mockCategories as any
            );

            const result = await getPopularCategories();

            result.forEach((category) => {
                expect(category._count).toBeDefined();
                expect(category._count.products).toBeTypeOf("number");
            });
        });
    });

    describe("getFeaturedProducts", () => {
        it("should return 4 products sorted by price descending", async () => {
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            const result = await getFeaturedProducts();

            expect(result).toHaveLength(4);
            expect(Number(result[0].price)).toBe(9000000);
            expect(Number(result[1].price)).toBe(8500000);
            expect(Number(result[2].price)).toBe(8000000);
            expect(Number(result[3].price)).toBe(7500000);
        });

        it("should filter products with stock > 0 and not deleted", async () => {
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getFeaturedProducts();

            // Verify Prisma was called with correct filters
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        deletedAt: null,
                        stock: {
                            gt: 0,
                        },
                    },
                })
            );
        });

        it("should include category relation for each product", async () => {
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            const result = await getFeaturedProducts();

            result.forEach((product) => {
                expect(product.category).toBeDefined();
                expect(product.category.name).toBeTypeOf("string");
                expect(product.category.slug).toBeTypeOf("string");
            });
        });

        it("should return empty array on error", async () => {
            vi.mocked(prisma.product.findMany).mockRejectedValue(
                new Error("Database error")
            );

            const result = await getFeaturedProducts();

            expect(result).toEqual([]);
        });

        it("should order products by price in descending order", async () => {
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getFeaturedProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: {
                        price: "desc",
                    },
                })
            );
        });

        it("should limit results to 4 products", async () => {
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getFeaturedProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 4,
                })
            );
        });
    });
});

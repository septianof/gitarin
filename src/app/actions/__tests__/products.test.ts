import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProducts } from "@/app/actions/products";
import { prisma } from "@/lib/prisma";

// Mock products data
const mockProducts = [
    {
        id: "1",
        categoryId: 1,
        name: "Fender Stratocaster Sunburst",
        slug: "fender-stratocaster-sunburst",
        description: "Classic electric guitar",
        price: 10999000,
        stock: 5,
        weight: 3500,
        image: "https://images.unsplash.com/photo-1",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-15"),
        deletedAt: null,
        category: {
            id: 1,
            name: "Gitar Elektrik",
            slug: "gitar-elektrik",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
    {
        id: "2",
        categoryId: 1,
        name: "Gibson Les Paul Studio",
        slug: "gibson-les-paul-studio",
        description: "Premium electric guitar",
        price: 22500000,
        stock: 3,
        weight: 4000,
        image: "https://images.unsplash.com/photo-2",
        createdAt: new Date("2026-01-20"),
        updatedAt: new Date("2026-01-20"),
        deletedAt: null,
        category: {
            id: 1,
            name: "Gitar Elektrik",
            slug: "gitar-elektrik",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
    {
        id: "3",
        categoryId: 2,
        name: "Martin D-28 Acoustic",
        slug: "martin-d-28-acoustic",
        description: "Premium acoustic guitar",
        price: 45000000,
        stock: 2,
        weight: 3000,
        image: "https://images.unsplash.com/photo-3",
        createdAt: new Date("2026-01-10"),
        updatedAt: new Date("2026-01-10"),
        deletedAt: null,
        category: {
            id: 2,
            name: "Gitar Akustik",
            slug: "gitar-akustik",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
    {
        id: "4",
        categoryId: 2,
        name: "Taylor 214ce Deluxe",
        slug: "taylor-214ce-deluxe",
        description: "Acoustic guitar with cutaway",
        price: 18700000,
        stock: 4,
        weight: 2800,
        image: "https://images.unsplash.com/photo-4",
        createdAt: new Date("2026-01-25"),
        updatedAt: new Date("2026-01-25"),
        deletedAt: null,
        category: {
            id: 2,
            name: "Gitar Akustik",
            slug: "gitar-akustik",
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    },
];

describe("Product Catalog Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProducts - Pagination", () => {
        it("should return default 12 products per page", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(15);
            vi.mocked(prisma.product.findMany).mockResolvedValue(
                mockProducts.slice(0, 12) as any
            );

            const result = await getProducts();

            expect(result.products).toHaveLength(12);
            expect(result.currentPage).toBe(1);
            expect(result.totalPages).toBe(2); // 15 products / 12 per page = 2 pages
        });

        it("should return correct page 2 products", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(15);
            vi.mocked(prisma.product.findMany).mockResolvedValue(
                mockProducts.slice(0, 3) as any
            );

            const result = await getProducts({ page: 2 });

            expect(result.currentPage).toBe(2);
            expect(result.hasPrevPage).toBe(true);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 12, // (page 2 - 1) * 12
                    take: 12,
                })
            );
        });

        it("should handle page beyond total pages", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(10);
            vi.mocked(prisma.product.findMany).mockResolvedValue([]);

            const result = await getProducts({ page: 5 });

            expect(result.products).toHaveLength(0);
            expect(result.hasNextPage).toBe(false);
        });

        it("should calculate pagination metadata correctly", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(25);
            vi.mocked(prisma.product.findMany).mockResolvedValue(
                mockProducts as any
            );

            const result = await getProducts({ page: 2, limit: 10 });

            expect(result.totalCount).toBe(25);
            expect(result.totalPages).toBe(3); // 25 / 10 = 3 pages
            expect(result.currentPage).toBe(2);
            expect(result.hasNextPage).toBe(true);
            expect(result.hasPrevPage).toBe(true);
        });
    });

    describe("getProducts - Category Filter", () => {
        it("should filter products by category", async () => {
            const elektriks = mockProducts.filter((p) => p.categoryId === 1);
            vi.mocked(prisma.product.count).mockResolvedValue(elektriks.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(elektriks as any);

            const result = await getProducts({ categoryId: 1 });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        categoryId: 1,
                    }),
                })
            );
            expect(result.products.every((p) => p.categoryId === 1)).toBe(true);
        });

        it("should return all products when no category specified", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            const result = await getProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.not.objectContaining({
                        categoryId: expect.anything(),
                    }),
                })
            );
        });
    });

    describe("getProducts - Sorting", () => {
        it("should sort by newest (default)", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: "desc" },
                })
            );
        });

        it("should sort by price ascending", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts({ sortBy: "price-asc" });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { price: "asc" },
                })
            );
        });

        it("should sort by price descending", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts({ sortBy: "price-desc" });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { price: "desc" },
                })
            );
        });

        it("should sort by name alphabetically", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts({ sortBy: "name-asc" });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { name: "asc" },
                })
            );
        });
    });

    describe("getProducts - Search", () => {
        it("should search products by name (case-insensitive)", async () => {
            const fenderProducts = mockProducts.filter((p) =>
                p.name.toLowerCase().includes("fender")
            );
            vi.mocked(prisma.product.count).mockResolvedValue(fenderProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(
                fenderProducts as any
            );

            await getProducts({ search: "Fender" });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        name: {
                            contains: "Fender",
                            mode: "insensitive",
                        },
                    }),
                })
            );
        });

        it("should trim search query", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(0);
            vi.mocked(prisma.product.findMany).mockResolvedValue([]);

            await getProducts({ search: "  Gibson  " });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        name: {
                            contains: "Gibson",
                            mode: "insensitive",
                        },
                    }),
                })
            );
        });

        it("should return empty results for no match", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(0);
            vi.mocked(prisma.product.findMany).mockResolvedValue([]);

            const result = await getProducts({ search: "NonExistent" });

            expect(result.products).toHaveLength(0);
            expect(result.totalCount).toBe(0);
        });
    });

    describe("getProducts - Combined Filters", () => {
        it("should combine category + search", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(1);
            vi.mocked(prisma.product.findMany).mockResolvedValue([
                mockProducts[0],
            ] as any);

            await getProducts({ categoryId: 1, search: "Fender" });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        categoryId: 1,
                        name: {
                            contains: "Fender",
                            mode: "insensitive",
                        },
                    }),
                })
            );
        });

        it("should combine all filters (category + search + sort)", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(1);
            vi.mocked(prisma.product.findMany).mockResolvedValue([
                mockProducts[1],
            ] as any);

            await getProducts({
                categoryId: 1,
                search: "Gibson",
                sortBy: "price-desc",
            });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        categoryId: 1,
                        name: expect.objectContaining({
                            contains: "Gibson",
                        }),
                    }),
                    orderBy: { price: "desc" },
                })
            );
        });
    });

    describe("getProducts - Validation & Edge Cases", () => {
        it("should validate page >= 1", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            const result = await getProducts({ page: -1 });

            expect(result.currentPage).toBe(1);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                })
            );
        });

        it("should limit max items per page to 100", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(200);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts({ limit: 999 });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 100,
                })
            );
        });

        it("should only return products with stock > 0", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        stock: { gt: 0 },
                    }),
                })
            );
        });

        it("should exclude soft-deleted products", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        deletedAt: null,
                    }),
                })
            );
        });

        it("should return empty result on database error", async () => {
            vi.mocked(prisma.product.count).mockRejectedValue(
                new Error("Database error")
            );

            const result = await getProducts();

            expect(result.products).toEqual([]);
            expect(result.totalCount).toBe(0);
            expect(result.totalPages).toBe(0);
        });

        it("should include category relation", async () => {
            vi.mocked(prisma.product.count).mockResolvedValue(mockProducts.length);
            vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

            await getProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: {
                        category: true,
                    },
                })
            );
        });
    });
});

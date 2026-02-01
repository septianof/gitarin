import { vi } from "vitest";

// Mock Prisma Client globally
vi.mock("@/lib/prisma", () => ({
    prisma: {
        category: {
            findMany: vi.fn(),
        },
        product: {
            findMany: vi.fn(),
        },
    },
}));

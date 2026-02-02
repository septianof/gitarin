"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

// Get sales report - only SELESAI orders
export async function getSalesReport(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 10, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    try {
        // Build date filter
        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            // Set to end of day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        const where = {
            status: "SELESAI",
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        };

        const [orders, total, summary] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
            // Summary for filtered period
            prisma.order.aggregate({
                where,
                _sum: {
                    total: true,
                    shippingCost: true,
                },
                _count: {
                    id: true,
                },
            }),
        ]);

        // Calculate product totals for the period
        const productSales = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    status: "SELESAI",
                    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
                },
            },
            _sum: {
                quantity: true,
            },
        });

        // Get product details for top products
        const topProductIds = productSales
            .sort((a, b) => (b._sum.quantity || 0) - (a._sum.quantity || 0))
            .slice(0, 5)
            .map(p => p.productId);

        const topProducts = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true },
        });

        const topProductsWithSales = productSales
            .filter(p => topProductIds.includes(p.productId))
            .map(ps => {
                const product = topProducts.find(p => p.id === ps.productId);
                return {
                    productId: ps.productId,
                    productName: product?.name || "Unknown",
                    totalSold: ps._sum.quantity || 0,
                };
            })
            .sort((a, b) => b.totalSold - a.totalSold);

        return {
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            summary: {
                totalOrders: summary._count.id || 0,
                totalRevenue: summary._sum.total || 0,
                totalShipping: summary._sum.shippingCost || 0,
            },
            topProducts: topProductsWithSales,
        };
    } catch (error) {
        console.error("Error fetching sales report:", error);
        return { success: false, error: "Gagal mengambil laporan penjualan" };
    }
}

// Get all completed orders for export (no pagination)
export async function exportSalesReport(params: {
    startDate?: string;
    endDate?: string;
}) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const { startDate, endDate } = params;

    try {
        // Build date filter
        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        const where = {
            status: "SELESAI",
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        };

        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Summary
        const summary = await prisma.order.aggregate({
            where,
            _sum: {
                total: true,
                shippingCost: true,
            },
            _count: {
                id: true,
            },
        });

        // Format orders for export
        const exportData = orders.map(order => ({
            orderId: order.id,
            orderDate: new Date(order.createdAt).toLocaleDateString("id-ID"),
            customerName: order.user.name || "N/A",
            customerEmail: order.user.email,
            items: order.items.map(item => 
                `${item.product.name} (${item.quantity}x)`
            ).join("; "),
            itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: order.total - order.shippingCost,
            shippingCost: order.shippingCost,
            total: order.total,
            shippingAddress: `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingProvince}`,
        }));

        return {
            success: true,
            data: exportData,
            summary: {
                totalOrders: summary._count.id || 0,
                totalRevenue: summary._sum.total || 0,
                totalShipping: summary._sum.shippingCost || 0,
                dateRange: {
                    start: startDate || "All time",
                    end: endDate || "Now",
                },
            },
        };
    } catch (error) {
        console.error("Error exporting sales report:", error);
        return { success: false, error: "Gagal mengekspor laporan" };
    }
}

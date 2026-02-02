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

// Get sales report - only SELESAI orders (simplified version)
export async function getSalesReport(params: {
    page?: number;
    limit?: number;
}) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    try {
        const where = {
            status: "SELESAI" as const,
        };

        const [rawOrders, total] = await Promise.all([
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
                    shipment: {
                        select: {
                            cost: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        // Convert Decimal to number to avoid serialization issues
        const orders = rawOrders.map(order => ({
            id: order.id,
            createdAt: order.createdAt,
            user: order.user,
            items: order.items.map(item => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.price),
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: Number(item.product.price),
                },
            })),
            shipment: order.shipment ? {
                cost: Number(order.shipment.cost),
            } : null,
        }));

        // Calculate summary
        const totalRevenue = orders.reduce((sum, order) => {
            const itemsTotal = order.items.reduce((itemSum, item) => {
                return itemSum + (Number(item.price) * item.quantity);
            }, 0);
            return sum + itemsTotal;
        }, 0);

        const totalShipping = orders.reduce((sum, order) => {
            return sum + (order.shipment ? Number(order.shipment.cost) : 0);
        }, 0);

        // Calculate product totals
        const productMap = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const existing = productMap.get(item.productId);
                const revenue = Number(item.price) * item.quantity;
                
                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += revenue;
                } else {
                    productMap.set(item.productId, {
                        id: item.product.id,
                        name: item.product.name,
                        quantity: item.quantity,
                        revenue: revenue,
                    });
                }
            });
        });

        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

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
                totalOrders: total,
                totalRevenue,
                totalShipping,
            },
            topProducts,
        };
    } catch (error) {
        console.error("Error fetching sales report:", error);
        return { success: false, error: "Failed to fetch sales report" };
    }
}

// Export all SELESAI orders data (for PDF generation)
export async function exportSalesReport() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const rawOrders = await prisma.order.findMany({
            where: {
                status: "SELESAI",
            },
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
                                price: true,
                            },
                        },
                    },
                },
                shipment: {
                    select: {
                        cost: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Serialize orders properly
        const orders = rawOrders.map(order => ({
            id: order.id,
            createdAt: order.createdAt,
            user: order.user,
            items: order.items.map(item => ({
                quantity: item.quantity,
                price: Number(item.price),
                product: {
                    name: item.product.name,
                    price: Number(item.product.price),
                },
            })),
            shipment: order.shipment ? {
                cost: Number(order.shipment.cost),
            } : null,
        }));

        // Calculate summary
        const totalRevenue = orders.reduce((sum, order) => {
            const itemsTotal = order.items.reduce((itemSum, item) => {
                return itemSum + (item.price * item.quantity);
            }, 0);
            return sum + itemsTotal;
        }, 0);

        const totalShipping = orders.reduce((sum, order) => {
            return sum + (order.shipment ? order.shipment.cost : 0);
        }, 0);

        return {
            success: true,
            orders,
            summary: {
                totalOrders: orders.length,
                totalRevenue,
                totalShipping,
                grandTotal: totalRevenue + totalShipping,
            },
        };
    } catch (error) {
        console.error("Error exporting sales report:", error);
        return { success: false, error: "Failed to export sales report" };
    }
}

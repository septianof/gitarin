
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCart } from "./cart";
import { redirect } from "next/navigation";

interface CreateOrderData {
    recipientName: string;
    recipientPhone: string;
    areaId: string;
    areaName: string;
    postalCode: string;
    addressDetail: string;
    courierCompany: string;  // e.g., "jne"
    courierName: string;     // e.g., "JNE"
    courierType: string;     // e.g., "reg"
    service: string;         // e.g., "Regular"
    shippingCost: number;
}

export async function createOrder(data: CreateOrderData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const cartResult = await getCart();
        if (!cartResult.success || !cartResult.cart || cartResult.cart.items.length === 0) {
            return { success: false, error: "Keranjang kosong" };
        }

        const cart = cartResult.cart;
        const subtotal = cartResult.subtotal || 0;
        const totalAmount = subtotal + data.shippingCost;

        // Order expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Transaction: Create Order, Items, Shipment, Clear Cart
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId: session.user.id,
                    totalAmount: totalAmount,
                    status: "PENDING",
                    expiresAt: expiresAt,
                },
            });

            // 2. Create Order Items
            const orderItemsData = cart.items.map((item) => ({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.product.price),
            }));

            await tx.orderItem.createMany({
                data: orderItemsData,
            });

            // 3. Create Shipment
            await tx.shipment.create({
                data: {
                    orderId: newOrder.id,
                    recipientName: data.recipientName,
                    recipientPhone: data.recipientPhone,
                    destinationAreaId: data.areaId,    // Biteship Area ID
                    addressCity: data.areaName,
                    addressDetail: data.addressDetail,
                    postalCode: data.postalCode,
                    courier: data.courierCompany,      // e.g., "jne"
                    courierType: data.courierType,     // e.g., "reg"
                    service: data.service,             // e.g., "Regular"
                    cost: data.shippingCost,
                    status: "PENDING",
                },
            });

            // 4. Clear Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return newOrder;
        });

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Create order error:", error);
        return { success: false, error: "Gagal membuat pesanan" };
    }
}

// Helper: Check if order is expired and update status
async function checkAndExpireOrder(orderId: string): Promise<boolean> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, expiresAt: true }
    });

    if (!order) return false;

    // Only check PENDING orders with expiresAt set
    if (order.status === "PENDING" && order.expiresAt && new Date() > order.expiresAt) {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "DIBATALKAN" }
        });
        return true; // Order was expired
    }

    return false;
}

export async function getOrder(orderId: string) {
    try {
        if (!orderId) return null;

        const session = await auth();
        if (!session?.user?.id) return null;

        // Check and auto-expire if needed
        await checkAndExpireOrder(orderId);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                shipment: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order || order.userId !== session.user.id) return null;

        // Serialization
        const serializedOrder = {
            ...order,
            totalAmount: Number(order.totalAmount),
            items: order.items.map(item => ({
                ...item,
                price: Number(item.price),
                product: {
                    ...item.product,
                    price: Number(item.product.price)
                }
            })),
            shipment: order.shipment ? {
                ...order.shipment,
                cost: Number(order.shipment.cost)
            } : null,
            payment: null
        };

        return serializedOrder;
    } catch (error) {
        console.error("Get order error:", error);
        return null;
    }
}

export async function getUserOrders(status?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const whereClause: any = { userId: session.user.id };
        if (status && status !== "ALL") {
            whereClause.status = status;
        }

        // First, auto-expire any PENDING orders that have passed expiresAt
        await prisma.order.updateMany({
            where: {
                userId: session.user.id,
                status: "PENDING",
                expiresAt: {
                    lt: new Date()
                }
            },
            data: {
                status: "DIBATALKAN"
            }
        });

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                shipment: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Serialization: Convert Decimal to number for Client Components
        const serializedOrders = orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount),
            items: order.items.map(item => ({
                ...item,
                price: Number(item.price),
                product: {
                    ...item.product,
                    price: Number(item.product.price)
                }
            })),
            shipment: order.shipment ? {
                ...order.shipment,
                cost: Number(order.shipment.cost)
            } : null,
            payment: null // We didn't include payment, but if we did, serialize it too.
        }));

        return { success: true, orders: serializedOrders };
    } catch (error) {
        console.error("Get user orders error:", error);
        return { success: false, error: "Gagal mengambil data pesanan" };
    }
}

// Customer marks order as received/completed
export async function markOrderAsCompleted(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify order belongs to user and is in DIKIRIM status
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { shipment: true }
        });

        if (!order) {
            return { success: false, error: "Pesanan tidak ditemukan" };
        }

        if (order.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        if (order.status !== "DIKIRIM") {
            return { success: false, error: "Pesanan tidak dalam status pengiriman" };
        }

        // Update order status to SELESAI
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: "SELESAI" }
            }),
            prisma.shipment.update({
                where: { orderId: orderId },
                data: { status: "DELIVERED" }
            })
        ]);

        return { success: true };
    } catch (error) {
        console.error("Mark order completed error:", error);
        return { success: false, error: "Gagal mengubah status pesanan" };
    }
}

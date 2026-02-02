
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
    courier: string;
    service: string;
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

        // Transaction: Create Order, Items, Shipment, Clear Cart
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId: session.user.id,
                    totalAmount: totalAmount,
                    status: "PENDING",
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
                    addressCity: data.areaName, // Store Area Name here
                    addressDetail: data.addressDetail,
                    postalCode: data.postalCode,
                    courier: data.courier,
                    service: data.service,
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

export async function getOrder(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

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

        return order;
    } catch (error) {
        console.error("Get order error:", error);
        return null;
    }
}

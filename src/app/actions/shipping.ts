"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createShippingOrder, CreateOrderPayload } from "@/lib/biteship";
import { revalidatePath } from "next/cache";

export async function processShippingLabel(orderId: string) {
    try {
        const session = await auth();
        // Ensure user is authorized (GUDANG or ADMIN)
        if (!session?.user || (session.user.role !== "GUDANG" && session.user.role !== "ADMIN")) {
            return { success: false, error: "Unauthorized" };
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                shipment: true,
                items: { include: { product: true } },
                user: true
            }
        });

        if (!order || !order.shipment) {
            return { success: false, error: "Order or Shipment not found" };
        }

        // 1. Prepare Payload for Biteship
        const originAreaId = process.env.BITESHIP_ORIGIN_AREA_ID; // Must be in .env

        if (!originAreaId) {
            return { success: false, error: "Origin Area not configured" };
        }

        const payload: CreateOrderPayload = {
            origin: {
                area_id: originAreaId,
                address: process.env.BITESHIP_ORIGIN_ADDRESS || "Gitarin Warehouse, Jl. Merdeka No. 1",
                postal_code: Number(process.env.BITESHIP_ORIGIN_POSTAL_CODE) || 12345
            },
            destination: {
                area_id: order.shipment.areaId, // Stored from Checkout
                address: `${order.shipment.addressDetail}, ${order.shipment.areaName}`,
                postal_code: Number(order.shipment.postalCode)
            },
            shipper: {
                name: "Gitarin Official",
                phone: "081234567890" // Should be env or proper config
            },
            consignee: {
                name: order.shipment.recipientName,
                phone: order.shipment.recipientPhone
            },
            courier: {
                company: order.shipment.courier.toLowerCase(), // e.g. "jne" matches "JNE"
                type: order.shipment.service.toLowerCase().split(" ")[0] // e.g. "reg" from "Regular"
            },
            items: order.items.map(item => ({
                name: item.product.name,
                value: Number(item.product.price),
                quantity: item.quantity,
                weight: item.product.weight
            })),
            note: "Handle with care"
        };

        // 2. Call Biteship API
        const shipmentResult = await createShippingOrder(payload);

        if (!shipmentResult || !shipmentResult.success) {
            return { success: false, error: "Failed to create shipping order in Biteship" };
        }

        // 3. Update Order in DB
        await prisma.$transaction([
            prisma.shipment.update({
                where: { id: order.shipment.id },
                data: {
                    resi: shipmentResult.waybill_id, // Save the Resi/Waybill
                    trackingId: shipmentResult.id    // Save Biteship Order ID
                }
            }),
            prisma.order.update({
                where: { id: order.id },
                data: { status: "DIKIRIM" }
            })
        ]);

        revalidatePath("/dashboard/antrean");
        return { success: true, trackingId: shipmentResult.courier.tracking_id };

    } catch (error) {
        console.error("Process Shipping Label Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

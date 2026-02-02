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

        // Check if already has resi
        if (order.shipment.resi) {
            return { success: false, error: "Resi sudah dicetak sebelumnya" };
        }

        // 1. Prepare Payload for Biteship (format sesuai dokumentasi resmi)
        const originAreaId = process.env.BITESHIP_ORIGIN_AREA_ID;
        const originAddress = process.env.BITESHIP_ORIGIN_ADDRESS || "Gitarin Warehouse, Jl. Merdeka No. 1";
        const originPostalCode = Number(process.env.BITESHIP_ORIGIN_POSTAL_CODE) || 45189;
        const originContactName = process.env.BITESHIP_ORIGIN_CONTACT_NAME || "Gitarin Official";
        const originContactPhone = process.env.BITESHIP_ORIGIN_CONTACT_PHONE || "081234567890";

        if (!originAreaId) {
            return { success: false, error: "Origin Area ID not configured in environment" };
        }

        if (!order.shipment.destinationAreaId) {
            return { success: false, error: "Destination Area ID tidak ditemukan. Pesanan ini dibuat sebelum sistem diupdate." };
        }

        const payload: CreateOrderPayload = {
            // Origin (Warehouse)
            origin_contact_name: originContactName,
            origin_contact_phone: originContactPhone,
            origin_address: originAddress,
            origin_postal_code: originPostalCode,
            origin_area_id: originAreaId,
            
            // Destination (Customer)
            destination_contact_name: order.shipment.recipientName,
            destination_contact_phone: order.shipment.recipientPhone,
            destination_address: `${order.shipment.addressDetail}, ${order.shipment.addressCity}`,
            destination_postal_code: Number(order.shipment.postalCode),
            destination_area_id: order.shipment.destinationAreaId,
            
            // Courier
            courier_company: order.shipment.courier.toLowerCase(), // e.g., "jne"
            courier_type: order.shipment.courierType || "reg",     // e.g., "reg"
            
            // Delivery
            delivery_type: "now",
            
            // Items
            items: order.items.map(item => ({
                name: item.product.name,
                description: item.product.name,
                value: Number(item.product.price),
                quantity: item.quantity,
                weight: item.product.weight
            })),
            
            order_note: "Handle with care - Gitarin"
        };

        // 2. Call Biteship API
        const shipmentResult = await createShippingOrder(payload);

        if (!shipmentResult || !shipmentResult.success) {
            return { success: false, error: "Gagal membuat order pengiriman di Biteship. Cek log server." };
        }

        // 3. Update Shipment & Order in DB
        await prisma.$transaction([
            prisma.shipment.update({
                where: { id: order.shipment.id },
                data: {
                    resi: shipmentResult.waybill_id,        // Nomor Resi
                    biteshipOrderId: shipmentResult.id,     // Biteship Order ID
                    status: "CONFIRMED"
                }
            }),
            prisma.order.update({
                where: { id: order.id },
                data: { status: "DIKIRIM" }
            })
        ]);

        revalidatePath("/dashboard/antrean");
        revalidatePath(`/dashboard/antrean/${orderId}`);
        
        return { 
            success: true, 
            trackingId: shipmentResult.waybill_id,
            message: `Resi berhasil dibuat: ${shipmentResult.waybill_id}`
        };

    } catch (error) {
        console.error("Process Shipping Label Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

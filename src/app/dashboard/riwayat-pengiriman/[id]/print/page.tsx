import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrintClientRiwayat from "./print-client";

export const metadata = {
    title: "Cetak Resi Pengiriman - Gitarin",
};

export default async function RiwayatPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            shipment: true,
            user: true
        }
    });

    if (!order || !order.shipment) {
        notFound();
    }

    if (!["DIKIRIM", "SELESAI"].includes(order.status)) {
        notFound();
    }

    const orderData = {
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            product: {
                name: item.product.name,
                weight: item.product.weight,
                image: item.product.image
            }
        })),
        shipment: {
            recipientName: order.shipment.recipientName,
            recipientPhone: order.shipment.recipientPhone,
            addressCity: order.shipment.addressCity,
            addressDetail: order.shipment.addressDetail,
            postalCode: order.shipment.postalCode,
            courier: order.shipment.courier,
            service: order.shipment.service,
            cost: Number(order.shipment.cost),
            resi: order.shipment.resi
        }
    };

    return <PrintClientRiwayat order={orderData} />;
}

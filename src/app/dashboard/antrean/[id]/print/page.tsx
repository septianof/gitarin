import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { PrintLabelClient } from "./print-client";

export const metadata = {
    title: "Cetak Label Pengiriman - Gitarin",
};

export default async function PrintLabelPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Check if resi exists
    if (!order.shipment.resi) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Resi Belum Tersedia</h1>
                    <p className="text-gray-600">Silakan cetak resi terlebih dahulu dari halaman detail pesanan.</p>
                </div>
            </div>
        );
    }

    const orderIdFormatted = `#GG-${order.id.slice(-4).toUpperCase()}`;
    const totalWeight = order.items.reduce((sum, item) => sum + (item.product.weight * item.quantity), 0);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    // Origin data from env (should match what's in .env)
    const originData = {
        name: process.env.BITESHIP_ORIGIN_CONTACT_NAME || "Gitarin Official",
        phone: process.env.BITESHIP_ORIGIN_CONTACT_PHONE || "081234567890",
        address: process.env.BITESHIP_ORIGIN_ADDRESS || "Gitarin Warehouse, Jl. Merdeka No. 1",
        postalCode: process.env.BITESHIP_ORIGIN_POSTAL_CODE || "45189",
    };

    const labelData = {
        orderId: orderIdFormatted,
        orderDate: format(order.createdAt, "dd MMM yyyy, HH:mm", { locale: idLocale }),
        
        // Origin (Pengirim)
        senderName: originData.name,
        senderPhone: originData.phone,
        senderAddress: originData.address,
        senderPostalCode: originData.postalCode,
        
        // Destination (Penerima)
        recipientName: order.shipment.recipientName,
        recipientPhone: order.shipment.recipientPhone,
        recipientAddress: order.shipment.addressDetail,
        recipientCity: order.shipment.addressCity,
        recipientPostalCode: order.shipment.postalCode,
        
        // Shipping
        courier: order.shipment.courier.toUpperCase(),
        service: order.shipment.service,
        resi: order.shipment.resi,
        
        // Package
        totalWeight,
        totalItems,
        
        // Items summary
        itemsSummary: order.items.map(item => ({
            name: item.product.name,
            qty: item.quantity,
            weight: item.product.weight
        }))
    };

    return <PrintLabelClient labelData={labelData} />;
}

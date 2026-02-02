import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QueueTable from "@/components/dashboard/QueueTable";
import { QueueActions } from "@/components/dashboard/QueueActions";

export const metadata = {
    title: "Daftar Antrean - Gitarin Gudang",
};

export default async function AntreanPage() {
    const session = await auth();

    // Fetch orders with status "DIKEMAS" (Ready to ship)
    // Also include those already "DIKIRIM" but maybe need label reprint?
    // Design says "12 pesanan menunggu cetak resi", implying specifically "DIKEMAS" (or a new status like "READY_TO_SHIP")
    // For now, let's use status "DIKEMAS".

    const orders = await prisma.order.findMany({
        where: {
            status: "DIKEMAS"
        },
        orderBy: {
            createdAt: "asc" // Oldest first (FIFO)
        },
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

    // Format for Table
    const formattedOrders = orders.map(order => ({
        id: order.id,
        orderId: `#GG-${order.id.slice(-4).toUpperCase()}`, // Mock nice ID
        date: order.createdAt,
        productName: order.items[0]?.product.name + (order.items.length > 1 ? ` (+${order.items.length - 1} produk lainnya)` : ""),
        courier: order.shipment?.courier.toUpperCase() || "-",
        service: order.shipment?.service || "-", // Assuming 'service' is stored or we just show courier
        weight: order.items.reduce((sum, item) => sum + (item.product.weight * item.quantity), 0), // Grams
        status: order.status,
        recipient: order.shipment?.recipientName
    }));

    // Get order IDs for bulk print
    const orderIds = orders.map(order => order.id);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Daftar Antrean Pesanan</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex size-2 rounded-full bg-emerald-500"></span>
                        <p className="text-gray-500 text-sm">{orders.length} pesanan menunggu cetak resi</p>
                    </div>
                </div>
                <QueueActions orderIds={orderIds} totalOrders={orders.length} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <QueueTable data={formattedOrders} />
            </div>
        </div>
    );
}

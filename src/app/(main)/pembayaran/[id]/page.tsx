
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PaymentView from "./payment-view";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            shipment: true,
        },
    });

    if (!order || order.userId !== session.user.id) {
        notFound();
    }

    if (order.status !== "PENDING") {
        // If already paid, redirect to profile or success
        // redirect("/profil"); // Uncomment later
    }

    // Serialize Date for Client Component
    const serializedOrder = {
        ...order,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt, // Next.js handles Date serialization now, usually
        items: order.items.map(item => ({
            ...item,
            price: Number(item.price), // Decimal to Number
            product: {
                name: item.product.name,
                image: item.product.image
            }
        })),
        shipment: order.shipment ? {
            cost: Number(order.shipment.cost), // Decimal to Number
            recipientName: order.shipment.recipientName
        } : null
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-8">Pilih Pembayaran</h1>
            <PaymentView
                order={serializedOrder}
                midtransClientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
            />
        </main>
    );
}

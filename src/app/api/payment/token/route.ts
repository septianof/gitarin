
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // Get Order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });

        if (!order || order.userId !== session.user.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // If already has token, return it
        if (order.snapToken) {
            return NextResponse.json({ token: order.snapToken });
        }

        // Create Snap Transaction
        const parameter = {
            transaction_details: {
                order_id: order.id,
                gross_amount: Number(order.totalAmount),
            },
            customer_details: {
                first_name: session.user.name,
                email: session.user.email,
            },
        };

        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        // Save token to DB
        await prisma.order.update({
            where: { id: order.id },
            data: { snapToken: token },
        });

        return NextResponse.json({ token });
    } catch (error) {
        console.error("Snap Token Error:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}

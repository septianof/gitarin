
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Extract data
        const { order_id, transaction_status, fraud_status, status_code, gross_amount, signature_key } = body;

        // Verify Signature
        // Signature = SHA512(order_id + status_code + gross_amount + ServerKey)
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey) {
            console.error("MIDTRANS_SERVER_KEY missing");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        const payloadStart = order_id + status_code + gross_amount + serverKey;
        const generatedSignature = crypto.createHash("sha512").update(payloadStart).digest("hex");

        if (generatedSignature !== signature_key) {
            console.error("Invalid Signature URL");
            return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
        }

        console.log(`Webhook Received: Order ${order_id} - Status ${transaction_status}`);

        // Map Midtrans Status to OrderStatus
        // OrderStatus: PENDING, DIKEMAS (Paid), DIKIRIM, SELESAI, DIBATALKAN

        let newStatus = "";

        if (transaction_status === "capture") {
            if (fraud_status === "challenge") {
                // Deny or Pending logic? Usually manually reviewed. Keep Pending or Custom.
                // For simplicity, pending
                newStatus = "PENDING";
            } else if (fraud_status === "accept") {
                newStatus = "DIKEMAS"; // Paid
            }
        } else if (transaction_status === "settlement") {
            newStatus = "DIKEMAS"; // Paid
        } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
            newStatus = "DIBATALKAN";
        } else if (transaction_status === "pending") {
            newStatus = "PENDING";
        }

        if (newStatus) {
            // Update Order
            // Also create Payment record if not exists or update it
            await prisma.order.update({
                where: { id: order_id },
                data: { status: newStatus as any },
            });

            // Create/Update Payment Record
            await prisma.payment.upsert({
                where: { orderId: order_id },
                update: {
                    status: transaction_status,
                    paymentMethod: body.payment_type,
                    midtransId: body.transaction_id,
                    paidAt: newStatus === "DIKEMAS" ? new Date() : undefined,
                },
                create: {
                    orderId: order_id,
                    amount: body.gross_amount,
                    status: transaction_status,
                    paymentMethod: body.payment_type,
                    midtransId: body.transaction_id,
                    paidAt: newStatus === "DIKEMAS" ? new Date() : undefined,
                }
            });
        }

        return NextResponse.json({ message: "OK" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: "Error processing notification" }, { status: 500 });
    }
}

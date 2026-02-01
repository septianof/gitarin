import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRates, ShippingItem } from "@/lib/biteship";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { destinationAreaId } = body;

        if (!destinationAreaId) {
            return NextResponse.json({ error: "Destination area is required" }, { status: 400 });
        }

        const originAreaId = process.env.BITESHIP_ORIGIN_AREA_ID;
        if (!originAreaId) {
            return NextResponse.json({ error: "Origin area configuration missing" }, { status: 500 });
        }

        // Fetch user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Prepare items for Biteship
        const shippingItems: ShippingItem[] = cart.items
            .filter(item => !item.product.deletedAt)
            .map(item => ({
                name: item.product.name,
                value: Number(item.product.price), // Convert Decimal to number
                quantity: item.quantity,
                weight: item.product.weight,
            }));

        if (shippingItems.length === 0) {
            return NextResponse.json({ error: "No valid items to ship" }, { status: 400 });
        }

        const rates = await getRates(originAreaId, destinationAreaId, shippingItems);

        return NextResponse.json({ rates });

    } catch (error) {
        console.error("Shipping cost error:", error);
        return NextResponse.json({ error: "Failed to calculate shipping cost" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getShippingCost } from "@/lib/rajaongkir";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { destination, weight, courier } = body;

        if (!destination || !weight || !courier) {
            return NextResponse.json(
                { error: "destination, weight, dan courier diperlukan" },
                { status: 400 }
            );
        }

        // Validate courier
        if (!["jne", "pos", "tiki"].includes(courier.toLowerCase())) {
            return NextResponse.json(
                { error: "Kurir harus jne, pos, atau tiki" },
                { status: 400 }
            );
        }

        const result = await getShippingCost(
            destination,
            parseInt(weight),
            courier.toLowerCase() as "jne" | "pos" | "tiki"
        );

        if (!result) {
            return NextResponse.json(
                { error: "Gagal menghitung ongkos kirim" },
                { status: 500 }
            );
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error("Error calculating shipping cost:", error);
        return NextResponse.json(
            { error: "Gagal menghitung ongkos kirim" },
            { status: 500 }
        );
    }
}

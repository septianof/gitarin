import { NextResponse } from "next/server";
import { getProvinces } from "@/lib/rajaongkir";

export async function GET() {
    try {
        const provinces = await getProvinces();
        return NextResponse.json({ provinces });
    } catch (error) {
        console.error("Error fetching provinces:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data provinsi" },
            { status: 500 }
        );
    }
}

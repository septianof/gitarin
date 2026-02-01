import { NextRequest, NextResponse } from "next/server";
import { getCities } from "@/lib/rajaongkir";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const provinceId = searchParams.get("province_id");

        if (!provinceId) {
            return NextResponse.json(
                { error: "province_id diperlukan" },
                { status: 400 }
            );
        }

        const cities = await getCities(provinceId);
        return NextResponse.json({ cities });
    } catch (error) {
        console.error("Error fetching cities:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data kota" },
            { status: 500 }
        );
    }
}

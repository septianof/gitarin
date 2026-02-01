import { NextRequest, NextResponse } from "next/server";
import { searchAreas } from "@/lib/biteship";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json({ areas: [] });
    }

    const areas = await searchAreas(query);
    return NextResponse.json({ areas });
}

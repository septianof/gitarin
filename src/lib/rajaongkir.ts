// RajaOngkir API Client (Starter - Free Tier)
// Docs: https://rajaongkir.com/dokumentasi/starter

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || "";
const RAJAONGKIR_BASE_URL = "https://api.rajaongkir.com/starter";

interface Province {
    province_id: string;
    province: string;
}

interface City {
    city_id: string;
    province_id: string;
    province: string;
    type: string;
    city_name: string;
    postal_code: string;
}

interface CostResult {
    service: string;
    description: string;
    cost: {
        value: number;
        etd: string;
        note: string;
    }[];
}

interface CourierCost {
    code: string;
    name: string;
    costs: CostResult[];
}

export async function getProvinces(): Promise<Province[]> {
    try {
        console.log("Fetching provinces from RajaOngkir...");
        const response = await fetch(`${RAJAONGKIR_BASE_URL}/province`, {
            headers: {
                key: RAJAONGKIR_API_KEY,
            },
            cache: "force-cache", // Cache provinces (they don't change)
        });

        const data = await response.json();
        console.log("RajaOngkir provinces response:", JSON.stringify(data).substring(0, 200) + "..."); // Log first 200 chars

        if (data.rajaongkir?.status?.code !== 200) {
            console.error("RajaOngkir error:", data.rajaongkir?.status?.description);
            return [];
        }

        return data.rajaongkir.results || [];
    } catch (error) {
        console.error("Failed to fetch provinces:", error);
        return [];
    }
}

export async function getCities(provinceId?: string): Promise<City[]> {
    try {
        const url = provinceId
            ? `${RAJAONGKIR_BASE_URL}/city?province=${provinceId}`
            : `${RAJAONGKIR_BASE_URL}/city`;

        const response = await fetch(url, {
            headers: {
                key: RAJAONGKIR_API_KEY,
            },
            cache: provinceId ? "force-cache" : "no-store",
        });

        const data = await response.json();

        if (data.rajaongkir?.status?.code !== 200) {
            console.error("RajaOngkir error:", data.rajaongkir?.status?.description);
            return [];
        }

        return data.rajaongkir.results || [];
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        return [];
    }
}

export async function getShippingCost(
    destinationCityId: string,
    weightInGrams: number,
    courier: "jne" | "pos" | "tiki"
): Promise<CourierCost | null> {
    try {
        const originCityId = process.env.RAJAONGKIR_ORIGIN_CITY_ID || "109"; // Default: Kab. Cirebon

        const response = await fetch(`${RAJAONGKIR_BASE_URL}/cost`, {
            method: "POST",
            headers: {
                key: RAJAONGKIR_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                origin: originCityId,
                destination: destinationCityId,
                weight: weightInGrams.toString(),
                courier: courier,
            }),
        });

        const data = await response.json();

        if (data.rajaongkir?.status?.code !== 200) {
            console.error("RajaOngkir error:", data.rajaongkir?.status?.description);
            return null;
        }

        const results = data.rajaongkir.results;
        return results && results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error("Failed to fetch shipping cost:", error);
        return null;
    }
}

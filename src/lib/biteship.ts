const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY!;
const BITESHIP_BASE_URL = "https://api.biteship.com/v1";

if (!BITESHIP_API_KEY) {
    console.warn("Warning: BITESHIP_API_KEY is not set");
}

export interface BiteshipArea {
    id: string;
    name: string;
    country_name: string;
    country_code: string;
    administrative_division_level_1_name: string; // Province
    administrative_division_level_1_type: string;
    administrative_division_level_2_name: string; // City
    administrative_division_level_2_type: string;
    administrative_division_level_3_name: string; // District
    administrative_division_level_3_type: string;
    postal_code: number;
}

export interface BiteshipRate {
    company: string; // e.g., "jne"
    courier_name: string; // e.g., "JNE"
    courier_service_name: string; // e.g., "Regular"
    courier_service_code: string; // e.g., "reg"
    duration: string; // e.g., "1 - 2 days"
    price: number;
}

const DUMMY_RATES: BiteshipRate[] = [
    {
        company: "jne",
        courier_name: "JNE",
        courier_service_name: "Regular",
        courier_service_code: "reg",
        duration: "1 - 2 hari",
        price: 15000,
    },
    {
        company: "sicepat",
        courier_name: "SiCepat",
        courier_service_name: "Regular",
        courier_service_code: "reg",
        duration: "1 - 2 hari",
        price: 14000,
    },
    {
        company: "jnt",
        courier_name: "J&T",
        courier_service_name: "EZ",
        courier_service_code: "ez",
        duration: "1 - 2 hari",
        price: 16000,
    },
];

export async function searchAreas(query: string): Promise<BiteshipArea[]> {
    if (!query || query.length < 3) return [];

    // Need to use URLSearchParams properly
    const params = new URLSearchParams({
        countries: "ID",
        input: query,
        type: "single",
    });

    try {
        const response = await fetch(`${BITESHIP_BASE_URL}/maps/areas?${params}`, {
            headers: {
                Authorization: BITESHIP_API_KEY,
            },
        });

        const data = await response.json();

        if (!data.success) {
            console.error("Biteship search area error:", data);
            return [];
        }

        return data.areas || [];
    } catch (error) {
        console.error("Failed to fetch areas:", error);
        return [];
    }
}

export interface ShippingItem {
    name: string;
    description?: string;
    value: number;
    quantity: number;
    weight: number; // in grams
}

// Biteship Create Order Payload (sesuai dokumentasi resmi)
export interface CreateOrderPayload {
    // Origin (Shipper/Warehouse)
    origin_contact_name: string;
    origin_contact_phone: string;
    origin_address: string;
    origin_postal_code: number;
    origin_area_id?: string;
    
    // Destination (Customer)
    destination_contact_name: string;
    destination_contact_phone: string;
    destination_address: string;
    destination_postal_code: number;
    destination_area_id?: string;
    
    // Courier
    courier_company: string; // e.g., "jne"
    courier_type: string;    // e.g., "reg"
    
    // Delivery
    delivery_type: "now" | "scheduled";
    
    // Items
    items: ShippingItem[];
    
    // Optional
    order_note?: string;
}

export interface BiteshipOrderResponse {
    success: boolean;
    id: string;
    waybill_id: string; // Resi
    courier: {
        tracking_id: string;
        waybill_id: string;
        company: string;
        type: string;
    };
    price: number;
    status: string;
}

export interface BiteshipTrackingHistory {
    note: string;
    status: string;
    updated_at: string;
}

export interface BiteshipOrderDetail {
    success: boolean;
    id: string;
    status: string;
    courier: {
        company: string;
        type: string;
        tracking_id: string;
        waybill_id: string;
    };
    origin: {
        contact_name: string;
        contact_phone: string;
        address: string;
    };
    destination: {
        contact_name: string;
        contact_phone: string;
        address: string;
    };
    history: BiteshipTrackingHistory[];
}

export async function createShippingOrder(payload: CreateOrderPayload): Promise<BiteshipOrderResponse | null> {
    try {
        console.log("Biteship Create Order Payload:", JSON.stringify(payload, null, 2));
        
        const response = await fetch(`${BITESHIP_BASE_URL}/orders`, {
            method: "POST",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Biteship Create Order Response:", JSON.stringify(data, null, 2));

        if (!data.success) {
            console.error("Biteship Create Order Error:", JSON.stringify(data));
            return null;
        }

        return {
            success: true,
            id: data.id,
            waybill_id: data.courier?.waybill_id || data.courier?.tracking_id || "",
            courier: data.courier,
            price: data.price,
            status: data.status
        };
    } catch (error) {
        console.error("Failed to create shipping order:", error);
        return null;
    }
}

// Get order detail from Biteship (for tracking)
export async function getOrderDetail(biteshipOrderId: string): Promise<BiteshipOrderDetail | null> {
    try {
        const response = await fetch(`${BITESHIP_BASE_URL}/orders/${biteshipOrderId}`, {
            headers: {
                Authorization: BITESHIP_API_KEY,
            },
        });

        const data = await response.json();
        console.log("Biteship Get Order Response:", JSON.stringify(data, null, 2));

        if (!data.success) {
            console.error("Biteship Get Order Error:", JSON.stringify(data));
            return null;
        }

        return {
            success: true,
            id: data.id,
            status: data.status,
            courier: data.courier,
            origin: data.origin,
            destination: data.destination,
            history: data.history || []
        };
    } catch (error) {
        console.error("Failed to get order detail:", error);
        return null;
    }
}

export async function getRates(
    originAreaId: string,
    destinationAreaId: string,
    items: ShippingItem[]
): Promise<BiteshipRate[]> {
    // ... existing implementation ...
    try {
        const payload = {
            origin_area_id: originAreaId,
            destination_area_id: destinationAreaId,
            couriers: "jne,sicepat,jnt,tiki,pos,wahana,anteraja",
            items: items.map((item) => ({
                name: item.name,
                // Description required? usually optional
                value: item.value,
                quantity: item.quantity,
                weight: item.weight,
            })),
        };

        const response = await fetch(`${BITESHIP_BASE_URL}/rates/couriers`, {
            method: "POST",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.success) {
            console.warn("Biteship API Error (Using Dummy Rates):", data);
            // Fallback to DUMMY RATES if error is about balance or anything else
            return DUMMY_RATES;
        }

        return data.pricing || [];
    } catch (error) {
        console.error("Failed to fetch rates (Using Dummy Rates):", error);
        return DUMMY_RATES;
    }
}

import { Order, OrderStatus, OrderItem, Product, Shipment } from "@prisma/client";

export type SerializedOrder = {
    id: string;
    userId: string;
    totalAmount: number;
    status: OrderStatus;
    snapToken: string | null;
    createdAt: Date;
    items: (Omit<OrderItem, "price" | "order" | "product"> & {
        price: number;
        product: Omit<Product, "price" | "category" | "createdAt" | "updatedAt" | "deletedAt"> & {
            price: number;
            image: string;
        };
    })[];
    shipment: (Omit<Shipment, "cost" | "order"> & {
        cost: number;
    }) | null;
};

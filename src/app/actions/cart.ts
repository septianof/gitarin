"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get user's cart with items
export async function getCart() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Find or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.user.id },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    category: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        // Filter out items with deleted products
        const validItems = cart.items
            .filter((item) => !item.product.deletedAt)
            .map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    price: item.product.price.toString(),
                },
            }));

        // Calculate totals
        const subtotal = validItems.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);

        const totalWeight = validItems.reduce((sum, item) => {
            return sum + item.product.weight * item.quantity;
        }, 0);

        const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
            success: true,
            cart: {
                ...cart,
                items: validItems,
            },
            subtotal,
            totalWeight,
            itemCount,
        };
    } catch (error) {
        console.error("Get cart error:", error);
        return { success: false, error: "Gagal mengambil keranjang" };
    }
}

// Add item to cart
export async function addToCart(productId: string, quantity: number = 1) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Silakan login terlebih dahulu" };
        }

        // Check if product exists and has stock
        const product = await prisma.product.findUnique({
            where: { id: productId, deletedAt: null },
        });

        if (!product) {
            return { success: false, error: "Produk tidak ditemukan" };
        }

        if (product.stock < quantity) {
            return { success: false, error: "Stok tidak mencukupi" };
        }

        // Find or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.user.id },
            });
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
            },
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return { success: false, error: "Stok tidak mencukupi" };
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            // Create new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        revalidatePath("/keranjang");
        revalidatePath("/produk");

        return { success: true };
    } catch (error) {
        console.error("Add to cart error:", error);
        return { success: false, error: "Gagal menambahkan ke keranjang" };
    }
}

// Update cart item quantity
export async function updateCartItem(itemId: string, quantity: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        if (quantity < 1) {
            return await removeCartItem(itemId);
        }

        // Get cart item with product
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true,
            },
        });

        if (!cartItem || cartItem.cart.userId !== session.user.id) {
            return { success: false, error: "Item tidak ditemukan" };
        }

        if (quantity > cartItem.product.stock) {
            return { success: false, error: "Stok tidak mencukupi" };
        }

        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });

        revalidatePath("/keranjang");

        return { success: true };
    } catch (error) {
        console.error("Update cart item error:", error);
        return { success: false, error: "Gagal mengupdate keranjang" };
    }
}

// Remove item from cart
export async function removeCartItem(itemId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify ownership
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!cartItem || cartItem.cart.userId !== session.user.id) {
            return { success: false, error: "Item tidak ditemukan" };
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        revalidatePath("/keranjang");

        return { success: true };
    } catch (error) {
        console.error("Remove cart item error:", error);
        return { success: false, error: "Gagal menghapus item" };
    }
}

// Clear all items from cart
export async function clearCart() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        revalidatePath("/keranjang");

        return { success: true };
    } catch (error) {
        console.error("Clear cart error:", error);
        return { success: false, error: "Gagal mengosongkan keranjang" };
    }
}

// Get cart item count (for navbar badge)
export async function getCartCount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return 0;
        }

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

        if (!cart) return 0;

        // Only count items with valid (non-deleted) products
        return cart.items
            .filter((item) => !item.product.deletedAt)
            .reduce((sum, item) => sum + item.quantity, 0);
    } catch (error) {
        console.error("Get cart count error:", error);
        return 0;
    }
}

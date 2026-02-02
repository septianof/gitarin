import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { OrderList } from "@/components/order/OrderList";
import { getUserOrders } from "@/app/actions/order"; // We could use this, or fetch directly in server component

export const metadata = {
    title: "Daftar Pesanan - Gitarin",
};

interface OrderPageProps {
    searchParams: {
        status?: string;
    };
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch updated user data for Sidebar
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            photo: true,
        },
    });

    if (!user) {
        redirect("/login");
    }

    // Fetch Orders based on status param
    // We can use the server action logic here directly or call the function if it's safe (it is)
    // But better to use the exported function if possible or standard prisma call.
    // Let's use the exported function `getUserOrders` but wait, server actions are usually called from client.
    // For server component, we can just call the db directly or a data access layer.
    // Given the action `getUserOrders` returns a response object {success, orders}, let's just duplicate the prisma call or simple logic 
    // to avoid overhead or return shape issues, OR refactor getUserOrders to be a data fetcher.
    // Let's call getUserOrders since it's "use server" and callable.

    const params = await searchParams;
    const statusParam = params.status || "ALL";
    const result = await getUserOrders(statusParam);
    // @ts-ignore - getUserOrders returns a compatible shape but inferred type might slightly differ in strictness
    const orders = result.success && result.orders ? result.orders : [];

    return (
        <div className="flex flex-1 justify-center py-10 px-4 md:px-10 bg-gray-50/50 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col md:flex-row max-w-[1200px] w-full gap-8">
                {/* Sidebar Navigation */}
                <ProfileSidebar user={user} />

                {/* Main Content Area */}
                <main className="flex-1">
                    <OrderList initialOrders={orders as any} />
                </main>
            </div>
        </div>
    );
}

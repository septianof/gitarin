import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { OrderDetail } from "@/components/order/OrderDetail";
import { getOrder } from "@/app/actions/order";

export const metadata = {
    title: "Detail Pesanan - Gitarin",
};

interface OrderDetailPageProps {
    params: {
        id: string;
    };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    if (!id) {
        return notFound();
    }

    // Fetch order details
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="flex flex-1 justify-center py-10 px-6 lg:px-20 xl:px-40 bg-white min-h-[calc(100vh-80px)]">
            <div className="flex flex-col max-w-[1200px] w-full gap-8">
                {/* Main Content Area - Full Width */}
                <main className="flex-1">
                    {/* @ts-ignore - Serialized types strictness check */}
                    <OrderDetail order={order} />
                </main>
            </div>
        </div>
    );
}

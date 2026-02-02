import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Double check specific for layout (Middleware handles most, but this is safe)
    if (session.user.role !== "ADMIN" && session.user.role !== "GUDANG") {
        redirect("/");
    }

    const { name, email, role, photo } = session.user;

    return (
        <div className="flex flex-1 justify-center py-10 px-4 md:px-10 bg-gray-50/50 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col md:flex-row max-w-[1200px] w-full gap-8">
                <DashboardSidebar user={{ name, email, role, photo }} />
                <main className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit min-h-[500px]">
                    {children}
                </main>
            </div>
        </div>
    );
}

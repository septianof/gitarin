import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { ProfileForm } from "./profile-form";

export const metadata = {
    title: "Informasi Akun - Gitarin",
};

export default async function ProfilPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch updated user data
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

    return (
        <div className="flex flex-1 justify-center py-10 px-4 md:px-10 bg-gray-50/50 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col md:flex-row max-w-[1200px] w-full gap-8">
                {/* Sidebar Navigation */}
                <ProfileSidebar user={user} />

                {/* Main Form Area */}
                <main className="flex-1">
                    <ProfileForm user={user} />
                </main>
            </div>
        </div>
    );
}

import { auth } from "@/lib/auth";

export const metadata = {
    title: "Dashboard - Gitarin",
};

export default async function DashboardPage() {
    const session = await auth();
    const role = session?.user?.role;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900">
                    Dashboard {role === "ADMIN" ? "Admin" : "Gudang"}
                </h1>
                <p className="text-gray-500">
                    Selamat datang kembali, {session?.user?.name}!
                </p>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
                <p>
                    <strong>Status:</strong> Sistem Gudang Aktif.<br />
                    Silakan pilih menu di samping untuk mulai bekerja.
                </p>
            </div>
        </div>
    );
}

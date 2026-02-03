import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsers, getRoleOptions } from "@/app/actions/users";
import { UserTable } from "@/components/dashboard/UserTable";
import { UserActions } from "@/components/dashboard/UserActions";
import { UserFiltersAdmin } from "@/components/dashboard/UserFiltersAdmin";

export const metadata = {
    title: "Kelola Pengguna - Gitarin Admin",
};

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        role?: string;
    }>;
}

export default async function KelolaUsersPage({ searchParams }: PageProps) {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const role = params.role || "";

    const [usersResult, rolesResult] = await Promise.all([
        getUsers({ page, limit: 10, search, role }),
        getRoleOptions()
    ]);

    const users = usersResult.success ? usersResult.users : [];
    const pagination = usersResult.success ? usersResult.pagination : null;
    const roles = rolesResult.success ? rolesResult.roles : [];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Kelola Pengguna</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna aplikasi.</p>
                </div>
                <UserActions roles={roles || []} />
            </div>

            {/* Search & Filters */}
            <UserFiltersAdmin roles={roles || []} />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <UserTable 
                    users={users || []} 
                    roles={roles || []}
                    pagination={pagination || null}
                    currentUserId={session.user.id}
                />
            </div>
        </div>
    );
}

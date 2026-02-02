"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, Trash2, Loader2, ChevronLeft, ChevronRight, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormModal } from "./UserFormModal";
import { deleteUser } from "@/app/actions/users";

interface Role {
    value: string;
    label: string;
}

interface UserData {
    id: string;
    name: string | null;
    email: string;

    role: string;
    photo: string | null;
    createdAt: Date;
    _count: {
        orders: number;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UserTableProps {
    users: UserData[];
    roles: Role[];
    pagination: Pagination | null;
    currentUserId: string;
}

export function UserTable({ users, roles, pagination, currentUserId }: UserTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800";
            case "GUDANG":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(date));
    };

    const handleEdit = (user: UserData) => {
        setEditUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (id === currentUserId) {
            alert("Tidak dapat menghapus akun sendiri");
            return;
        }

        if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
            return;
        }

        setDeletingId(id);
        startTransition(async () => {
            const result = await deleteUser(id);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Gagal menghapus pengguna");
            }
            setDeletingId(null);
        });
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/dashboard/users?${params.toString()}`);
    };

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pengguna</h3>
                <p className="text-sm text-gray-500 text-center">
                    Pengguna yang terdaftar akan muncul di sini.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Pengguna
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Pesanan
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Terdaftar
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                            {user.photo ? (
                                                <Image
                                                    src={user.photo}
                                                    alt={user.name || "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-600">
                                                    <User className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 truncate max-w-[180px]">
                                                    {user.name || "Unnamed"}
                                                </p>
                                                {user.id === currentUserId && (
                                                    <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                                                        Anda
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-600">
                                        {user._count.orders} pesanan
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-600">
                                        {formatDate(user.createdAt)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(user)}
                                            className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deletingId === user.id || user.id === currentUserId}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {deletingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pengguna
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            Halaman {pagination.page} dari {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <UserFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditUser(null);
                }}
                roles={roles}
                user={editUser}
            />
        </>
    );
}

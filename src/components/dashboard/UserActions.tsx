"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormModal } from "./UserFormModal";

interface Role {
    value: string;
    label: string;
}

interface UserActionsProps {
    roles: Role[];
}

export function UserActions({ roles }: UserActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengguna
            </Button>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                roles={roles}
            />
        </>
    );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryFormModal } from "./CategoryFormModal";

export function CategoryActions() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
            >
                <Plus size={18} />
                Tambah Kategori
            </button>

            <CategoryFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                mode="create"
            />
        </>
    );
}

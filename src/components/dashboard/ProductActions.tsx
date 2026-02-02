"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFormModal } from "./ProductFormModal";

interface Category {
    id: number;
    name: string;
}

interface ProductActionsProps {
    categories: Category[];
}

export function ProductActions({ categories }: ProductActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
            </Button>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
            />
        </>
    );
}

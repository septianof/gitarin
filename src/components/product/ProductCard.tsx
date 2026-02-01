import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { ProductWithCategory } from "@/app/actions/products";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full">
            <Link href={`/produk/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-gray-100 flex items-center justify-center p-4">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
            </Link>

            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {product.category.name}
                </div>

                <Link href={`/produk/${product.slug}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-end justify-between mt-auto pt-4">
                    <div>
                        <p className="text-lg font-bold text-zinc-900">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                    </div>

                    <Button
                        size="icon"
                        className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

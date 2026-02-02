import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProductStat {
    id: string;
    name: string;
    category: string;
    image: string;
    sold: number;
    revenue: number;
    status: string;
}

export function TopProducts({ products }: { products: ProductStat[] }) {
    return (
        <div className="bg-white rounded-xl border border-[#f0f2f4] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#f0f2f4] flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#111417]">Produk Terlaris</h3>
                <Link href="/dashboard/produk" className="text-sm font-medium text-gray-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                    Lihat Semua <ArrowRight size={16} />
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-[#f8f9fa] border-b border-[#f0f2f4]">
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-wider">Nama Gitar</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-right">Jumlah Terjual</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-right">Total Pendapatan</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f4]">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-[#f8f9fa] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative size-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#111417] leading-tight line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Kategori: {product.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-700">
                                    {product.sold}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#111417]">
                                    {formatCurrency(product.revenue)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {product.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

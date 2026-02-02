import { OrderStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface QueueItem {
    id: string;
    date: Date;
    productName: string;
    courier: string;
    status: OrderStatus;
}

export function RecentQueue({ items }: { items: QueueItem[] }) {
    return (
        <div className="bg-white rounded-xl border border-[#f0f2f4] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-[#f8f9fa] border-b border-[#f0f2f4]">
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-wider">ID Pesanan</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Tanggal</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Produk</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Kurir</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f4]">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-[#111417]">
                                    #{item.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {item.date.toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-[#111417] font-medium">{item.productName}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-bold uppercase">
                                        {item.courier || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f4] text-[#111417]">
                                        <span className="size-1.5 rounded-full bg-[#111417]"></span>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Tidak ada antrian pengiriman saat ini via dashboard.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

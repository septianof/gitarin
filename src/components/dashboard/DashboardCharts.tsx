export function DashboardCharts() {
    // Mock Data for "Volume Pengiriman Harian"
    const dailyVolume = [
        { day: "Sen", value: 30 },
        { day: "Sel", value: 45 },
        { day: "Rab", value: 60 },
        { day: "Kam", value: 40 },
        { day: "Jum", value: 70 },
        { day: "Sab", value: 50 },
        { day: "Min", value: 85 },
    ];

    // Mock Data for "Distribusi Kurir"
    const courierDistribution = [
        { name: "JNE", value: 45, color: "bg-[#111417]" },
        { name: "J&T", value: 30, color: "bg-[#647587]" },
        { name: "POS", value: 15, color: "bg-[#a0aec0]" },
        { name: "Lain", value: 10, color: "bg-[#e2e8f0]" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume Chart */}
            <div className="bg-white rounded-xl border border-[#f0f2f4] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#111417]">Volume Pengiriman Harian</h3>
                    <span className="text-xs font-medium text-gray-500">Minggu Ini</span>
                </div>
                <div className="flex items-end justify-between h-40 gap-2">
                    {dailyVolume.map((item) => (
                        <div key={item.day} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                            <div
                                className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${item.value === 85 ? 'bg-[#111417]' : 'bg-[#f0f2f4]'}`}
                                style={{ height: `${item.value}%` }}
                            ></div>
                            <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-xl border border-[#f0f2f4] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#111417]">Distribusi Kurir</h3>
                </div>
                <div className="flex flex-col gap-4">
                    {courierDistribution.map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                            <span className="text-sm font-medium text-[#111417] w-10">{item.name}</span>
                            <div className="flex-1 h-3 rounded-full bg-[#f8f9fa] overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full`}
                                    style={{ width: `${item.value}%` }}
                                ></div>
                            </div>
                            <span className="text-sm text-gray-500 w-8 text-right">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

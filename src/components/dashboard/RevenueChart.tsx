"use client";

export function RevenueChart() {
    // Mock Data for Revenue Curve. 
    // Simplified SVG path for the wave effect shown in design.
    // In real app, use Recharts or Chart.js. Here using CSS/SVG for pure UI demo.

    return (
        <div className="bg-white rounded-xl border border-[#f0f2f4] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-bold text-[#111417]">Pendapatan Mingguan</h3>
                    <p className="text-sm text-gray-500">Grafik performa penjualan dalam 7 hari terakhir</p>
                </div>
                <div className="text-right">
                    <h3 className="text-2xl font-bold text-[#111417]">Rp 45.000.000</h3>
                    <p className="text-sm font-medium text-emerald-600">+15% <span className="text-gray-400 font-normal">vs minggu lalu</span></p>
                </div>
            </div>

            <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between px-4 pb-8 pointer-events-none">
                    <div className="border-t border-gray-100 w-full h-full"></div>
                    <div className="border-t border-gray-100 w-full h-full"></div>
                    <div className="border-t border-gray-100 w-full h-full"></div>
                </div>

                {/* SVG Line Chart */}
                <svg className="absolute bottom-8 left-0 w-full h-48 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#111417" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#111417" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,80 C15,70 25,50 35,50 C45,50 55,60 65,40 C75,20 85,30 100,20 V100 H0 Z"
                        fill="url(#gradient)"
                    />
                    <path
                        d="M0,80 C15,70 25,50 35,50 C45,50 55,60 65,40 C75,20 85,30 100,20"
                        fill="none"
                        stroke="#111417"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    {/* Data Points */}
                    <circle cx="35" cy="50" r="1.5" fill="#111417" />
                    <circle cx="65" cy="40" r="1.5" fill="#111417" />
                </svg>

                {/* Labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 uppercase tracking-wider font-medium px-2">
                    <span>Senin</span>
                    <span>Selasa</span>
                    <span>Rabu</span>
                    <span>Kamis</span>
                    <span>Jumat</span>
                    <span>Sabtu</span>
                    <span>Minggu</span>
                </div>
            </div>
        </div>
    );
}

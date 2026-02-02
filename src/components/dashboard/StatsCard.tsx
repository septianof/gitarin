import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtext: string;
    trend?: string;
    subtextClassName?: string;
}

export function StatsCard({ icon: Icon, label, value, subtext, trend, subtextClassName }: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 border border-[#f0f2f4] flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-[#f8f9fa] rounded-lg text-[#111417]">
                    <Icon size={20} />
                </div>
                {/* Optional Trend or Date could go here */}
            </div>

            <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-[#111417]">{value}</h3>
                    {trend && <span className="text-xs font-medium text-gray-500 mb-1.5">{trend}</span>}
                </div>
                <p className={`text-xs ${subtextClassName || 'text-gray-400'}`}>{subtext}</p>
            </div>
        </div>
    );
}

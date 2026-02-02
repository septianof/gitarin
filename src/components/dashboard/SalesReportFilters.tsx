"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SalesReportFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentStartDate = searchParams.get("startDate") || "";
    const currentEndDate = searchParams.get("endDate") || "";

    const [startDate, setStartDate] = useState(currentStartDate);
    const [endDate, setEndDate] = useState(currentEndDate);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        // Reset to page 1 when filtering
        
        startTransition(() => {
            router.push(`/dashboard/laporan?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        startTransition(() => {
            router.push("/dashboard/laporan");
        });
    };

    const hasActiveFilters = currentStartDate || currentEndDate;

    // Quick filter presets
    const setPreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Date Range */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Selesai</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreset(7)}
                        className="text-xs"
                    >
                        7 Hari
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreset(30)}
                        className="text-xs"
                    >
                        30 Hari
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreset(90)}
                        className="text-xs"
                    >
                        90 Hari
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2">
                    <Button
                        onClick={applyFilters}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white"
                        disabled={isPending}
                    >
                        Terapkan
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            disabled={isPending}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

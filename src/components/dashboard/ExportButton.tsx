"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            // Open in new window for print
            window.open("/api/reports/export", "_blank");
        } catch (error) {
            console.error("Export error:", error);
            alert("Gagal mengekspor laporan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isLoading}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuka...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                </>
            )}
        </Button>
    );
}

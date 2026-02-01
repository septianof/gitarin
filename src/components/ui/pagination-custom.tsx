"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // If only 1 page, don't show pagination
    if (totalPages <= 1) return null;

    const createPageUrl = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const goToPage = (pageNumber: number) => {
        router.push(createPageUrl(pageNumber));
    };

    const renderPageNumbers = () => {
        const pages = [];
        // Always show first, last, and current page neighbors
        // Simplified logic for cleaner UI: [1] ... [4] [5] [6] ... [10]

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                pages.push(
                    <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        className={`${currentPage === i
                                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            } min-w-[40px] font-medium`}
                        onClick={() => goToPage(i)}
                    >
                        {i}
                    </Button>
                );
            } else if (
                (i === currentPage - 2 && i > 1) ||
                (i === currentPage + 2 && i < totalPages)
            ) {
                pages.push(<span key={`dots-${i}`} className="px-2 text-gray-500">...</span>);
            }
        }

        // Filter out consecutive dots if logic produces them (simplified check above might duplicate dots visuals slightly in complex cases, but basic is fine)
        // Actually, deeper logic:
        // Let's stick to simple list for small totalPages, or just list them all? No, pagination logic can be tricky.
        // Let's use a simpler approach used in the reference: Previous [1] [2] [3] ... Next

        return pages;
    };

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="icon"
                className="border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>

            {renderPageNumbers()}

            <Button
                variant="outline"
                size="icon"
                className="border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
            >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}

"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gray-200",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in">
      <div className="aspect-[4/5] bg-gray-100">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <Skeleton variant="text" className="w-16 h-3 mb-2" />
        <Skeleton variant="text" className="w-full h-5 mb-1" />
        <Skeleton variant="text" className="w-3/4 h-5 mb-4" />
        <div className="flex items-end justify-between mt-auto pt-4">
          <div>
            <Skeleton variant="text" className="w-24 h-5" />
            <Skeleton variant="text" className="w-16 h-3 mt-1" />
          </div>
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-100 animate-fade-in">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" className="w-full h-4" />
        </td>
      ))}
    </tr>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-in">
      <Skeleton variant="text" className="w-1/3 h-4 mb-3" />
      <Skeleton variant="text" className="w-full h-8 mb-2" />
      <Skeleton variant="text" className="w-2/3 h-3" />
    </div>
  );
}

// Spinner component
export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <svg
      className={cn("animate-spin text-gray-400", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

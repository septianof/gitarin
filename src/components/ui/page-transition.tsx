"use client";

import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

// Staggered list animation wrapper
interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({ children, className, itemClassName }: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            "animate-fade-in opacity-0",
            itemClassName
          )}
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "forwards",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface AnimatedImageProps extends ImageProps {
  containerClassName?: string;
}

export function AnimatedImage({
  className,
  containerClassName,
  alt,
  onLoad,
  ...props
}: AnimatedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Placeholder skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-shimmer" />
      )}
      <Image
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        {...props}
      />
    </div>
  );
}

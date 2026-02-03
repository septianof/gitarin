"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UploadedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component for displaying uploaded images (from /uploads folder)
 * Uses unoptimized mode to work correctly in production
 * because dynamically uploaded images are not in the build cache
 */
export function UploadedImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  fallback,
}: UploadedImageProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no src or error loading, show fallback
  if (!src || error) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check if it's an uploaded image (local) or external
  const isUploadedImage = src.startsWith("/uploads/");

  // For uploaded images, use unoptimized to bypass Next.js image optimization
  // This fixes the issue where images uploaded after build don't show
  if (isUploadedImage) {
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
        />
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    );
  }

  // For external images, use Next.js Image optimization
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      onError={() => setError(true)}
    />
  );
}

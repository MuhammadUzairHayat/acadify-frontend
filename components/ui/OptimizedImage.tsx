"use client";

import Image from "next/image";
import { useMemo } from "react";

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

function parseHostname(src: string): string | null {
  try {
    return new URL(src).hostname;
  } catch {
    return null;
  }
}

function isOptimizableHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname === "img.youtube.com") return true;
  if (hostname.endsWith(".amazonaws.com")) return true;
  if (hostname.endsWith(".cloudfront.net")) return true;
  if (hostname.endsWith(".blob.core.windows.net")) return true;

  const extraHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return extraHosts.includes(hostname);
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  fill,
  sizes = "(max-width: 768px) 100vw, 400px",
  priority = false,
}: OptimizedImageProps) {
  const useNextImage = useMemo(() => {
    if (!src.startsWith("http://") && !src.startsWith("https://")) return false;
    const hostname = parseHostname(src);
    return hostname ? isOptimizableHost(hostname) : false;
  }, [src]);

  if (!src) return null;

  if (!useNextImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

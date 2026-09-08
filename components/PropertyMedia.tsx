'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PropertyMedia as PropertyMediaType } from '@/data/properties';
import { PROPERTY_IMAGE_BLUR_DATA_URL } from '@/lib/image-placeholder';

type PropertyMediaProps = {
  item?: PropertyMediaType | null;
  alt: string;
  priority?: boolean;
  sizes: string;
  loading?: 'eager' | 'lazy';
  onLoad?: () => void;
};

export function PropertyMedia({ item, alt, priority = false, sizes, loading, onLoad }: PropertyMediaProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [item?.src]);

  if (!item || item.available === false || failed) {
    return <div className="media-placeholder" role="img" aria-label={`${alt}: archivo pendiente`}>Archivo multimedia pendiente</div>;
  }

  if (item.kind === 'video') {
    return <video src={item.src} controls playsInline preload="metadata" aria-label={alt} onError={() => setFailed(true)} />;
  }

  return <Image
    src={item.src}
    alt={alt}
    fill
    priority={priority}
    loading={priority ? undefined : loading}
    placeholder="blur"
    blurDataURL={PROPERTY_IMAGE_BLUR_DATA_URL}
    quality={90}
    sizes={sizes}
    onLoad={onLoad}
    onError={() => setFailed(true)}
  />;
}

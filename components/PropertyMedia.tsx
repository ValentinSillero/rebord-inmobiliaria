'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PropertyMedia as PropertyMediaType } from '@/data/properties';

type PropertyMediaProps = {
  item?: PropertyMediaType | null;
  alt: string;
  priority?: boolean;
  sizes: string;
};

export function PropertyMedia({ item, alt, priority = false, sizes }: PropertyMediaProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [item?.src]);

  if (!item || item.available === false || failed) {
    return <div className="media-placeholder" role="img" aria-label={`${alt}: archivo pendiente`}>Archivo multimedia pendiente</div>;
  }

  if (item.kind === 'video') {
    return <video src={item.src} controls playsInline preload="metadata" aria-label={alt} onError={() => setFailed(true)} />;
  }

  return <Image src={item.src} alt={alt} fill priority={priority} quality={90} sizes={sizes} onError={() => setFailed(true)} />;
}

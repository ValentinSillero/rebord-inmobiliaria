'use client';

import Link from 'next/link';
import { Bath, BedDouble, ChevronLeft, ChevronRight, MapPin, Maximize, MessageCircle } from 'lucide-react';
import { useRef, useState, type TouchEvent } from 'react';
import type { Property } from '@/data/properties';
import { getCircularIndex } from '@/lib/carousel';
import { removeEmojis } from '@/lib/text';
import { propertyWhatsappUrl } from '@/lib/whatsapp';
import { PropertyMedia } from './PropertyMedia';

export function PropertyCard({ property }: { property: Property }) {
  const [currentImage, setCurrentImage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressNavigation = useRef(false);
  const images = property.media
    ? property.media.filter(item => item.kind === 'image')
    : property.gallery.map(src => ({ src, kind: 'image' as const }));
  const displayName = removeEmojis(property.name);
  const displayLocation = property.location ? removeEmojis(property.location) : null;
  const displayPrice = property.priceLabel ? removeEmojis(property.priceLabel) : null;

  function moveImage(step: number) {
    setCurrentImage(index => getCircularIndex(index, step, images.length));
  }

  function handleTouchStart(event: TouchEvent<HTMLAnchorElement>) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLAnchorElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || images.length < 2) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    event.preventDefault();
    event.stopPropagation();
    suppressNavigation.current = true;
    window.setTimeout(() => { suppressNavigation.current = false; }, 400);
    moveImage(deltaX < 0 ? 1 : -1);
  }

  const details = [
    property.bedrooms !== null ? <span key="bedrooms"><BedDouble />{property.bedrooms}</span> : null,
    property.bathrooms !== null ? <span key="bathrooms"><Bath />{property.bathrooms}</span> : null,
    property.area !== null ? <span key="area"><Maximize />{property.area} m²</span> : null,
  ].filter(Boolean);

  return <article className="property-card">
    <div className="property-image">
      <Link
        href={`/propiedades/${property.slug}`}
        className="property-image-link"
        aria-label={`Ver ${displayName}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={event => { if (suppressNavigation.current) event.preventDefault(); }}
      >
        <PropertyMedia item={images[currentImage] || null} alt={`${displayName} - foto ${currentImage + 1}`} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw" />
      </Link>
      <span className={`operation operation-${property.operation.toLowerCase()}`}>{property.operation}</span>
      {images.length > 1 && <>
        <button type="button" className="carousel-arrow carousel-arrow-left" aria-label={`Foto anterior de ${displayName}`} onClick={event => { event.preventDefault(); event.stopPropagation(); moveImage(-1); }}><ChevronLeft /></button>
        <button type="button" className="carousel-arrow carousel-arrow-right" aria-label={`Foto siguiente de ${displayName}`} onClick={event => { event.preventDefault(); event.stopPropagation(); moveImage(1); }}><ChevronRight /></button>
        <span className="photo-counter" aria-live="polite">{currentImage + 1} / {images.length}</span>
      </>}
    </div>
    <div className="property-body">
      <h3><Link href={`/propiedades/${property.slug}`}>{displayName}</Link></h3>
      {displayLocation && <p className="property-location"><MapPin /> {displayLocation}</p>}
      {details.length > 0 && <div className="property-details">{details}</div>}
      <div className="property-bottom">{displayPrice && <strong>{displayPrice}</strong>}<a aria-label={`Consultar por ${displayName} por WhatsApp`} href={propertyWhatsappUrl(displayName, property.operation)} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}><MessageCircle /></a></div>
    </div>
  </article>;
}

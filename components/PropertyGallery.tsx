'use client';

import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import type { PropertyMedia as PropertyMediaType } from '@/data/properties';
import { getCircularIndex } from '@/lib/carousel';
import { PropertyMedia } from './PropertyMedia';

type PropertyGalleryProps = {
  media: PropertyMediaType[];
  propertyName: string;
};

export function PropertyGallery({ media, propertyName }: PropertyGalleryProps) {
  const photos = media.filter(item => item.kind === 'image');
  const items = photos.length > 0 ? photos : media;
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const thumbnailStrip = useRef<HTMLDivElement | null>(null);
  const current = items[currentIndex] || null;

  useEffect(() => setCurrentIndex(0), [propertyName]);

  useEffect(() => {
    const strip = thumbnailStrip.current;
    const thumbnail = strip?.children.item(currentIndex) as HTMLElement | null;
    if (!strip || !thumbnail) return;

    const left = thumbnail.offsetLeft;
    const right = left + thumbnail.offsetWidth;
    if (left < strip.scrollLeft || right > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: left - (strip.clientWidth - thumbnail.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [currentIndex]);

  function move(step: number) {
    setCurrentIndex(index => getCircularIndex(index, step, items.length));
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || items.length < 2) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    event.preventDefault();
    move(deltaX < 0 ? 1 : -1);
  }

  return <section className="container property-gallery" aria-label={`Galería de ${propertyName}`}>
    <div className="property-gallery-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="property-gallery-media" key={current?.src || 'placeholder'}>
        <PropertyMedia item={current} alt={`${propertyName} - ${currentIndex + 1}`} priority sizes="(max-width: 767px) 100vw, 1280px" />
      </div>
      {items.length > 1 && <>
        <button type="button" className="gallery-arrow gallery-arrow-left" aria-label="Ver imagen anterior" onClick={() => move(-1)}><ChevronLeft /></button>
        <button type="button" className="gallery-arrow gallery-arrow-right" aria-label="Ver imagen siguiente" onClick={() => move(1)}><ChevronRight /></button>
      </>}
      {items.length > 0 && <span className="gallery-counter" aria-live="polite">{currentIndex + 1} / {items.length}</span>}
    </div>
    {items.length > 1 && <div className="property-thumbnails" aria-label="Seleccionar imagen" ref={thumbnailStrip}>
      {items.map((item, index) => <button
        type="button"
        key={item.src}
        className={`property-thumbnail ${index === currentIndex ? 'is-active' : ''}`}
        aria-label={`Ver ${item.kind === 'video' ? 'video' : 'imagen'} ${index + 1} de ${items.length}`}
        aria-pressed={index === currentIndex}
        onClick={() => setCurrentIndex(index)}
      >
        {item.kind === 'image'
          ? <PropertyMedia item={item} alt="" sizes="96px" />
          : <span className="video-thumbnail"><Play /><small>Video {index + 1}</small></span>}
      </button>)}
    </div>}
  </section>;
}

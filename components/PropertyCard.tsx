'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, Heart, MapPin, Maximize, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '@/data/properties';
import { propertyWhatsappMessage, whatsappUrl } from '@/lib/whatsapp';

export function PropertyCard({ property }: { property: Property }) {
  const [favorite, setFavorite] = useState(false);
  return <article className="property-card">
    <Link href={`/propiedades/${property.slug}`} className="property-image"><Image src={property.image} alt={property.name} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw" /><span className={`operation operation-${property.operation.toLowerCase()}`}>{property.operation}</span></Link>
    <button className={`favorite ${favorite ? 'is-favorite' : ''}`} aria-label="Guardar como favorita" onClick={() => setFavorite(!favorite)}><Heart fill={favorite ? 'currentColor' : 'none'} /></button>
    <div className="property-body"><h3><Link href={`/propiedades/${property.slug}`}>{property.name}</Link></h3><p className="property-location"><MapPin /> {property.location}</p>
      <div className="property-details"><span><BedDouble />{property.bedrooms}</span><span><Bath />{property.bathrooms}</span><span><Maximize />{property.area} m²</span></div>
      <div className="property-bottom"><strong>{property.priceLabel}</strong><a aria-label={`Consultar por ${property.name} por WhatsApp`} href={whatsappUrl(propertyWhatsappMessage(property.name))} target="_blank" onClick={e => e.stopPropagation()}><MessageCircle /></a></div>
    </div>
  </article>;
}

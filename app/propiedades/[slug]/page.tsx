import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Bath, BedDouble, Check, MapPin, Maximize, MessageCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { properties } from '@/data/properties';
import { propertyWhatsappMessage, whatsappUrl } from '@/lib/whatsapp';

export function generateStaticParams() { return properties.map(property => ({ slug: property.slug })); }
export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const property = properties.find(p => p.slug === slug); if (!property) notFound();
  const related = properties.filter(p => p.slug !== property.slug).slice(0, 3);
  return <><Header /><main className="detail-page"><section className="container detail-header"><span className={`operation operation-${property.operation.toLowerCase()}`}>{property.operation}</span><p className="eyebrow">{property.type} · {property.location}</p><h1>{property.name}</h1><div className="detail-price">{property.priceLabel}</div></section><section className="container gallery"><div className="gallery-main"><Image src={property.gallery[0]} alt={property.name} fill priority sizes="(max-width: 800px) 100vw, 66vw" /></div><div className="gallery-side">{property.gallery.slice(1, 3).map((image,i) => <div key={image}><Image src={image} alt={`${property.name} - vista ${i + 2}`} fill sizes="(max-width: 800px) 80vw, 33vw" /></div>)}</div></section><section className="container detail-content"><article><h2>Descripción</h2><p>{property.description}</p><h2>Características</h2><div className="features">{property.features.map(f => <span key={f}><Check /> {f}</span>)}</div><h2>Ubicación</h2><div className="location-box"><MapPin /><div><strong>{property.location}</strong><p>Consultanos para conocer la ubicación exacta y coordinar una visita.</p></div></div></article><aside className="detail-aside"><h3>Información de la propiedad</h3><div className="detail-specs"><span><BedDouble /> <b>{property.bedrooms}</b> Dormitorios</span><span><Bath /> <b>{property.bathrooms}</b> Baños</span><span><Maximize /> <b>{property.area} m²</b> Superficie</span></div><a className="button full-button" href={whatsappUrl(propertyWhatsappMessage(property.name))} target="_blank"><MessageCircle /> Consultar por WhatsApp</a><p>Respondemos tus consultas de forma personalizada.</p></aside></section><section className="section related"><div className="container"><div className="section-heading"><h2>También te puede interesar</h2></div><div className="property-grid related-grid">{related.map(p => <PropertyCard property={p} key={p.slug} />)}</div></div></section></main><Footer /><WhatsAppButton /></>;
}

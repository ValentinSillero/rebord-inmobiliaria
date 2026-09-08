import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { properties } from '@/data/properties';
import { PropertyCard } from './PropertyCard';

export function FeaturedProperties() {
  const selected = properties.filter(property => property.featured);
  const featured = selected.length > 0 ? selected : properties.slice(0, 4);
  return <section className="section featured-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">SELECCIÓN DESTACADA</p><h2>Propiedades destacadas</h2></div><Link href="/propiedades" className="text-link">Ver todas las propiedades <ArrowRight /></Link></div><div className="property-grid featured-grid">{featured.map(property => <PropertyCard key={property.slug} property={property} />)}</div></div></section>;
}

import { notFound } from 'next/navigation';
import { Bath, BedDouble, Maximize, MessageCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyDescription } from '@/components/PropertyDescription';
import { PropertyGallery } from '@/components/PropertyGallery';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { properties } from '@/data/properties';
import { parseInstagramDescription } from '@/lib/property-description';
import { removeEmojis } from '@/lib/text';
import { propertyWhatsappUrl } from '@/lib/whatsapp';

export function generateStaticParams() {
  return properties.map(property => ({ slug: property.slug }));
}

export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = properties.find(item => item.slug === slug);
  if (!property) notFound();

  const related = properties.filter(item => item.slug !== property.slug).slice(0, 3);
  const media = property.media || property.gallery.map(src => ({ src, kind: 'image' as const }));
  const hasSpecs = property.bedrooms !== null || property.bathrooms !== null || property.area !== null;
  const displayName = removeEmojis(property.name);
  const displayLocation = property.location ? removeEmojis(property.location) : null;
  const displayType = property.type ? removeEmojis(property.type) : null;
  const displayPrice = property.priceLabel ? removeEmojis(property.priceLabel) : null;
  const descriptionSections = property.descriptionSections || parseInstagramDescription(property.description, {
    title: property.name,
    priceText: property.priceLabel,
  });
  const context = [displayType, displayLocation].filter(Boolean).join(' · ');

  return <>
    <Header />
    <main className="detail-page">
      <section className="container detail-header">
        <BackButton fallbackHref="/propiedades" />
        <span className={`operation operation-${property.operation.toLowerCase()}`}>{property.operation}</span>
        {context && <p className="eyebrow">{context}</p>}
        <h1>{displayName}</h1>
        {displayPrice && <div className="detail-price">{displayPrice}</div>}
      </section>
      <PropertyGallery media={media} propertyName={displayName} />
      <section className="container detail-content">
        <PropertyDescription sections={descriptionSections} />
        <aside className="detail-aside">
          {hasSpecs && <><h3>Información de la propiedad</h3><div className="detail-specs">{property.bedrooms !== null && <span><BedDouble /> <b>{property.bedrooms}</b> Dormitorios</span>}{property.bathrooms !== null && <span><Bath /> <b>{property.bathrooms}</b> Baños</span>}{property.area !== null && <span><Maximize /> <b>{property.area} m²</b> Superficie</span>}</div></>}
          <a className="button full-button" href={propertyWhatsappUrl(displayName, property.operation)} target="_blank" rel="noreferrer"><MessageCircle /> Consultar por WhatsApp</a>
          <p>Atención personalizada para esta propiedad.</p>
        </aside>
      </section>
      <section className="section related"><div className="container"><div className="section-heading"><h2>También te puede interesar</h2></div><div className="property-grid related-grid">{related.map(item => <PropertyCard property={item} key={item.slug} />)}</div></div></section>
    </main>
    <Footer />
    <WhatsAppButton />
  </>;
}

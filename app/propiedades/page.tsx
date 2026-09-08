'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownUp } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertySearch } from '@/components/PropertySearch';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { properties, propertyFilterOptions } from '@/data/properties';
import { filterProperties, normalizeFilterText, normalizeOperation, normalizePropertyType, type PropertyCurrency, type PropertyFilterState } from '@/lib/property-filters';
import { Suspense, useMemo, useState } from 'react';

export default function PropertiesPage() {
  return <Suspense fallback={<><Header /><main className="listing-page"><section className="page-intro"><div className="container"><BackButton /><p className="eyebrow">NUESTRO CATÁLOGO</p><h1>Propiedades</h1></div></section></main><Footer /></>}><PropertiesContent /></Suspense>;
}

function PropertiesContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [sort, setSort] = useState('recent');
  const query = params.toString();
  const filters = useMemo<PropertyFilterState>(() => {
    const current = new URLSearchParams(query);
    const requestedLocation = normalizeFilterText(current.get('ubicacion') || '').replace(/,? entre rios$/, '');
    const location = propertyFilterOptions.locations.find(value => normalizeFilterText(value) === requestedLocation) || '';
    const currencyValue = current.get('moneda');
    const currency: PropertyCurrency | null = currencyValue === 'USD' || currencyValue === 'ARS' ? currencyValue : null;
    const maxPriceValue = Number(current.get('precio'));
    const bedroomValue = Number(current.get('dormitorios'));
    return {
      operation: normalizeOperation(current.get('operacion') || ''),
      type: normalizePropertyType(current.get('tipo') || ''),
      location,
      bedrooms: Number.isInteger(bedroomValue) && bedroomValue > 0 ? bedroomValue : null,
      currency,
      maxPrice: currency && Number.isFinite(maxPriceValue) && maxPriceValue > 0 ? maxPriceValue : null,
    };
  }, [query]);
  const hasFilters = Boolean(filters.operation || filters.type || filters.location || filters.bedrooms || filters.maxPrice);
  const results = useMemo(() => {
    const filtered = filterProperties(properties, filters);
    return [...filtered].sort((a,b) => {
      if (sort === 'recent') return 0;
      if (a.currency !== b.currency) {
        const currencyOrder = { USD: 0, ARS: 1 } as const;
        return (a.currency ? currencyOrder[a.currency] : 2) - (b.currency ? currencyOrder[b.currency] : 2);
      }
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return sort === 'low' ? a.price-b.price : b.price-a.price;
    });
  }, [filters, sort]);

  function clearFilters() {
    router.push('/propiedades');
  }

  const listingImageSizes = '(max-width: 360px) calc(100vw - 24px), (max-width: 767px) calc(100vw - 32px), (max-width: 1150px) calc(50vw - 36px), (max-width: 1280px) calc(33.333vw - 32px), 395px';

  return <><Header /><main className="listing-page"><section className="page-intro"><div className="container"><BackButton /><p className="eyebrow">NUESTRO CATÁLOGO</p><h1>Propiedades</h1><p>Explorá nuestro catálogo de propiedades.</p></div></section><section className="listing-content"><div className="container"><PropertySearch compact options={propertyFilterOptions} initialFilters={filters} key={query} /><div className="listing-top"><div className="listing-summary"><p>{results.length} propiedades encontradas</p>{hasFilters && <button type="button" className="clear-filters" onClick={clearFilters}>Limpiar filtros</button>}</div><label className="sort"><ArrowDownUp /><span>Ordenar por</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Más recientes</option><option value="low">Menor precio</option><option value="high">Mayor precio</option></select></label></div>{results.length ? <div className="property-grid listing-grid">{results.map((p, index) => <PropertyCard key={p.slug} property={p} priority={index < 3} imageSizes={listingImageSizes} />)}</div> : <div className="no-results"><h2>No encontramos propiedades con esos filtros.</h2><p>Probá ampliar tu búsqueda o consultanos para ayudarte a encontrar lo que necesitás.</p><button type="button" className="button no-results-clear" onClick={clearFilters}>Limpiar filtros</button></div>}</div></section></main><Footer /><WhatsAppButton /></>;
}

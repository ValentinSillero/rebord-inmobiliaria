'use client';

import { useSearchParams } from 'next/navigation';
import { ArrowDownUp } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertySearch } from '@/components/PropertySearch';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { properties } from '@/data/properties';
import { Suspense, useMemo, useState } from 'react';

export default function PropertiesPage() {
  return <Suspense fallback={<><Header /><main className="listing-page"><section className="page-intro"><div className="container"><p className="eyebrow">NUESTRO CATÁLOGO</p><h1>Propiedades</h1></div></section></main><Footer /></>}><PropertiesContent /></Suspense>;
}

function PropertiesContent() {
  const params = useSearchParams(); const [sort, setSort] = useState('recent');
  const results = useMemo(() => {
    const operation = params.get('operacion'); const type = params.get('tipo'); const location = params.get('ubicacion'); const maxPrice = Number(params.get('precio') || 0); const bedrooms = Number(params.get('dormitorios') || 0);
    const filtered = properties.filter(p => (!operation || p.operation === operation) && (!type || p.type === type) && (!location || p.location === location) && (!maxPrice || p.price <= maxPrice) && (!bedrooms || p.bedrooms === bedrooms));
    return [...filtered].sort((a,b) => sort === 'low' ? a.price-b.price : sort === 'high' ? b.price-a.price : 0);
  }, [params, sort]);
  return <><Header /><main className="listing-page"><section className="page-intro"><div className="container"><p className="eyebrow">NUESTRO CATÁLOGO</p><h1>Propiedades</h1><p>Explorá nuestro catálogo de propiedades.</p></div></section><section className="listing-content"><div className="container"><PropertySearch compact /><div className="listing-top"><p>{results.length} propiedades encontradas</p><label className="sort"><ArrowDownUp /><span>Ordenar por</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Más recientes</option><option value="low">Menor precio</option><option value="high">Mayor precio</option></select></label></div>{results.length ? <div className="property-grid listing-grid">{results.map(p => <PropertyCard key={p.slug} property={p} />)}</div> : <div className="no-results"><h2>No encontramos propiedades con esos filtros</h2><p>Probá ampliar tu búsqueda o consultanos para ayudarte a encontrar lo que necesitás.</p></div>}</div></section></main><Footer /><WhatsAppButton /></>;
}

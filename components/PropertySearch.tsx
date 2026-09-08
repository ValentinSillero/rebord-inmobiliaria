'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import type { PropertyFilterOptions, PropertyFilterState } from '@/lib/property-filters';

type SearchProps = {
  compact?: boolean;
  options: PropertyFilterOptions;
  initialFilters?: PropertyFilterState;
};

const emptyFilters: PropertyFilterState = {
  operation: '',
  type: '',
  location: '',
  bedrooms: null,
  currency: null,
  maxPrice: null,
};

export function PropertySearch({ compact = false, options, initialFilters = emptyFilters }: SearchProps) {
  const router = useRouter();
  const [operation, setOperation] = useState(initialFilters.operation);
  const [type, setType] = useState(initialFilters.type);
  const [location, setLocation] = useState(initialFilters.location);
  const [price, setPrice] = useState(initialFilters.currency && initialFilters.maxPrice ? `${initialFilters.currency}:${initialFilters.maxPrice}` : '');
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms?.toString() || '');

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (operation) params.set('operacion', operation);
    if (type) params.set('tipo', type);
    if (location) params.set('ubicacion', location);
    if (price) {
      const [currency, amount] = price.split(':');
      params.set('moneda', currency);
      params.set('precio', amount);
    }
    if (bedrooms) params.set('dormitorios', bedrooms);
    router.push(`/propiedades${params.size ? `?${params}` : ''}`);
  }

  return <form className={`property-search ${compact ? 'property-search-page' : ''}`} onSubmit={submit}>
    <label>Operación<select value={operation} onChange={event => setOperation(event.target.value)}><option value="">Todas</option>{options.operations.map(value => <option value={value} key={value}>{value}</option>)}</select></label>
    <label>Tipo de propiedad<select value={type} onChange={event => setType(event.target.value)}><option value="">Todas</option>{options.types.map(value => <option value={value} key={value}>{value}</option>)}</select></label>
    <label>Ubicación<select value={location} onChange={event => setLocation(event.target.value)}><option value="">Todas</option>{options.locations.map(value => <option value={value} key={value}>{value}</option>)}</select></label>
    {compact && <label>Dormitorios<select value={bedrooms} onChange={event => setBedrooms(event.target.value)}><option value="">Todos</option>{options.bedrooms.map(value => <option value={value} key={value}>{value}+</option>)}</select></label>}
    <label>Precio<select value={price} onChange={event => setPrice(event.target.value)}><option value="">Sin límite</option>{(['USD', 'ARS'] as const).map(currency => <optgroup label={currency} key={currency}>{options.prices.filter(option => option.currency === currency).map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</optgroup>)}</select></label>
    <button className="button search-button" type="submit"><Search /> Buscar</button>
  </form>;
}

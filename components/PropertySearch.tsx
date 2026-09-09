'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  createPropertyFilterSearchParams,
  createFacetedPropertyFilterOptions,
  type PropertyCurrency,
  type PropertyFilterOptions,
  type PropertyFilterRecord,
  type PropertyFilterState,
} from '@/lib/property-filters';

type SearchProps = {
  compact?: boolean;
  options: PropertyFilterOptions;
  facetRecords?: PropertyFilterRecord[];
  initialFilters?: PropertyFilterState;
  initialSort?: 'recent' | 'low' | 'high';
};

const emptyFilters: PropertyFilterState = {
  operation: '',
  type: '',
  location: '',
  bedrooms: null,
  currency: null,
  maxPrice: null,
};

function priceValue(filters: PropertyFilterState) {
  return filters.currency && filters.maxPrice ? `${filters.currency}:${filters.maxPrice}` : '';
}

export function PropertySearch({ compact = false, options, facetRecords, initialFilters = emptyFilters, initialSort = 'recent' }: SearchProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const navigationPending = useRef(false);
  const availableOptions = useMemo(() => facetRecords
    ? createFacetedPropertyFilterOptions(facetRecords, filters, options)
    : options, [facetRecords, filters, options]);

  function navigate(nextFilters: PropertyFilterState) {
    const params = createPropertyFilterSearchParams(nextFilters);
    if (compact && initialSort !== 'recent') params.set('orden', initialSort);
    params.set('page', '1');
    router.push(`/propiedades?${params.toString()}`);
  }

  function updateFilters(update: Partial<PropertyFilterState>) {
    if (facetRecords) navigationPending.current = true;
    setFilters(current => ({ ...current, ...update }));
  }

  useEffect(() => {
    if (!facetRecords) return;

    if (filters.type && !availableOptions.types.includes(filters.type)) {
      navigationPending.current = true;
      setFilters(current => ({ ...current, type: '' }));
      return;
    }
    if (filters.location && !availableOptions.locations.includes(filters.location)) {
      navigationPending.current = true;
      setFilters(current => ({ ...current, location: '' }));
      return;
    }
    if (filters.bedrooms && !availableOptions.bedrooms.includes(filters.bedrooms)) {
      navigationPending.current = true;
      setFilters(current => ({ ...current, bedrooms: null }));
      return;
    }
    if (priceValue(filters) && !availableOptions.prices.some(option => option.value === priceValue(filters))) {
      navigationPending.current = true;
      setFilters(current => ({ ...current, currency: null, maxPrice: null }));
      return;
    }
    if (navigationPending.current) {
      navigationPending.current = false;
      if (compact) navigate(filters);
    }
  }, [availableOptions, facetRecords, filters]);

  function submit(event: FormEvent) {
    event.preventDefault();
    navigationPending.current = false;
    navigate(filters);
  }

  function changePrice(value: string) {
    if (!value) {
      updateFilters({ currency: null, maxPrice: null });
      return;
    }
    const [currency, amount] = value.split(':');
    updateFilters({ currency: currency as PropertyCurrency, maxPrice: Number(amount) });
  }

  return <form className={`property-search ${compact ? 'property-search-page' : ''}`} onSubmit={submit}>
    <label>Operación<select value={filters.operation} onChange={event => updateFilters({ operation: event.target.value })}><option value="">Todas</option>{availableOptions.operations.map(value => <option value={value} key={value}>{value}</option>)}</select></label>
    <label>Tipo de propiedad<select value={filters.type} onChange={event => updateFilters({ type: event.target.value })}><option value="">Todas</option>{availableOptions.types.map(value => <option value={value} key={value}>{value}</option>)}</select></label>
    <label>Ubicación<select value={filters.location} onChange={event => updateFilters({ location: event.target.value })}><option value="">Todas</option>{availableOptions.locations.map(value => <option value={value} key={value}>{value}</option>)}</select></label>
    {compact && <label>Dormitorios<select value={filters.bedrooms?.toString() || ''} onChange={event => updateFilters({ bedrooms: event.target.value ? Number(event.target.value) : null })}><option value="">Todos</option>{availableOptions.bedrooms.map(value => <option value={value} key={value}>{value}+</option>)}</select></label>}
    <label>Precio<select value={priceValue(filters)} onChange={event => changePrice(event.target.value)}><option value="">Sin límite</option>{(['USD', 'ARS'] as const).map(currency => {
      const prices = availableOptions.prices.filter(option => option.currency === currency);
      return prices.length > 0 ? <optgroup label={currency} key={currency}>{prices.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</optgroup> : null;
    })}</select></label>
    <button className="button search-button" type="submit"><Search /> Buscar</button>
  </form>;
}

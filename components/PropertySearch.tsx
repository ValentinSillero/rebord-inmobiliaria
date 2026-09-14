'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibleSelect, type AccessibleSelectOption } from '@/components/AccessibleSelect';
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

  const operationOptions: AccessibleSelectOption[] = [
    { value: '', label: 'Todas' },
    ...availableOptions.operations.map(value => ({ value, label: value })),
  ];
  const typeOptions: AccessibleSelectOption[] = [
    { value: '', label: 'Todas' },
    ...availableOptions.types.map(value => ({ value, label: value })),
  ];
  const locationOptions: AccessibleSelectOption[] = [
    { value: '', label: 'Todas' },
    ...availableOptions.locations.map(value => ({ value, label: value })),
  ];
  const bedroomOptions: AccessibleSelectOption[] = [
    { value: '', label: 'Todos' },
    ...availableOptions.bedrooms.map(value => ({ value: value.toString(), label: `${value}+` })),
  ];
  const priceOptions: AccessibleSelectOption[] = [
    { value: '', label: 'Sin límite' },
    ...availableOptions.prices.map(option => ({
      value: option.value,
      label: option.label,
      group: option.currency,
    })),
  ];

  return <form className={`property-search ${compact ? 'property-search-page' : ''}`} onSubmit={submit}>
    <AccessibleSelect id="operation-filter" label="Operación" value={filters.operation} options={operationOptions} onChange={value => updateFilters({ operation: value })} />
    <AccessibleSelect id="type-filter" label="Tipo de propiedad" value={filters.type} options={typeOptions} onChange={value => updateFilters({ type: value })} />
    <AccessibleSelect id="location-filter" label="Ubicación" value={filters.location} options={locationOptions} onChange={value => updateFilters({ location: value })} />
    {compact && <AccessibleSelect id="bedrooms-filter" label="Dormitorios" value={filters.bedrooms?.toString() || ''} options={bedroomOptions} onChange={value => updateFilters({ bedrooms: value ? Number(value) : null })} />}
    <AccessibleSelect id="price-filter" label="Precio" value={priceValue(filters)} options={priceOptions} onChange={changePrice} />
    <button className="button search-button" type="submit"><Search /> Buscar</button>
  </form>;
}

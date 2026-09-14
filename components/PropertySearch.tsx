'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  appliedFilters?: PropertyFilterState;
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

export function PropertySearch({ compact = false, options, facetRecords, appliedFilters = emptyFilters, initialSort = 'recent' }: SearchProps) {
  const router = useRouter();
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  const availableOptions = useMemo(() => facetRecords
    ? createFacetedPropertyFilterOptions(facetRecords, draftFilters, options)
    : options, [draftFilters, facetRecords, options]);

  function navigate(nextFilters: PropertyFilterState) {
    const params = createPropertyFilterSearchParams(nextFilters);
    if (compact && initialSort !== 'recent') params.set('orden', initialSort);
    params.set('page', '1');
    router.push(`/propiedades?${params.toString()}`);
  }

  function updateDraftFilters(update: Partial<PropertyFilterState>) {
    setDraftFilters(current => ({ ...current, ...update }));
  }

  useEffect(() => {
    if (!facetRecords) return;

    if (draftFilters.type && !availableOptions.types.includes(draftFilters.type)) {
      setDraftFilters(current => ({ ...current, type: '' }));
      return;
    }
    if (draftFilters.location && !availableOptions.locations.includes(draftFilters.location)) {
      setDraftFilters(current => ({ ...current, location: '' }));
      return;
    }
    if (draftFilters.bedrooms && !availableOptions.bedrooms.includes(draftFilters.bedrooms)) {
      setDraftFilters(current => ({ ...current, bedrooms: null }));
      return;
    }
    if (priceValue(draftFilters) && !availableOptions.prices.some(option => option.value === priceValue(draftFilters))) {
      setDraftFilters(current => ({ ...current, currency: null, maxPrice: null }));
    }
  }, [availableOptions, draftFilters, facetRecords]);

  function submit(event: FormEvent) {
    event.preventDefault();
    navigate(draftFilters);
  }

  function changePrice(value: string) {
    if (!value) {
      updateDraftFilters({ currency: null, maxPrice: null });
      return;
    }
    const [currency, amount] = value.split(':');
    updateDraftFilters({ currency: currency as PropertyCurrency, maxPrice: Number(amount) });
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
    <AccessibleSelect id="operation-filter" label="Operación" value={draftFilters.operation} options={operationOptions} onChange={value => updateDraftFilters({ operation: value })} />
    <AccessibleSelect id="type-filter" label="Tipo de propiedad" value={draftFilters.type} options={typeOptions} onChange={value => updateDraftFilters({ type: value })} />
    <AccessibleSelect id="location-filter" label="Ubicación" value={draftFilters.location} options={locationOptions} onChange={value => updateDraftFilters({ location: value })} />
    {compact && <AccessibleSelect id="bedrooms-filter" label="Dormitorios" value={draftFilters.bedrooms?.toString() || ''} options={bedroomOptions} onChange={value => updateDraftFilters({ bedrooms: value ? Number(value) : null })} />}
    <AccessibleSelect id="price-filter" label="Precio" value={priceValue(draftFilters)} options={priceOptions} onChange={changePrice} />
    <button className="button search-button" type="submit"><Search /> Buscar</button>
  </form>;
}

'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { AccessibleSelect, type AccessibleSelectOption } from '@/components/AccessibleSelect';
import {
  createPropertyFilterSearchParams,
  createFacetedPropertyFilterOptions,
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
  minPriceExclusive: null,
};

function initialPriceSelection(filters: PropertyFilterState, options: PropertyFilterOptions) {
  if (filters.minPriceExclusive) return `above:${filters.minPriceExclusive}`;
  if (!filters.maxPrice) return '';
  return options.prices.some(option => option.comparison === 'max' && option.amount === filters.maxPrice)
    ? `max:${filters.maxPrice}`
    : 'custom';
}

export function PropertySearch({ compact = false, options, facetRecords, appliedFilters = emptyFilters, initialSort = 'recent' }: SearchProps) {
  const router = useRouter();
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  const [priceSelection, setPriceSelection] = useState(() => initialPriceSelection(appliedFilters, options));
  const [customPrice, setCustomPrice] = useState(() => (
    appliedFilters.maxPrice && initialPriceSelection(appliedFilters, options) === 'custom'
      ? appliedFilters.maxPrice.toString()
      : ''
  ));
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
  }, [availableOptions, draftFilters, facetRecords]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (priceSelection === 'custom' && (!draftFilters.maxPrice || draftFilters.maxPrice <= 0)) return;
    navigate(draftFilters);
  }

  function changePrice(value: string) {
    setPriceSelection(value);
    if (!value) {
      updateDraftFilters({ currency: null, maxPrice: null, minPriceExclusive: null });
      return;
    }
    if (value === 'custom') {
      const amount = Number(customPrice);
      updateDraftFilters({
        currency: 'USD',
        maxPrice: Number.isSafeInteger(amount) && amount > 0 ? amount : null,
        minPriceExclusive: null,
      });
      return;
    }
    const option = options.prices.find(item => item.value === value);
    if (!option) return;
    updateDraftFilters({
      currency: 'USD',
      maxPrice: option.comparison === 'max' ? option.amount : null,
      minPriceExclusive: option.comparison === 'above' ? option.amount : null,
    });
  }

  function changeCustomPrice(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value && !/^\d+$/.test(value)) return;
    const amount = Number(value);
    if (value && (!Number.isSafeInteger(amount) || amount <= 0)) return;
    setCustomPrice(value);
    updateDraftFilters({ currency: 'USD', maxPrice: value ? amount : null, minPriceExclusive: null });
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
    { value: 'custom', label: 'Personalizado' },
    ...availableOptions.prices.map(option => ({
      value: option.value,
      label: option.label,
    })),
  ];

  return <form className={`property-search${compact ? ' property-search-page' : ''}${priceSelection === 'custom' ? ' has-custom-price' : ''}`} onSubmit={submit}>
    <AccessibleSelect id="operation-filter" label="Operación" value={draftFilters.operation} options={operationOptions} onChange={value => updateDraftFilters({ operation: value })} />
    <AccessibleSelect id="type-filter" label="Tipo de propiedad" value={draftFilters.type} options={typeOptions} onChange={value => updateDraftFilters({ type: value })} />
    <AccessibleSelect id="location-filter" label="Ubicación" value={draftFilters.location} options={locationOptions} onChange={value => updateDraftFilters({ location: value })} />
    {compact && <AccessibleSelect id="bedrooms-filter" label="Dormitorios" value={draftFilters.bedrooms?.toString() || ''} options={bedroomOptions} onChange={value => updateDraftFilters({ bedrooms: value ? Number(value) : null })} />}
    <AccessibleSelect id="price-filter" label="Precio" value={priceSelection} options={priceOptions} onChange={changePrice} />
    {priceSelection === 'custom' && <label className="search-filter custom-price-field" htmlFor="custom-price-filter">
      <span className="search-filter-label">Precio personalizado</span>
      <input
        className="custom-price-input"
        id="custom-price-filter"
        inputMode="numeric"
        min="1"
        onChange={changeCustomPrice}
        placeholder="Precio máximo en USD"
        required
        step="1"
        type="number"
        value={customPrice}
      />
    </label>}
    <button className="button search-button" type="submit"><Search /> Buscar</button>
  </form>;
}

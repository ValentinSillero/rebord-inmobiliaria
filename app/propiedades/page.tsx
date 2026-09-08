import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/BackButton';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Pagination } from '@/components/Pagination';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertySearch } from '@/components/PropertySearch';
import { SortSelect, type PropertySort } from '@/components/SortSelect';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { properties, propertyFilterOptions, propertyFilterRecords } from '@/data/properties';
import {
  filterProperties,
  normalizeFilterText,
  normalizeOperation,
  normalizePropertyType,
  type PropertyCurrency,
  type PropertyFilterState,
} from '@/lib/property-filters';

const PROPERTIES_PER_PAGE = 12;
const listingImageSizes = '(max-width: 360px) calc(100vw - 24px), (max-width: 767px) calc(100vw - 32px), (max-width: 1150px) calc(50vw - 36px), (max-width: 1280px) calc(33.333vw - 32px), 395px';

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function toQueryString(searchParams: RawSearchParams) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach(item => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  });

  return params.toString();
}

function getFilters(searchParams: RawSearchParams): PropertyFilterState {
  const requestedLocation = normalizeFilterText(firstValue(searchParams.ubicacion)).replace(/,? entre rios$/, '');
  const location = propertyFilterOptions.locations.find(value => normalizeFilterText(value) === requestedLocation) || '';
  const currencyValue = firstValue(searchParams.moneda);
  const currency: PropertyCurrency | null = currencyValue === 'USD' || currencyValue === 'ARS' ? currencyValue : null;
  const maxPriceValue = Number(firstValue(searchParams.precio));
  const bedroomValue = Number(firstValue(searchParams.dormitorios));

  return {
    operation: normalizeOperation(firstValue(searchParams.operacion)),
    type: normalizePropertyType(firstValue(searchParams.tipo)),
    location,
    bedrooms: Number.isInteger(bedroomValue) && bedroomValue > 0 ? bedroomValue : null,
    currency,
    maxPrice: currency && Number.isFinite(maxPriceValue) && maxPriceValue > 0 ? maxPriceValue : null,
  };
}

function getSort(value: string): PropertySort {
  return value === 'low' || value === 'high' ? value : 'recent';
}

function getPage(value: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const currentSearchParams = await searchParams;
  const filters = getFilters(currentSearchParams);
  const sort = getSort(firstValue(currentSearchParams.orden));
  const filteredProperties = filterProperties(properties, filters);
  const sortedProperties = sort === 'recent' ? filteredProperties : [...filteredProperties].sort((a, b) => {
    if (a.currency !== b.currency) {
      const currencyOrder = { USD: 0, ARS: 1 } as const;
      return (a.currency ? currencyOrder[a.currency] : 2) - (b.currency ? currencyOrder[b.currency] : 2);
    }
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return sort === 'low' ? a.price - b.price : b.price - a.price;
  });
  const totalResults = sortedProperties.length;
  const totalPages = Math.ceil(totalResults / PROPERTIES_PER_PAGE);
  const requestedPageValue = firstValue(currentSearchParams.page);
  const requestedPage = getPage(requestedPageValue);
  const currentPage = Math.min(requestedPage, Math.max(totalPages, 1));
  if (requestedPageValue && requestedPageValue !== currentPage.toString()) {
    const normalizedParams = new URLSearchParams(toQueryString(currentSearchParams));
    normalizedParams.set('page', currentPage.toString());
    redirect(`/propiedades?${normalizedParams.toString()}`);
  }
  const pageStart = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const pageProperties = sortedProperties.slice(pageStart, pageStart + PROPERTIES_PER_PAGE);
  const hasFilters = Boolean(filters.operation || filters.type || filters.location || filters.bedrooms || filters.maxPrice);
  const queryString = toQueryString(currentSearchParams);

  return <>
    <Header />
    <main className="listing-page">
      <section className="page-intro">
        <div className="container">
          <BackButton />
          <p className="eyebrow">NUESTRO CATÁLOGO</p>
          <h1>Propiedades</h1>
          <p>Explorá nuestro catálogo de propiedades.</p>
        </div>
      </section>
      <section className="listing-content">
        <div className="container">
          <PropertySearch
            compact
            options={propertyFilterOptions}
            facetRecords={propertyFilterRecords}
            initialFilters={filters}
            initialSort={sort}
            key={JSON.stringify(filters)}
          />
          <div className="listing-top" id="propiedades-listado">
            <div className="listing-summary">
              <p>{totalResults} propiedades encontradas</p>
              {hasFilters && <Link href="/propiedades" className="clear-filters">Limpiar filtros</Link>}
            </div>
            <SortSelect value={sort} queryString={queryString} />
          </div>
          {pageProperties.length ? <>
            <div className="property-grid listing-grid">
              {pageProperties.map((property, index) => <PropertyCard
                key={property.slug}
                property={property}
                priority={index < 3}
                imageSizes={listingImageSizes}
              />)}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} queryString={queryString} />
          </> : <div className="no-results">
            <h2>No encontramos propiedades con esos filtros.</h2>
            <p>Probá ampliar tu búsqueda o consultanos para ayudarte a encontrar lo que necesitás.</p>
            <Link href="/propiedades" className="button no-results-clear">Limpiar filtros</Link>
          </div>}
        </div>
      </section>
    </main>
    <Footer />
    <WhatsAppButton />
  </>;
}

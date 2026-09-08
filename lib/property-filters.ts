export type PropertyCurrency = 'USD' | 'ARS';

export type PropertyKind =
  | 'Casa'
  | 'Departamento'
  | 'Terreno'
  | 'Dúplex'
  | 'Galpón'
  | 'Campo'
  | 'Local comercial'
  | 'Fondo de comercio'
  | 'PH'
  | 'Complejo turístico'
  | 'Desarrollo'
  | 'Propiedad';

export type PropertyFilterState = {
  operation: string;
  type: string;
  location: string;
  bedrooms: number | null;
  currency: PropertyCurrency | null;
  maxPrice: number | null;
};

export type PropertyPriceOption = {
  value: string;
  label: string;
  currency: PropertyCurrency;
  amount: number;
};

export type PropertyFilterOptions = {
  operations: string[];
  types: string[];
  locations: string[];
  bedrooms: number[];
  prices: PropertyPriceOption[];
};

export type PropertyFilterRecord = {
  operation: string;
  type: string | null;
  location: string | null;
  bedrooms: number | null;
  bedroomCounts?: number[];
  price: number | null;
  prices?: number[];
  currency?: PropertyCurrency | null;
};

const numberWords: Record<string, number> = {
  un: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
};

export function normalizeFilterText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCount(value: string) {
  const normalized = normalizeFilterText(value);
  return /^\d+$/.test(normalized) ? Number(normalized) : numberWords[normalized] || null;
}

function uniqueCounts(matches: IterableIterator<RegExpMatchArray>) {
  const values = [...matches]
    .map(match => parseCount(match[1]))
    .filter((value): value is number => value !== null && value > 0);
  return [...new Set(values)].sort((a, b) => a - b);
}

export function deriveBedroomCounts(text: string) {
  return uniqueCounts(text.matchAll(/\b(\d+|un|una|dos|tres|cuatro|cinco|seis)\s+(?:habitaciones?|dormitorios?)\b/gi));
}

export function deriveRoomCounts(text: string) {
  const explicit = uniqueCounts(text.matchAll(/\b(\d+|un|una|dos|tres|cuatro|cinco|seis)\s+ambientes?\b/gi));
  if (/\bmonoambientes?\b/i.test(text) && !explicit.includes(1)) explicit.unshift(1);
  return explicit;
}

export function derivePropertyType(title: string, description: string, detectedType?: string): PropertyKind {
  const detected = detectedType ? normalizePropertyType(detectedType) : '';
  if (detected) return detected;

  const heading = normalizeFilterText(title);
  const body = normalizeFilterText(description);

  if (/\ben pozo\b/.test(heading)) return 'Desarrollo';
  if (/\bcomplejo turistico\b/.test(heading)) return 'Complejo turístico';
  if (/\bfondo de comercio\b/.test(heading)) return 'Fondo de comercio';
  if (/\bph\b/.test(heading)) return 'PH';
  if (/\blocal(?:es)? comercial(?:es)?\b/.test(heading)) return 'Local comercial';
  if (/\bgalpon(?:es)?\b/.test(heading)) return 'Galpón';
  if (/\bduplex\b/.test(heading)) return 'Dúplex';
  if (/\b(?:departamentos?|dptos?|monoambientes?)\b/.test(heading)) return 'Departamento';
  if (/\bcasas?\b/.test(heading)) return 'Casa';
  if (/\bcampos?\b/.test(heading)) return 'Campo';
  if (/\b(?:lotes?|loteo|terrenos?)\b/.test(heading)) return 'Terreno';
  if (/\bpropiedad(?:es)?\b|\besquina\b/.test(heading)) return 'Propiedad';

  if (/\bcomplejo turistico\b/.test(body)) return 'Complejo turístico';
  if (/\blocales? comerciales?\b/.test(body)) return 'Local comercial';
  if (/\bduplex\b/.test(body)) return 'Dúplex';
  if (/\b(?:departamentos?|dptos?|monoambientes?)\b/.test(body)) return 'Departamento';
  if (/\bcasas?\b/.test(body)) return 'Casa';
  return 'Propiedad';
}

export function derivePropertyLocation(title: string, description: string, locationLines: string[], detectedLocation?: string) {
  const source = normalizeFilterText([title, ...locationLines, description].join(' '));
  if (detectedLocation !== undefined) {
    const heading = normalizeFilterText(title);
    if (/\bpronunciamiento\b/.test(heading)) return 'Pronunciamiento';
    if (/\bubajay\b/.test(heading)) return 'Ubajay';
  }

  if (/\bel brillante\b/.test(source)) return 'El Brillante';
  if (/\bla paloma\b/.test(source)) return 'La Paloma';
  if (/\bvilla elisa\b/.test(source)) return 'Villa Elisa';
  if (/\bconcepcion del uruguay\b/.test(source)) return 'Concepción del Uruguay';
  if (/\bejido(?: rural)?(?: de)? san jose\b|\bzona ejido de san jose\b/.test(source)) return 'Ejido de San José';
  if (/\bejido(?: rural)?(?: de)? colon\b/.test(source)) return 'Ejido de Colón';
  if (/\bcolonia hocker\b/.test(source)) return 'Colonia Hocker';
  if (/\bcolonia hugues\b/.test(source)) return 'Colonia Hugues';
  if (/\bsan jose\b/.test(source)) return 'San José';
  if (/\bcolon\b/.test(source)) return 'Colón';
  if (detectedLocation !== undefined) {
    if (/\bcapilla del monte\b/.test(source)) return 'Capilla del Monte';
    if (/\bmiramar\b/.test(source)) return 'Miramar';

    const detected = normalizeFilterText(detectedLocation);
    if (detected === 'pronunciamiento') return 'Pronunciamiento';
    if (detected === 'ubajay') return 'Ubajay';
    if (detected === 'colon') return 'Colón';
    if (detected === 'san jose') return 'San José';
    if (detected === 'concepcion del uruguay') return 'Concepción del Uruguay';
    if (detected === 'villa elisa') return 'Villa Elisa';
  }
  return null;
}

function parseAmount(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function derivePriceData(priceLabel: string | null): { currency: PropertyCurrency | null; prices: number[]; price: number | null } {
  if (!priceLabel) return { currency: null, prices: [] as number[], price: null };

  const usd = [...priceLabel.matchAll(/(?:us\$|u\$s|usd)\s*([\d.]+(?:,\d+)?)/gi)]
    .map(match => parseAmount(match[1]))
    .filter((value): value is number => value !== null);
  const ars = [...priceLabel.matchAll(/(^|[^a-z])\$\s*([\d.]+(?:,\d+)?)/gi)]
    .map(match => parseAmount(match[2]))
    .filter((value): value is number => value !== null);

  const currency: PropertyCurrency | null = usd.length > 0 && ars.length === 0 ? 'USD' : ars.length > 0 && usd.length === 0 ? 'ARS' : null;
  const prices = [...new Set(currency === 'USD' ? usd : currency === 'ARS' ? ars : [])].sort((a, b) => a - b);
  return { currency, prices, price: prices[0] ?? null };
}

export function normalizeOperation(value: string) {
  const normalized = normalizeFilterText(value);
  if (['venta', 'sale'].includes(normalized)) return 'Venta';
  if (['alquiler', 'rent'].includes(normalized)) return 'Alquiler';
  return '';
}

export function normalizePropertyType(value: string) {
  const normalized = normalizeFilterText(value);
  if (['lote', 'lotes', 'loteo', 'terreno', 'terrenos'].includes(normalized)) return 'Terreno';
  if (normalized === 'duplex') return 'Dúplex';
  const types: PropertyKind[] = ['Casa', 'Departamento', 'Terreno', 'Dúplex', 'Galpón', 'Campo', 'Local comercial', 'Fondo de comercio', 'PH', 'Complejo turístico', 'Desarrollo', 'Propiedad'];
  return types.find(type => normalizeFilterText(type) === normalized) || '';
}

function pickThresholds(values: number[], limit = 6) {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length <= limit) return unique;
  const indexes = Array.from({ length: limit }, (_, index) => Math.round(index * (unique.length - 1) / (limit - 1)));
  return [...new Set(indexes.map(index => unique[index]))];
}

export function createPropertyFilterOptions(properties: PropertyFilterRecord[]): PropertyFilterOptions {
  const operations = [...new Set(properties.map(property => normalizeOperation(property.operation)).filter(Boolean))];
  const types = [...new Set(properties.map(property => property.type).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es'));
  const locations = [...new Set(properties.map(property => property.location).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es'));
  const bedrooms = [...new Set(properties.flatMap(property => property.bedroomCounts || (property.bedrooms ? [property.bedrooms] : [])))].sort((a, b) => a - b);
  const formatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const prices = (['USD', 'ARS'] as const).flatMap(currency => pickThresholds(properties
    .filter(property => property.currency === currency)
    .flatMap(property => property.prices || (property.price ? [property.price] : [])))
    .map(amount => ({ currency, amount, value: `${currency}:${amount}`, label: `Hasta ${currency} ${formatter.format(amount)}` })));

  return { operations, types, locations, bedrooms, prices };
}

export function createFacetedPropertyFilterOptions(
  properties: PropertyFilterRecord[],
  filters: PropertyFilterState,
  baseOptions: PropertyFilterOptions,
): PropertyFilterOptions {
  const operations = new Set<string>();
  const types = new Set<string>();
  const locations = new Set<string>();
  let maximumBedrooms = 0;
  const minimumPrices: Partial<Record<PropertyCurrency, number>> = {};

  for (const property of properties) {
    const bedroomCounts = property.bedroomCounts || (property.bedrooms ? [property.bedrooms] : []);
    const prices = property.prices || (property.price ? [property.price] : []);
    const operationMatches = !filters.operation || property.operation === filters.operation;
    const typeMatches = !filters.type || property.type === filters.type;
    const locationMatches = !filters.location || property.location === filters.location;
    const bedroomsMatch = !filters.bedrooms || bedroomCounts.some(count => count >= filters.bedrooms!);
    const priceMatches = !filters.currency || !filters.maxPrice
      || (property.currency === filters.currency && prices.some(price => price <= filters.maxPrice!));

    // Operación remains a top-level switch, but its values still come only from real data.
    const operation = normalizeOperation(property.operation);
    if (operation) operations.add(operation);

    if (operationMatches && locationMatches && bedroomsMatch && priceMatches && property.type) {
      types.add(property.type);
    }
    if (operationMatches && typeMatches && bedroomsMatch && priceMatches && property.location) {
      locations.add(property.location);
    }
    if (operationMatches && typeMatches && locationMatches && priceMatches && bedroomCounts.length > 0) {
      maximumBedrooms = Math.max(maximumBedrooms, ...bedroomCounts);
    }
    if (operationMatches && typeMatches && locationMatches && bedroomsMatch && property.currency && prices.length > 0) {
      const minimum = Math.min(...prices);
      minimumPrices[property.currency] = Math.min(minimumPrices[property.currency] ?? Number.POSITIVE_INFINITY, minimum);
    }
  }

  return {
    operations: baseOptions.operations.filter(value => operations.has(value)),
    types: baseOptions.types.filter(value => types.has(value)),
    locations: baseOptions.locations.filter(value => locations.has(value)),
    bedrooms: baseOptions.bedrooms.filter(value => value <= maximumBedrooms),
    prices: baseOptions.prices.filter(option => {
      const minimum = minimumPrices[option.currency];
      return minimum !== undefined && minimum <= option.amount;
    }),
  };
}

export function filterProperties<T extends PropertyFilterRecord>(properties: T[], filters: PropertyFilterState) {
  const operation = normalizeOperation(filters.operation);
  const type = normalizePropertyType(filters.type);
  const location = normalizeFilterText(filters.location);

  return properties.filter(property => {
    const bedroomCounts = property.bedroomCounts || (property.bedrooms ? [property.bedrooms] : []);
    const prices = property.prices || (property.price ? [property.price] : []);
    return (!operation || normalizeOperation(property.operation) === operation)
      && (!type || property.type === type)
      && (!location || normalizeFilterText(property.location || '') === location)
      && (!filters.bedrooms || bedroomCounts.some(count => count >= filters.bedrooms!))
      && (!filters.currency || !filters.maxPrice || (property.currency === filters.currency && prices.some(price => price <= filters.maxPrice!)));
  });
}

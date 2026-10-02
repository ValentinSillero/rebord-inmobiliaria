import assert from 'node:assert/strict';
import { properties, propertyFilterOptions } from '../data/properties';
import {
  createPropertyFilterSearchParams,
  derivePriceData,
  filterProperties,
  parsePropertyFilterState,
  type PropertyFilterRecord,
  type PropertyFilterState,
} from '../lib/property-filters';

const emptyFilters: PropertyFilterState = {
  operation: '',
  type: '',
  location: '',
  bedrooms: null,
  currency: null,
  maxPrice: null,
  minPriceExclusive: null,
};

function upTo(maxPrice: number) {
  return { ...emptyFilters, currency: 'USD' as const, maxPrice };
}

for (const threshold of [50000, 100000, 300000]) {
  const results = filterProperties(properties, upTo(threshold));
  assert(results.length > 0, `No hubo resultados hasta USD ${threshold}.`);
  assert(results.every(property => (
    property.currency === 'USD'
    && (property.prices || []).some(price => price <= threshold)
  )), `El rango hasta USD ${threshold} incluyó un precio inválido.`);
}

const above300000 = filterProperties(properties, {
  ...emptyFilters,
  currency: 'USD',
  minPriceExclusive: 300000,
});
assert(above300000.length > 0, 'No hubo resultados por encima de USD 300.000.');
assert(above300000.every(property => (
  property.currency === 'USD'
  && (property.prices || []).some(price => price > 300000)
)), 'Más de USD 300.000 incluyó un valor igual, inferior o de otra moneda.');

const custom120000 = filterProperties(properties, upTo(120000));
assert(custom120000.length > 0, 'El precio personalizado no devolvió resultados.');
assert(custom120000.every(property => (
  property.currency === 'USD'
  && (property.prices || []).some(price => price <= 120000)
)), 'El precio personalizado incluyó un precio inválido.');

const unreliableRecords: PropertyFilterRecord[] = [
  { operation: 'Venta', type: 'Casa', location: 'Colón', bedrooms: 2, price: null, prices: [], currency: null },
  { operation: 'Venta', type: 'Casa', location: 'Colón', bedrooms: 2, price: 50000, prices: [50000], currency: 'ARS' },
];
assert.equal(derivePriceData(null).price, null);
assert.equal(derivePriceData('Consultar precio').price, null);
assert.equal(filterProperties(unreliableRecords, upTo(100000)).length, 0, 'Se incluyó una propiedad sin precio USD confiable.');

const parsedCustom = parsePropertyFilterState({ precio: '120000', page: '1' }, propertyFilterOptions);
assert.equal(parsedCustom.currency, 'USD');
assert.equal(parsedCustom.maxPrice, 120000);
assert.equal(parsedCustom.minPriceExclusive, null);
assert.equal(
  createPropertyFilterSearchParams(parsedCustom).get('precio'),
  '120000',
  'El precio personalizado no se conservó en la URL.',
);

const parsedAbove = parsePropertyFilterState({ precioMin: '300000' }, propertyFilterOptions);
assert.equal(parsedAbove.minPriceExclusive, 300000);
assert.equal(parsedAbove.maxPrice, null);

const combined = filterProperties(properties, {
  ...upTo(100000),
  operation: 'Venta',
  type: 'Casa',
});
for (let offset = 0; offset < combined.length; offset += 12) {
  assert(combined.slice(offset, offset + 12).length <= 12, 'La paginación excedió 12 propiedades.');
}

assert.deepEqual(
  propertyFilterOptions.prices.map(option => option.label),
  [
    'Hasta USD 50.000',
    'Hasta USD 100.000',
    'Hasta USD 150.000',
    'Hasta USD 200.000',
    'Hasta USD 250.000',
    'Hasta USD 300.000',
    'Más de USD 300.000',
  ],
);

console.log(JSON.stringify({
  ranges: {
    upTo50000: filterProperties(properties, upTo(50000)).length,
    upTo100000: filterProperties(properties, upTo(100000)).length,
    upTo300000: filterProperties(properties, upTo(300000)).length,
    above300000: above300000.length,
    custom120000: custom120000.length,
  },
  exclusions: ['sin precio', 'Consultar precio', 'ARS', 'formato no confiable'],
  pageSize: 12,
  status: 'ok',
}, null, 2));

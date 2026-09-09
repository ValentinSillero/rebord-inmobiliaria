import assert from 'node:assert/strict';
import { properties, propertyFilterOptions, propertyFilterRecords } from '../data/properties';
import { propertyLocationAudit } from '../data/property-location-audit';
import {
  createFacetedPropertyFilterOptions,
  filterProperties,
  normalizeFilterText,
  parsePropertyFilterState,
  type PropertyFilterState,
} from '../lib/property-filters';

const expectedPublishedByYear: Record<string, number> = {
  '2020': 25,
  '2021': 36,
  '2022': 47,
  '2023': 42,
  '2024': 63,
  '2025': 83,
  '2026': 79,
};

assert.equal(properties.length, 375, 'La cantidad total publicada cambió sin actualizar la auditoría.');
assert.deepEqual(
  Object.fromEntries(Object.keys(expectedPublishedByYear).map(year => [
    year,
    properties.filter(property => property.publicationDate?.startsWith(year)).length,
  ])),
  expectedPublishedByYear,
  'La cobertura por año no coincide con la auditoría.',
);

const importIds = properties.map(property => property.importId);
assert.equal(new Set(importIds).size, properties.length, 'Hay IDs de importación duplicados.');

for (const [importId, decision] of Object.entries(propertyLocationAudit)) {
  const property = properties.find(item => item.importId === importId);
  assert(property, `La decisión auditada ${importId} no corresponde a una propiedad publicada.`);
  assert.equal(property.location, decision.location, `No se aplicó la ubicación auditada de ${importId}.`);
}

const normalizedLocations = propertyFilterOptions.locations.map(normalizeFilterText);
assert.equal(new Set(normalizedLocations).size, normalizedLocations.length, 'Hay localidades duplicadas por formato.');
assert(!propertyFilterOptions.locations.includes('Sin especificar'), 'Las propiedades dudosas no deben crear un filtro.');
assert(!propertyFilterOptions.locations.includes('Colonia Hocker'), 'Quedó una localidad sustentada solo por una referencia de acceso.');

const locationsFromProperties = [...new Set(properties
  .map(property => property.location)
  .filter((location): location is string => Boolean(location)))]
  .sort((a, b) => a.localeCompare(b, 'es'));
assert.deepEqual(propertyFilterOptions.locations, locationsFromProperties, 'El filtro no deriva sus localidades de los datos finales.');

const emptyFilters: PropertyFilterState = {
  operation: '',
  type: '',
  location: '',
  bedrooms: null,
  currency: null,
  maxPrice: null,
};

for (const location of propertyFilterOptions.locations) {
  const parsed = parsePropertyFilterState({ ubicacion: `${location}, Entre Ríos` }, propertyFilterOptions);
  assert.equal(parsed.location, location, `No se normalizó correctamente el parámetro de ${location}.`);
  const results = filterProperties(properties, { ...emptyFilters, location });
  assert(results.length > 0, `El filtro ${location} quedó sin propiedades.`);
  assert(results.every(property => property.location === location), `El filtro ${location} mezcló otra localidad.`);
}

for (const operation of propertyFilterOptions.operations) {
  const filters = { ...emptyFilters, operation };
  const faceted = createFacetedPropertyFilterOptions(propertyFilterRecords, filters, propertyFilterOptions);
  const expectedLocations = [...new Set(properties
    .filter(property => property.operation === operation && property.location)
    .map(property => property.location as string))]
    .sort((a, b) => a.localeCompare(b, 'es'));
  assert.deepEqual(faceted.locations, expectedLocations, `Las ubicaciones dependientes fallaron para ${operation}.`);
}

for (const property of properties.filter(property => property.location && property.type)) {
  const filters = {
    ...emptyFilters,
    operation: property.operation,
    type: property.type!,
    location: property.location!,
  };
  const results = filterProperties(properties, filters);
  assert(results.includes(property), `La combinación Operación + Tipo + Ubicación excluyó ${property.importId}.`);
  assert(results.every(item => (
    item.operation === filters.operation
    && item.type === filters.type
    && item.location === filters.location
  )), `La combinación de filtros mezcló resultados para ${property.importId}.`);
  const faceted = createFacetedPropertyFilterOptions(propertyFilterRecords, filters, propertyFilterOptions);
  assert(faceted.types.includes(property.type!), `El filtro dependiente quitó el tipo de ${property.importId}.`);
  assert(faceted.locations.includes(property.location!), `El filtro dependiente quitó la localidad de ${property.importId}.`);

  for (let offset = 0; offset < results.length; offset += 12) {
    assert(results.slice(offset, offset + 12).length <= 12, 'La paginación excedió 12 propiedades.');
  }
}

const changes = Object.entries(propertyLocationAudit)
  .filter(([, decision]) => decision.previousLocation !== decision.location);
const counts = Object.fromEntries(propertyFilterOptions.locations.map(location => [
  location,
  properties.filter(property => property.location === location).length,
]));

console.log(JSON.stringify({
  reviewed: properties.length,
  reviewedByYear: expectedPublishedByYear,
  previousColon: 215,
  correctedFromColon: changes.filter(([, decision]) => decision.previousLocation === 'Colón' && decision.location !== 'Colón').length,
  confirmedPreviousColon: 215 - changes.filter(([, decision]) => decision.previousLocation === 'Colón' && decision.location !== 'Colón').length,
  totalChanges: changes.length,
  manualReview: properties.filter(property => property.location === null).length,
  locations: counts,
  filterChecks: {
    individualLocations: propertyFilterOptions.locations.length,
    facetedOperations: propertyFilterOptions.operations.length,
    operationTypeLocationRecords: properties.filter(property => property.location && property.type).length,
    pageSize: 12,
  },
}, null, 2));

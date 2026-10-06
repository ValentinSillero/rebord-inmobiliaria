import instagramImport2020 from './import/rebord_importacion_web_2020.json';
import instagramImport2021 from './import/rebord_importacion_web_2021.json';
import instagramImport2022 from './import/rebord_importacion_web_2022.json';
import instagramImport2023 from './import/rebord_importacion_web_2023.json';
import instagramImport2024 from './import/rebord_importacion_web_2024.json';
import instagramImport2025 from './import/rebord_importacion_web_2025.json';
import instagramImport2026 from './import/rebord_importacion_web_2026.json';
import cloudinaryMediaMap from './cloudinary-media-map.json';
import { auditedPropertyLocation } from './property-location-audit';
import { removeEmojis } from '@/lib/text';
import { cleanInstagramDescription, parseInstagramDescription, type PropertyDescriptionSections } from '@/lib/property-description';
import {
  createPropertyFilterOptions,
  deriveBedroomCounts,
  derivePriceData,
  derivePropertyLocation,
  derivePropertyType,
  deriveRoomCounts,
  type PropertyCurrency,
  type PropertyFilterRecord,
  type PropertyKind,
} from '@/lib/property-filters';

export type PropertyMedia = {
  src: string;
  kind: 'image' | 'video';
  available?: boolean;
};

export type Property = {
  slug: string;
  operation: 'Venta' | 'Alquiler';
  type: PropertyKind | null;
  name: string;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  price: number | null;
  prices?: number[];
  currency?: PropertyCurrency | null;
  priceLabel: string | null;
  image: string | null;
  gallery: string[];
  media?: PropertyMedia[];
  description: string;
  features: string[];
  rooms: number | null;
  bedroomCounts?: number[];
  roomCounts?: number[];
  featured?: boolean;
  importId?: string;
  publicationDate?: string;
  originalMediaPaths?: string[];
  descriptionSections?: PropertyDescriptionSections;
};

type InstagramImport = {
  fecha_publicacion: string;
  titulo_instagram: string;
  descripcion_instagram: string;
  operacion_detectada: 'venta' | 'alquiler' | 'sin_definir';
  tipo_detectado?: string;
  localidad_detectada?: string;
  precio_texto?: string | null;
  media: string[];
  id_importacion: string;
  slug_sugerido: string;
  estado_web: string;
};

const unavailableStatus = /\b(?:vendidas?|vendidos?|alquiladas?|alquilados?|venta\s+realizada)(?=$|[^\p{Letter}\p{Number}])|\bse\s+vendi[oó](?=$|[^\p{Letter}\p{Number}])/iu;
const imageExtension = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const omittedImportIds = new Set(['REB-2025-036', 'REB-2022-003']);
const nonPropertyImportIds = new Set(['REB-2021-029']);

// La auditoría de Cloudinary valida que todos los medios publicados estén disponibles.
const instagramMediaAvailable = true;

function operationFromOriginal(post: InstagramImport): Property['operation'] {
  // El título es la fuente prioritaria. Esto corrige dos etiquetas derivadas
  // inconsistentes del JSON sin reinterpretar el contenido de Instagram.
  if (/\b(?:venta|vende|venden)\b/i.test(post.titulo_instagram)) return 'Venta';
  if (/\b(?:alquiler|alquila|alquilan)\b/i.test(post.titulo_instagram)) return 'Alquiler';
  return post.operacion_detectada === 'alquiler' ? 'Alquiler' : 'Venta';
}

function publicMediaPath(path: string) {
  if (/^https:\/\//i.test(path)) return path;
  const localPath = `/${path.replace(/^\/+/, '')}`;
  const cloudinaryUrl = (cloudinaryMediaMap as Record<string, string>)[localPath];

  if (!cloudinaryUrl) {
    throw new Error(`Falta la URL de Cloudinary para ${localPath}`);
  }

  return cloudinaryUrl;
}

function repairLegacyImportText(text: string) {
  if (!/[ÃÂâðïã]/.test(text) || [...text].some(character => character.codePointAt(0)! > 255)) return text;

  const bytes = Uint8Array.from([...text], character => character.codePointAt(0)!);

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes).replace(/\uFFFD/g, '');
  }
}

function deriveLegacyPriceText(description: string) {
  const lines = description
    .split(/\r?\n/)
    .map(line => removeEmojis(line))
    .filter(line => /\b(?:precio|valor)\b/i.test(line));
  return lines.length > 0 ? lines.join('\n') : null;
}

const recentPosts = instagramImport2026 as InstagramImport[];
const recentSlugs = new Set(recentPosts.map(post => post.slug_sugerido));

function transformInstagramPosts(posts: InstagramImport[], resolveSlug = (post: InstagramImport) => post.slug_sugerido, recognizeCompactSurfaces = false) {
  return posts
  .filter(post => post.estado_web === 'publicar')
  .filter(post => !omittedImportIds.has(post.id_importacion))
  .filter(post => !nonPropertyImportIds.has(post.id_importacion))
  .filter(post => !unavailableStatus.test(`${post.titulo_instagram}\n${post.descripcion_instagram}`))
  .map(post => {
    const media: PropertyMedia[] = post.media.map(path => ({
      src: publicMediaPath(path),
      kind: imageExtension.test(path) ? 'image' : 'video',
      available: instagramMediaAvailable,
    }));
    const gallery = media.filter(item => item.kind === 'image').map(item => item.src);
    const priceText = post.precio_texto === undefined ? deriveLegacyPriceText(post.descripcion_instagram) : post.precio_texto;
    const description = cleanInstagramDescription(post.descripcion_instagram);
    const descriptionSections = parseInstagramDescription(post.descripcion_instagram, {
      title: post.titulo_instagram,
      priceText,
      recognizeCompactSurfaces,
    });
    const bedroomCounts = deriveBedroomCounts(description);
    const roomCounts = deriveRoomCounts(description);
    const priceData = derivePriceData(priceText);
    const legacyPriceIsDisplayable = priceData.price !== null || /\bconsult/i.test(priceText || '');

    return {
      slug: resolveSlug(post),
      operation: operationFromOriginal(post),
      type: derivePropertyType(post.titulo_instagram, description, post.tipo_detectado),
      name: removeEmojis(post.titulo_instagram),
      location: auditedPropertyLocation(post.id_importacion, derivePropertyLocation(post.titulo_instagram, description, descriptionSections.location)),
      bedrooms: bedroomCounts.length === 1 ? bedroomCounts[0] : null,
      bathrooms: null,
      area: null,
      price: priceData.price,
      prices: priceData.prices,
      currency: priceData.currency,
      priceLabel: priceText && (post.precio_texto !== undefined || legacyPriceIsDisplayable) ? removeEmojis(priceText) : null,
      image: gallery[0] || null,
      gallery,
      media,
      description,
      descriptionSections,
      features: [],
      rooms: roomCounts.length === 1 ? roomCounts[0] : null,
      bedroomCounts,
      roomCounts,
      importId: post.id_importacion,
      publicationDate: post.fecha_publicacion,
      originalMediaPaths: [...post.media],
    };
  });
}

const importedProperties2026 = transformInstagramPosts(recentPosts);
const importedProperties2025 = transformInstagramPosts(instagramImport2025 as InstagramImport[], post => (
  recentSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2025` : post.slug_sugerido
), true);
const occupiedSlugs = new Set([...importedProperties2026, ...importedProperties2025].map(property => property.slug));
const importedProperties2024 = transformInstagramPosts(instagramImport2024 as InstagramImport[], post => {
  const baseSlug = occupiedSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2024` : post.slug_sugerido;
  let slug = baseSlug;
  let suffix = 2;
  while (occupiedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  occupiedSlugs.add(slug);
  return slug;
}, true);
const importedProperties2023 = transformInstagramPosts(instagramImport2023 as InstagramImport[], post => {
  const baseSlug = occupiedSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2023` : post.slug_sugerido;
  let slug = baseSlug;
  let suffix = 2;
  while (occupiedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  occupiedSlugs.add(slug);
  return slug;
}, true);
const importedProperties2022 = transformInstagramPosts((instagramImport2022 as InstagramImport[]).map(post => ({
  ...post,
  titulo_instagram: repairLegacyImportText(post.titulo_instagram),
  descripcion_instagram: repairLegacyImportText(post.descripcion_instagram),
})), post => {
  const baseSlug = occupiedSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2022` : post.slug_sugerido;
  let slug = baseSlug;
  let suffix = 2;
  while (occupiedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  occupiedSlugs.add(slug);
  return slug;
}, true);
const importedProperties2021 = transformInstagramPosts((instagramImport2021 as InstagramImport[]).map(post => ({
  ...post,
  titulo_instagram: repairLegacyImportText(post.titulo_instagram),
  descripcion_instagram: repairLegacyImportText(post.descripcion_instagram),
})), post => {
  const baseSlug = occupiedSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2021` : post.slug_sugerido;
  let slug = baseSlug;
  let suffix = 2;
  while (occupiedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  occupiedSlugs.add(slug);
  return slug;
}, true);
const importedProperties2020 = transformInstagramPosts((instagramImport2020 as InstagramImport[]).map(post => ({
  ...post,
  titulo_instagram: repairLegacyImportText(post.titulo_instagram),
  descripcion_instagram: repairLegacyImportText(post.descripcion_instagram),
})), post => {
  const baseSlug = occupiedSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2020` : post.slug_sugerido;
  let slug = baseSlug;
  let suffix = 2;
  while (occupiedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  occupiedSlugs.add(slug);
  return slug;
}, true);

function propertyMedia(paths: string[], kind: PropertyMedia['kind']): PropertyMedia[] {
  return paths.map(src => ({ src, kind, available: true }));
}

const casaPuebloLiebigLocalMedia = Array.from(
  { length: 14 },
  (_, index) => `/propiedades/2026/casa-pueblo-liebig/${String(index + 1).padStart(2, '0')}.jpeg.jpeg`,
);
const casaPuebloLiebigGallery = casaPuebloLiebigLocalMedia.map(publicMediaPath);
const complejoTuristicoColonLocalMedia = Array.from(
  { length: 4 },
  (_, index) => `/propiedades/2026/complejo-turistico-colon/${String(index + 1).padStart(2, '0')}.jpeg.jpeg`,
);
const complejoTuristicoColonGallery = complejoTuristicoColonLocalMedia.map(publicMediaPath);
const loteColonP3LocalMedia = Array.from(
  { length: 7 },
  (_, index) => `/propiedades/2026/lote-colon-p3/${String(index + 1).padStart(2, '0')}.jpeg.jpeg`,
);
const loteColonP3Gallery = loteColonP3LocalMedia.map(publicMediaPath);
const dosLotesColonLocalMedia = Array.from(
  { length: 10 },
  (_, index) => `/propiedades/2026/dos-lotes-colon/${String(index + 1).padStart(2, '0')}.jpeg.jpeg`,
);
const dosLotesColonGallery = dosLotesColonLocalMedia.map(publicMediaPath);
const alquilerGalponEstrenarLocalMedia = Array.from(
  { length: 2 },
  (_, index) => `/propiedades/2026/alquiler-galpon-estrenar/${String(index + 1).padStart(2, '0')}.jpeg.mp4`,
);
const alquilerGalponEstrenarVideos = alquilerGalponEstrenarLocalMedia.map(publicMediaPath);

const newProperties2026: Property[] = [
  {
    slug: 'casa-a-refaccionar-en-pueblo-liebig',
    operation: 'Venta',
    type: 'Casa',
    name: 'Casa a refaccionar en Pueblo Liebig con frente sobre dos calles',
    location: 'Pueblo Liebig',
    bedrooms: 2,
    bathrooms: 1,
    area: 130,
    price: 50000,
    prices: [50000],
    currency: 'USD',
    priceLabel: 'USD 50.000',
    image: casaPuebloLiebigGallery[0],
    gallery: casaPuebloLiebigGallery,
    media: propertyMedia(casaPuebloLiebigGallery, 'image'),
    description: 'Casa ubicada en Pueblo Liebig, con la fachada histórica colonial característica de la zona. La propiedad se encuentra para remodelar y ofrece frente sobre dos calles.\n\nSe desarrolla sobre un lote de 10 metros de frente por 15 metros de fondo, con una superficie cubierta aproximada de 130 m².\n\nCuenta con living, cocina-comedor, dos habitaciones, un baño, lavadero y un pequeño patio al fondo.',
    features: ['Fachada histórica colonial', 'Frente sobre dos calles', 'Propiedad para remodelar', 'Living', 'Cocina-comedor', '2 habitaciones', '1 baño', 'Lavadero', 'Pequeño patio al fondo'],
    rooms: null,
    bedroomCounts: [2],
    roomCounts: [],
    originalMediaPaths: casaPuebloLiebigLocalMedia.map(path => path.slice(1)),
    descriptionSections: {
      description: [
        'Casa ubicada en Pueblo Liebig, con la fachada histórica colonial característica de la zona. La propiedad se encuentra para remodelar y ofrece frente sobre dos calles.',
        'Se desarrolla sobre un lote de 10 metros de frente por 15 metros de fondo, con una superficie cubierta aproximada de 130 m².',
        'Cuenta con living, cocina-comedor, dos habitaciones, un baño, lavadero y un pequeño patio al fondo.',
      ],
      location: ['Calle Pte. Perón y San Martín, a metros de la Escuela Pública'],
      features: ['Fachada histórica colonial', 'Frente sobre dos calles', 'Propiedad para remodelar', 'Living', 'Cocina-comedor', '2 habitaciones', '1 baño', 'Lavadero', 'Pequeño patio al fondo'],
      surfaces: ['Lote: 150 m²', 'Frente: 10 m', 'Fondo: 15 m', 'Cubierta: 130 m²'],
      distribution: [],
      services: [],
      additional: [],
    },
  },
  {
    slug: 'complejo-turistico-ruta-130-colon',
    operation: 'Venta',
    type: 'Complejo turístico',
    name: 'Complejo turístico en venta sobre Ruta 130, Colón',
    location: 'Colón',
    bedrooms: null,
    bathrooms: null,
    area: 362,
    price: null,
    prices: [],
    currency: null,
    priceLabel: 'Consultar precio',
    image: complejoTuristicoColonGallery[0],
    gallery: complejoTuristicoColonGallery,
    media: propertyMedia(complejoTuristicoColonGallery, 'image'),
    description: 'Complejo turístico ubicado sobre Ruta 130, a metros del puente Artalaz, en Colón.\n\nCuenta con una superficie de lote de 710 m² y una superficie cubierta de 362 m².\n\nTodas las unidades tienen vista al frente. Cada unidad está integrada por estar, cocina-comedor y baño privado.\n\nEl complejo cuenta con cuatro departamentos de dos habitaciones, tres departamentos de una habitación y una casa actualmente en obra en planta baja.\n\nDispone además de amplio espacio con entrada para vehículos y rejas.',
    features: ['4 departamentos de 2 habitaciones', '3 departamentos de 1 habitación', '1 casa en obra en planta baja', 'Unidades con vista al frente', 'Estar', 'Cocina-comedor', 'Baño privado en cada unidad', 'Amplio ingreso para vehículos', 'Rejas'],
    rooms: null,
    bedroomCounts: [1, 2],
    roomCounts: [],
    originalMediaPaths: complejoTuristicoColonLocalMedia.map(path => path.slice(1)),
    descriptionSections: {
      description: [
        'Complejo turístico ubicado sobre Ruta 130, a metros del puente Artalaz, en Colón.',
        'Cuenta con una superficie de lote de 710 m² y una superficie cubierta de 362 m².',
        'Todas las unidades tienen vista al frente. Cada unidad está integrada por estar, cocina-comedor y baño privado.',
        'El complejo cuenta con cuatro departamentos de dos habitaciones, tres departamentos de una habitación y una casa actualmente en obra en planta baja.',
        'Dispone además de amplio espacio con entrada para vehículos y rejas.',
      ],
      location: ['Ruta 130, a metros del puente Artalaz'],
      features: ['4 departamentos de 2 habitaciones', '3 departamentos de 1 habitación', '1 casa en obra en planta baja', 'Unidades con vista al frente', 'Estar', 'Cocina-comedor', 'Baño privado en cada unidad', 'Amplio ingreso para vehículos', 'Rejas'],
      surfaces: ['Lote: 710 m²', 'Cubierta: 362 m²'],
      distribution: [],
      services: ['Luz', 'Agua', 'Biodigestores', 'WiFi'],
      additional: [],
    },
  },
  {
    slug: 'lote-rocamora-colon',
    operation: 'Venta',
    type: 'Terreno',
    name: 'Lote en venta sobre calle Rocamora, Colón',
    location: 'Colón',
    bedrooms: null,
    bathrooms: null,
    area: 300,
    price: 60000,
    prices: [60000],
    currency: 'USD',
    priceLabel: 'USD 60.000',
    image: loteColonP3Gallery[0],
    gallery: loteColonP3Gallery,
    media: propertyMedia(loteColonP3Gallery, 'image'),
    description: 'Lote ubicado sobre calle Rocamora, entre 3 de Febrero y Lavalle, en Colón, a pocos metros de Playa Norte.\n\nSe encuentra en una zona alta, por encima del nivel de inundación, y resulta ideal para inversión.\n\nCuenta con 10 metros de frente por 30 metros de fondo, con una superficie total de 300 m².\n\nLa zona dispone de todos los servicios.',
    features: ['A pocos metros de Playa Norte', 'Ubicación alta', 'Por encima del nivel de inundación', 'Ideal para inversión', 'Todos los servicios en la zona'],
    rooms: null,
    bedroomCounts: [],
    roomCounts: [],
    originalMediaPaths: loteColonP3LocalMedia.map(path => path.slice(1)),
    descriptionSections: {
      description: [
        'Lote ubicado sobre calle Rocamora, entre 3 de Febrero y Lavalle, en Colón, a pocos metros de Playa Norte.',
        'Se encuentra en una zona alta, por encima del nivel de inundación, y resulta ideal para inversión.',
        'Cuenta con 10 metros de frente por 30 metros de fondo, con una superficie total de 300 m².',
        'La zona dispone de todos los servicios.',
      ],
      location: ['Calle Rocamora entre 3 de Febrero y Lavalle'],
      features: ['A pocos metros de Playa Norte', 'Ubicación alta', 'Por encima del nivel de inundación', 'Ideal para inversión', 'Todos los servicios en la zona'],
      surfaces: ['Frente: 10 m', 'Fondo: 30 m', 'Total: 300 m²'],
      distribution: [],
      services: [],
      additional: [],
    },
  },
  {
    slug: 'dos-lotes-paysandu-colon',
    operation: 'Venta',
    type: 'Terreno',
    name: 'Dos lotes en venta sobre calle Paysandú, Colón',
    location: 'Colón',
    bedrooms: null,
    bathrooms: null,
    area: 432,
    price: 35000,
    prices: [35000],
    currency: 'USD',
    priceLabel: 'USD 35.000 cada lote',
    image: dosLotesColonGallery[0],
    gallery: dosLotesColonGallery,
    media: propertyMedia(dosLotesColonGallery, 'image'),
    description: 'Dos lotes ubicados en la zona oeste de Colón, sobre calle Paysandú entre Boulevard Cabo Pereyra y calle Piamonte.\n\nCada lote cuenta con una superficie de 432 m², con 12 metros de frente por 36 metros de fondo.\n\nLos lotes se encuentran nivelados y son aptos para construcción de vivienda, complejo u otros destinos residenciales.\n\nLa zona dispone de servicios de luz, agua, cloacas y cable/WiFi.',
    features: ['2 lotes disponibles', 'Lotes nivelados', 'Zona oeste de Colón', 'Ideal para vivienda o complejo'],
    rooms: null,
    bedroomCounts: [],
    roomCounts: [],
    originalMediaPaths: dosLotesColonLocalMedia.map(path => path.slice(1)),
    descriptionSections: {
      description: [
        'Dos lotes ubicados en la zona oeste de Colón, sobre calle Paysandú entre Boulevard Cabo Pereyra y calle Piamonte.',
        'Cada lote cuenta con una superficie de 432 m², con 12 metros de frente por 36 metros de fondo.',
        'Los lotes se encuentran nivelados y son aptos para construcción de vivienda, complejo u otros destinos residenciales.',
        'La zona dispone de servicios de luz, agua, cloacas y cable/WiFi.',
      ],
      location: ['Calle Paysandú entre Boulevard Cabo Pereyra y calle Piamonte'],
      features: ['2 lotes disponibles', 'Lotes nivelados', 'Zona oeste de Colón', 'Ideal para vivienda o complejo'],
      surfaces: ['Cada lote: 432 m²', 'Frente: 12 m', 'Fondo: 36 m'],
      distribution: [],
      services: ['Luz', 'Agua', 'Cloacas', 'Cable / WiFi'],
      additional: [],
    },
  },
  {
    slug: 'galpon-a-estrenar-alquiler-colon',
    operation: 'Alquiler',
    type: 'Galpón',
    name: 'Galpón a estrenar en alquiler en Colón',
    location: 'Colón',
    bedrooms: null,
    bathrooms: 1,
    area: 240,
    price: 1000,
    prices: [1000],
    currency: 'USD',
    priceLabel: 'USD 1.000 mensuales',
    image: null,
    gallery: [],
    media: propertyMedia(alquilerGalponEstrenarVideos, 'video'),
    description: 'Galpón a estrenar ubicado en Colón, a metros de calle López Jordán y Noailles.\n\nCuenta con una superficie aproximada de 240 m², acceso mejorado, amplio salón con techo alto y playón interno de hormigón apto para ingreso de camiones.\n\nDispone de un baño completo y servicios instalados de luz, agua y cloacas.',
    features: ['Galpón a estrenar', 'Acceso mejorado', 'Amplio salón', 'Techo alto', 'Playón interno de hormigón', 'Apto para ingreso de camiones', '1 baño completo'],
    rooms: null,
    bedroomCounts: [],
    roomCounts: [],
    originalMediaPaths: alquilerGalponEstrenarLocalMedia.map(path => path.slice(1)),
    descriptionSections: {
      description: [
        'Galpón a estrenar ubicado en Colón, a metros de calle López Jordán y Noailles.',
        'Cuenta con una superficie aproximada de 240 m², acceso mejorado, amplio salón con techo alto y playón interno de hormigón apto para ingreso de camiones.',
        'Dispone de un baño completo y servicios instalados de luz, agua y cloacas.',
      ],
      location: ['A metros de calle López Jordán y Noailles'],
      features: ['Galpón a estrenar', 'Acceso mejorado', 'Amplio salón', 'Techo alto', 'Playón interno de hormigón', 'Apto para ingreso de camiones', '1 baño completo'],
      surfaces: ['240 m²'],
      distribution: [],
      services: ['Luz', 'Agua', 'Cloacas'],
      additional: [],
    },
  },
];

export const properties: Property[] = [...newProperties2026, ...importedProperties2026, ...importedProperties2025, ...importedProperties2024, ...importedProperties2023, ...importedProperties2022, ...importedProperties2021, ...importedProperties2020];
export const propertyFilterRecords: PropertyFilterRecord[] = properties.map(property => ({
  operation: property.operation,
  type: property.type,
  location: property.location,
  bedrooms: property.bedrooms,
  bedroomCounts: property.bedroomCounts,
  price: property.price,
  prices: property.prices,
  currency: property.currency,
}));
export const propertyFilterOptions = createPropertyFilterOptions(properties);

export const availablePropertiesCount = new Set(properties.map(property => property.slug)).size;

export function formatAvailablePropertiesCount(total: number) {
  if (total < 50) return total.toString();
  return `+${Math.floor(total / 50) * 50}`;
}

export const availablePropertiesStatValue = formatAvailablePropertiesCount(availablePropertiesCount);

// Estadísticas demostrativas, centralizadas para su futura actualización.
export const stats = [
  { value: availablePropertiesStatValue, label: 'Propiedades disponibles' },
  { value: '+1.000', label: 'Clientes acompañados' },
  { value: '+6', label: 'Años de experiencia' },
  { value: '100%', label: 'Compromiso y confianza' },
];

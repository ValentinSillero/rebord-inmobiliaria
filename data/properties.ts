import instagramImport2020 from './import/rebord_importacion_web_2020.json';
import instagramImport2021 from './import/rebord_importacion_web_2021.json';
import instagramImport2022 from './import/rebord_importacion_web_2022.json';
import instagramImport2023 from './import/rebord_importacion_web_2023.json';
import instagramImport2024 from './import/rebord_importacion_web_2024.json';
import instagramImport2025 from './import/rebord_importacion_web_2025.json';
import instagramImport2026 from './import/rebord_importacion_web_2026.json';
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

// Cambiar a true después de copiar la exportación dentro de public/media/.
const instagramMediaAvailable = true;

function operationFromOriginal(post: InstagramImport): Property['operation'] {
  // El título es la fuente prioritaria. Esto corrige dos etiquetas derivadas
  // inconsistentes del JSON sin reinterpretar el contenido de Instagram.
  if (/\b(?:venta|vende|venden)\b/i.test(post.titulo_instagram)) return 'Venta';
  if (/\b(?:alquiler|alquila|alquilan)\b/i.test(post.titulo_instagram)) return 'Alquiler';
  return post.operacion_detectada === 'alquiler' ? 'Alquiler' : 'Venta';
}

function publicMediaPath(path: string) {
  return `/${path.replace(/^\/+/, '')}`;
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

function transformInstagramPosts(posts: InstagramImport[], resolveSlug = (post: InstagramImport) => post.slug_sugerido, recognizeCompactSurfaces = false, useDetectedLocation = false) {
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
      location: derivePropertyLocation(post.titulo_instagram, description, descriptionSections.location, useDetectedLocation ? post.localidad_detectada || '' : undefined),
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
}, true, true);
const importedProperties2023 = transformInstagramPosts(instagramImport2023 as InstagramImport[], post => {
  const baseSlug = occupiedSlugs.has(post.slug_sugerido) ? `${post.slug_sugerido}-2023` : post.slug_sugerido;
  let slug = baseSlug;
  let suffix = 2;
  while (occupiedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  occupiedSlugs.add(slug);
  return slug;
}, true, true);
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
}, true, true);
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
}, true, true);
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
}, true, true);

export const properties: Property[] = [...importedProperties2026, ...importedProperties2025, ...importedProperties2024, ...importedProperties2023, ...importedProperties2022, ...importedProperties2021, ...importedProperties2020];
export const propertyFilterOptions = createPropertyFilterOptions(properties);

// Estadísticas demostrativas, centralizadas para su futura actualización.
export const stats = [
  { value: '+450', label: 'Propiedades disponibles' },
  { value: '+1.000', label: 'Clientes acompañados' },
  { value: '+6', label: 'Años de experiencia' },
  { value: '100%', label: 'Compromiso y confianza' },
];

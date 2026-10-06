import cloudinaryMediaMap from '../data/cloudinary-media-map.json';
import { properties, type PropertyMedia } from '../data/properties';
import { cloudinaryImageLoader, isCloudinaryImageUrl } from '../lib/cloudinary-image-loader';

const cloudinaryMediaPattern = /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//;
const localMediaPattern = /^\/(?:media|propiedades)\//;
const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
const errors: string[] = [];

type YearSummary = {
  properties: number;
  images: number;
  videos: number;
  cloudinaryUrls: number;
};

const byYear = Object.fromEntries(years.map(year => [year, {
  properties: 0,
  images: 0,
  videos: 0,
  cloudinaryUrls: 0,
}])) as Record<string, YearSummary>;

function mediaForProperty(property: (typeof properties)[number]): PropertyMedia[] {
  return property.media || property.gallery.map(src => ({ src, kind: 'image' }));
}

function yearForProperty(property: (typeof properties)[number]) {
  const publicationYear = property.publicationDate?.slice(0, 4);
  if (publicationYear && byYear[publicationYear]) return publicationYear;

  const mediaYear = property.originalMediaPaths
    ?.map(path => path.match(/(?:^|\/)(20\d{2})(?:\/|$)/)?.[1])
    .find((year): year is string => Boolean(year && byYear[year]));

  return mediaYear || '2026';
}

const allMedia: PropertyMedia[] = [];

for (const property of properties) {
  const propertyMedia = mediaForProperty(property);
  const year = yearForProperty(property);
  const summary = byYear[year];
  summary.properties += 1;

  if (propertyMedia.length === 0) errors.push(`${property.slug}: propiedad sin imágenes ni videos`);

  const imageUrls = propertyMedia.filter(item => item.kind === 'image').map(item => item.src);
  if (property.image !== (imageUrls[0] || null)) errors.push(`${property.slug}: la primera imagen no coincide con image`);
  if (JSON.stringify(property.gallery) !== JSON.stringify(imageUrls)) errors.push(`${property.slug}: gallery no coincide con las imágenes de media`);

  for (const item of propertyMedia) {
    allMedia.push(item);
    const match = item.src.match(cloudinaryMediaPattern);

    if (!match) errors.push(`${property.slug}: URL no Cloudinary: ${item.src}`);
    if (localMediaPattern.test(item.src)) errors.push(`${property.slug}: referencia local activa: ${item.src}`);
    if (match?.[1] !== item.kind) errors.push(`${property.slug}: tipo ${item.kind} servido como ${match?.[1] || 'desconocido'}: ${item.src}`);

    summary[item.kind === 'image' ? 'images' : 'videos'] += 1;
    if (match) summary.cloudinaryUrls += 1;
  }

  for (const originalPath of property.originalMediaPaths || []) {
    const localPath = `/${originalPath.replace(/^\/+/, '')}`;
    if (!(cloudinaryMediaMap as Record<string, string>)[localPath]) {
      errors.push(`${property.slug}: el mapa no contiene ${localPath}`);
    }
  }
}

for (const [localPath, cloudinaryUrl] of Object.entries(cloudinaryMediaMap)) {
  if (!localMediaPattern.test(localPath)) errors.push(`Clave inesperada en el mapa: ${localPath}`);
  if (!cloudinaryMediaPattern.test(cloudinaryUrl)) errors.push(`Valor no Cloudinary en el mapa: ${localPath}`);
}

const sampleImage = allMedia.find(item => item.kind === 'image');
if (!sampleImage || !isCloudinaryImageUrl(sampleImage.src)) {
  errors.push('No se encontró una imagen Cloudinary válida para probar el loader');
} else {
  const transformed = cloudinaryImageLoader({ src: sampleImage.src, width: 800, quality: 90 });
  if (!transformed.includes('/f_auto,q_auto,c_limit,w_800/')) {
    errors.push(`El loader no aplicó la transformación esperada: ${transformed}`);
  }
  if (transformed.startsWith('/_next/image')) {
    errors.push('El loader generó una URL de Vercel Image Optimization');
  }
}

const images = allMedia.filter(item => item.kind === 'image').length;
const videos = allMedia.length - images;
const cloudinaryUrls = allMedia.filter(item => cloudinaryMediaPattern.test(item.src));
const summary = {
  properties: properties.length,
  mediaReferences: allMedia.length,
  images,
  videos,
  cloudinaryUrls: cloudinaryUrls.length,
  uniqueCloudinaryUrls: new Set(cloudinaryUrls.map(item => item.src)).size,
  localReferences: allMedia.filter(item => localMediaPattern.test(item.src)).length,
  mapEntries: Object.keys(cloudinaryMediaMap).length,
  byYear,
  errors: errors.length,
};

console.log(JSON.stringify(summary, null, 2));

if (errors.length > 0) {
  console.error('\nErrores de auditoría:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
}

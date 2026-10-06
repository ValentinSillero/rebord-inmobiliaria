import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import cloudinaryMediaMap from '../data/cloudinary-media-map.json';
import { properties, type PropertyMedia } from '../data/properties';
import {
  allowedCloudinaryImageWidth,
  CLOUDINARY_IMAGE_WIDTHS,
  cloudinaryImageLoader,
  isCloudinaryImageUrl,
} from '../lib/cloudinary-image-loader';

const cloudinaryMediaPattern = /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//;
const localMediaPattern = /^\/(?:media|propiedades)\//;
const vercelOptimizerPattern = /^\/_next\/image(?:\?|$)/;
const errors: string[] = [];
const missingFiles = new Set<string>();

function mediaForProperty(property: (typeof properties)[number]): PropertyMedia[] {
  return property.media || property.gallery.map(src => ({ src, kind: 'image' }));
}

const allMedia: PropertyMedia[] = [];
const activeImages: PropertyMedia[] = [];

for (const property of properties) {
  const propertyMedia = mediaForProperty(property);
  const imageUrls = propertyMedia.filter(item => item.kind === 'image').map(item => item.src);

  if (propertyMedia.length === 0) errors.push(`${property.slug}: propiedad sin imágenes ni videos`);
  if (property.image !== (imageUrls[0] || null)) errors.push(`${property.slug}: la primera imagen no coincide con image`);
  if (JSON.stringify(property.gallery) !== JSON.stringify(imageUrls)) errors.push(`${property.slug}: gallery no coincide con las imágenes de media`);

  for (const item of propertyMedia) {
    allMedia.push(item);
    if (item.kind === 'image') activeImages.push(item);

    const match = item.src.match(cloudinaryMediaPattern);
    if (!match) errors.push(`${property.slug}: URL no Cloudinary: ${item.src}`);
    if (localMediaPattern.test(item.src)) errors.push(`${property.slug}: referencia local activa: ${item.src}`);
    if (match?.[1] !== item.kind) errors.push(`${property.slug}: tipo ${item.kind} servido como ${match?.[1] || 'desconocido'}: ${item.src}`);
  }

  for (const originalPath of property.originalMediaPaths || []) {
    const localPath = `/${originalPath.replace(/^\/+/, '')}`;
    if (!(cloudinaryMediaMap as Record<string, string>)[localPath]) {
      missingFiles.add(localPath);
      errors.push(`${property.slug}: el mapa no contiene ${localPath}`);
    }
  }
}

for (const [localPath, cloudinaryUrl] of Object.entries(cloudinaryMediaMap)) {
  if (!localMediaPattern.test(localPath)) errors.push(`Clave inesperada en el mapa: ${localPath}`);
  if (!cloudinaryMediaPattern.test(cloudinaryUrl)) errors.push(`Valor no Cloudinary en el mapa: ${localPath}`);
}

const roundingCases = [
  [1, 256],
  [256, 256],
  [257, 640],
  [640, 640],
  [641, 1200],
  [1200, 1200],
  [1201, 1200],
] as const;

for (const [requested, expected] of roundingCases) {
  const actual = allowedCloudinaryImageWidth(requested);
  if (actual !== expected) errors.push(`Ancho ${requested}px redondeado a ${actual}px; se esperaba ${expected}px`);
}

const uniqueImageUrls = [...new Set(activeImages.map(item => item.src))];
const derivedVariants = new Map<string, Set<string>>();

for (const src of uniqueImageUrls) {
  if (!isCloudinaryImageUrl(src)) {
    errors.push(`Imagen activa fuera de Cloudinary: ${src}`);
    continue;
  }

  const variants = new Set(CLOUDINARY_IMAGE_WIDTHS.map(width => (
    cloudinaryImageLoader({ src, width, quality: 90 })
  )));
  derivedVariants.set(src, variants);

  for (const [index, transformed] of [...variants].entries()) {
    const expectedWidth = CLOUDINARY_IMAGE_WIDTHS[index];
    if (!transformed.includes(`/f_auto,q_auto,c_limit,w_${expectedWidth}/`)) {
      errors.push(`Transformación inesperada para ${src}: ${transformed}`);
    }
    if (vercelOptimizerPattern.test(transformed)) {
      errors.push(`El loader generó una URL de Vercel Image Optimization: ${transformed}`);
    }
  }
}

const maximumDerivedVariantsPerImage = Math.max(
  0,
  ...[...derivedVariants.values()].map(variants => variants.size),
);

if (maximumDerivedVariantsPerImage > CLOUDINARY_IMAGE_WIDTHS.length) {
  errors.push(`Se generan hasta ${maximumDerivedVariantsPerImage} variantes por imagen`);
}

type GeneratedHtmlAudit = {
  checked: boolean;
  htmlFiles: number;
  cloudinaryImageReferences: number;
  vercelOptimizerPropertyUrls: number;
  transformationWidths: number[];
  invalidTransformationWidths: number[];
};

const generatedHtml: GeneratedHtmlAudit = {
  checked: false,
  htmlFiles: 0,
  cloudinaryImageReferences: 0,
  vercelOptimizerPropertyUrls: 0,
  transformationWidths: [],
  invalidTransformationWidths: [],
};

if (process.argv.includes('--html')) {
  generatedHtml.checked = true;
  const buildRoot = join(process.cwd(), '.next', 'server', 'app');

  if (!existsSync(buildRoot)) {
    errors.push('No existe el HTML compilado en .next/server/app');
  } else {
    const htmlFiles: string[] = [];
    const walk = (directory: string) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.name.endsWith('.html')) htmlFiles.push(path);
      }
    };
    walk(buildRoot);
    generatedHtml.htmlFiles = htmlFiles.length;

    const widths = new Set<number>();
    const invalidWidths = new Set<number>();

    for (const path of htmlFiles) {
      const html = readFileSync(path, 'utf8');
      const imageTags = html.match(/<img\b[^>]*>/g) || [];
      const optimizedUrls = html.match(/\/_next\/image\?[^\x22\x27\x20<]+/g) || [];

      generatedHtml.vercelOptimizerPropertyUrls += optimizedUrls.filter(url => (
        url.toLowerCase().includes('res.cloudinary.com') || url.toLowerCase().includes('cloudinary')
      )).length;

      for (const tag of imageTags) {
        if (!tag.includes('https://res.cloudinary.com/')) continue;
        generatedHtml.cloudinaryImageReferences += (tag.match(/https:\/\/res\.cloudinary\.com\//g) || []).length;

        for (const match of tag.matchAll(/\/f_auto,q_auto,c_limit,w_(\d+)\//g)) {
          const width = Number(match[1]);
          widths.add(width);
          if (!(CLOUDINARY_IMAGE_WIDTHS as readonly number[]).includes(width)) invalidWidths.add(width);
        }
      }
    }

    generatedHtml.transformationWidths = [...widths].sort((a, b) => a - b);
    generatedHtml.invalidTransformationWidths = [...invalidWidths].sort((a, b) => a - b);

    if (generatedHtml.vercelOptimizerPropertyUrls > 0) {
      errors.push(`El HTML contiene ${generatedHtml.vercelOptimizerPropertyUrls} URLs Cloudinary bajo /_next/image`);
    }
    if (invalidWidths.size > 0) {
      errors.push(`El HTML contiene anchos no permitidos: ${[...invalidWidths].join(', ')}`);
    }
  }
}

const activeVercelOptimizerUrls = allMedia.filter(item => vercelOptimizerPattern.test(item.src)).length;
const summary = {
  properties: properties.length,
  activeImages: activeImages.length,
  activeVideos: allMedia.length - activeImages.length,
  uniqueUrls: uniqueImageUrls.length,
  localReferencesActive: allMedia.filter(item => localMediaPattern.test(item.src)).length,
  allowedWidths: CLOUDINARY_IMAGE_WIDTHS,
  maximumDerivedVariantsPerImage,
  vercelOptimizerUrls: activeVercelOptimizerUrls + generatedHtml.vercelOptimizerPropertyUrls,
  missingFiles: missingFiles.size,
  mapEntries: Object.keys(cloudinaryMediaMap).length,
  generatedHtml,
  errors: errors.length,
};

console.log(JSON.stringify(summary, null, 2));

if (errors.length > 0) {
  console.error('\nErrores de auditoría:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
}

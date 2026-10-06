import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const mapPath = path.join(projectRoot, 'data', 'cloudinary-media-map.json');
const reportPath = path.join(projectRoot, 'data', 'cloudinary-folder-organization-report.json');
const cloudinaryRoot = 'rebord-inmobiliaria';
const videoExtensions = new Set(['.mp4', '.mov', '.webm']);
const applyChanges = process.argv.includes('--apply');
const concurrencyArgument = process.argv.find(argument => argument.startsWith('--concurrency='));
const concurrency = Math.max(1, Number.parseInt(concurrencyArgument?.split('=')[1] || '4', 10) || 4);
const limitArgument = process.argv.find(argument => argument.startsWith('--limit='));
const limit = limitArgument ? Math.max(1, Number.parseInt(limitArgument.split('=')[1], 10) || 1) : null;

dotenv.config({ path: path.join(projectRoot, '.env.local'), quiet: true });

const requiredVariables = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVariables = requiredVariables.filter(name => !process.env[name]);

if (missingVariables.length > 0) {
  console.error(`Faltan variables requeridas en .env.local: ${missingVariables.join(', ')}`);
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function errorMessage(error) {
  const rawMessage = error?.message
    || error?.error?.message
    || (typeof error === 'string' ? error : JSON.stringify(error));
  return String(rawMessage || 'Error desconocido')
    .replaceAll(process.env.CLOUDINARY_API_SECRET, '[REDACTED]')
    .replaceAll(process.env.CLOUDINARY_API_KEY, '[REDACTED]');
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function isRetryable(error) {
  const status = Number(error?.http_code || error?.status || error?.error?.http_code || error?.error?.status || 0);
  return status === 408 || status === 420 || status === 429 || status >= 500
    || /ECONNRESET|ETIMEDOUT|Request Timeout|socket hang up/i.test(errorMessage(error));
}

async function withRetry(action) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt === 4 || !isRetryable(error)) break;
      await delay(attempt * 2_000);
    }
  }
  throw lastError;
}

function publicIdFor(localPath) {
  const extension = path.posix.extname(localPath);
  return `${cloudinaryRoot}${localPath.slice(0, -extension.length)}`;
}

function assetFolderFor(localPath) {
  return `${cloudinaryRoot}${path.posix.dirname(localPath)}`;
}

function resourceTypeFor(localPath) {
  return videoExtensions.has(path.posix.extname(localPath).toLowerCase()) ? 'video' : 'image';
}

async function readMediaMap() {
  const parsed = JSON.parse(await fs.readFile(mapPath, 'utf8'));
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('data/cloudinary-media-map.json no contiene un objeto válido');
  }
  return parsed;
}

async function listAssets(resourceType) {
  const assets = [];
  let nextCursor;
  do {
    const response = await withRetry(() => cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      prefix: `${cloudinaryRoot}/`,
      max_results: 500,
      next_cursor: nextCursor,
    }));
    assets.push(...(response.resources || []));
    nextCursor = response.next_cursor;
  } while (nextCursor);
  return assets;
}

function summarizeFolders(assets) {
  const folders = new Map();
  for (const asset of assets) {
    const folder = asset.asset_folder || '';
    folders.set(folder, (folders.get(folder) || 0) + 1);
  }
  return Object.fromEntries([...folders].sort(([left], [right]) => left.localeCompare(right, 'en')));
}

async function inventory() {
  const assets = (await Promise.all(['image', 'video'].map(listAssets))).flat();
  const byKey = new Map(assets.map(asset => [`${asset.resource_type}:${asset.public_id}`, asset]));
  return { assets, byKey };
}

const mediaMap = await readMediaMap();
const desiredAssets = Object.entries(mediaMap).map(([localPath, secureUrl]) => ({
  localPath,
  secureUrl,
  publicId: publicIdFor(localPath),
  resourceType: resourceTypeFor(localPath),
  assetFolder: assetFolderFor(localPath),
}));

console.log(`Mapa: ${desiredAssets.length} assets. Modo: ${applyChanges ? 'APLICAR' : 'SOLO AUDITORÍA'}.`);
const before = await inventory();
const dynamicFolders = before.assets.length > 0
  && before.assets.every(asset => Object.prototype.hasOwnProperty.call(asset, 'asset_folder'));

if (!dynamicFolders) {
  throw new Error('No se pudo confirmar Dynamic Folders: la API no devolvió asset_folder para todos los assets. No se aplicaron cambios.');
}

const missing = [];
const alreadyOrganized = [];
const pending = [];
const urlMismatchesBefore = [];

for (const desired of desiredAssets) {
  const asset = before.byKey.get(`${desired.resourceType}:${desired.publicId}`);
  if (!asset) {
    missing.push(desired.localPath);
    continue;
  }
  if (asset.secure_url && asset.secure_url !== desired.secureUrl) {
    urlMismatchesBefore.push(desired.localPath);
  }
  if ((asset.asset_folder || '') === desired.assetFolder) {
    alreadyOrganized.push(desired.localPath);
  } else {
    pending.push({ ...desired, asset });
  }
}

console.log(`Dynamic Folders detectado: sí.`);
console.log(`Inventario Cloudinary con prefijo ${cloudinaryRoot}/: ${before.assets.length}.`);
console.log(`Ya organizados: ${alreadyOrganized.length}. Pendientes: ${pending.length}. No encontrados: ${missing.length}.`);

if (!applyChanges) {
  console.log('Auditoría finalizada sin modificar Cloudinary. Usar --apply para mover los assets pendientes.');
  process.exitCode = missing.length > 0 ? 1 : 0;
} else {
  const work = limit ? pending.slice(0, limit) : pending;
  const moved = [];
  const failures = [];
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= work.length) return;
      const item = work[index];
      try {
        const result = await withRetry(() => cloudinary.uploader.explicit(item.publicId, {
          resource_type: item.resourceType,
          type: item.asset.type || 'upload',
          asset_folder: item.assetFolder,
          unique_display_name: false,
        }));
        if (result.asset_id !== item.asset.asset_id) throw new Error('asset_id cambió inesperadamente');
        if (result.public_id !== item.publicId) throw new Error('public_id cambió inesperadamente');
        if (result.secure_url !== item.secureUrl) throw new Error('secure_url cambió inesperadamente');
        if (result.asset_folder !== item.assetFolder) throw new Error(`asset_folder inesperado: ${result.asset_folder || '(root)'}`);
        moved.push(item.localPath);
      } catch (error) {
        failures.push({ path: item.localPath, error: errorMessage(error) });
      } finally {
        completed += 1;
        if (completed % 25 === 0 || completed === work.length) {
          console.log(`[${completed}/${work.length}] Movidos: ${moved.length}. Fallidos: ${failures.length}.`);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, work.length || 1) }, () => worker()));

  const after = await inventory();
  const assetIdsBefore = new Set(before.assets.map(asset => asset.asset_id));
  const assetIdsAfter = new Set(after.assets.map(asset => asset.asset_id));
  const addedAssetIds = [...assetIdsAfter].filter(assetId => !assetIdsBefore.has(assetId));
  const removedAssetIds = [...assetIdsBefore].filter(assetId => !assetIdsAfter.has(assetId));
  const remaining = desiredAssets.filter(desired => {
    const asset = after.byKey.get(`${desired.resourceType}:${desired.publicId}`);
    return !asset || asset.asset_folder !== desired.assetFolder;
  }).map(desired => desired.localPath);
  const urlMismatchesAfter = desiredAssets.filter(desired => {
    const asset = after.byKey.get(`${desired.resourceType}:${desired.publicId}`);
    return asset?.secure_url && asset.secure_url !== desired.secureUrl;
  }).map(desired => desired.localPath);

  const report = {
    generatedAt: new Date().toISOString(),
    folderMode: 'dynamic',
    mapEntries: desiredAssets.length,
    assetsBefore: before.assets.length,
    assetsAfter: after.assets.length,
    alreadyOrganized: alreadyOrganized.length,
    moved: moved.length,
    failed: failures,
    missing,
    remaining,
    addedAssetIds,
    removedAssetIds,
    urlMismatchesBefore,
    urlMismatchesAfter,
    folders: summarizeFolders(after.assets),
  };
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\nResumen de organización');
  console.log(`Reorganizados: ${moved.length}`);
  console.log(`Fallidos: ${failures.length}`);
  console.log(`Pendientes después: ${remaining.length}`);
  console.log(`Assets antes/después: ${before.assets.length}/${after.assets.length}`);
  console.log(`Asset IDs agregados/eliminados: ${addedAssetIds.length}/${removedAssetIds.length}`);
  console.log(`URLs distintas del mapa: ${urlMismatchesAfter.length}`);
  console.log(`Reporte: ${path.relative(projectRoot, reportPath)}`);

  process.exitCode = failures.length || missing.length || remaining.length || addedAssetIds.length
    || removedAssetIds.length || urlMismatchesAfter.length ? 1 : 0;
}

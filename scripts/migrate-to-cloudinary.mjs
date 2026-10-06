import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const publicDirectory = path.join(projectRoot, 'public');
const sourceDirectories = ['media', 'propiedades'];
const mapPath = path.join(projectRoot, 'data', 'cloudinary-media-map.json');
const failuresPath = path.join(projectRoot, 'data', 'cloudinary-migration-failures.json');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4', '.mov', '.webm']);
const videoExtensions = new Set(['.mp4', '.mov', '.webm']);
const cloudinaryRoot = 'rebord-inmobiliaria';
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

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function localPublicPath(filePath) {
  return `/${toPosixPath(path.relative(publicDirectory, filePath))}`;
}

function publicIdFor(localPath) {
  const extension = path.posix.extname(localPath);
  return `${cloudinaryRoot}${localPath.slice(0, -extension.length)}`;
}

function assetFolderFor(localPath) {
  return `${cloudinaryRoot}${path.posix.dirname(localPath)}`;
}

function resourceTypeFor(filePath) {
  return videoExtensions.has(path.extname(filePath).toLowerCase()) ? 'video' : 'image';
}

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath);
    if (!entry.isFile()) return [];
    return supportedExtensions.has(path.extname(entry.name).toLowerCase()) ? [entryPath] : [];
  }));
  return nested.flat();
}

async function readMap() {
  try {
    const parsed = JSON.parse(await fs.readFile(mapPath, 'utf8'));
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('el contenido no es un objeto JSON');
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw new Error(`No se pudo leer ${path.relative(projectRoot, mapPath)}: ${error.message}`);
  }
}

let saveSequence = Promise.resolve();

function saveJson(filePath, value) {
  saveSequence = saveSequence.then(() => fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8'));
  return saveSequence;
}

function mappedUrlMatches(url, localPath, resourceType) {
  try {
    const parsed = new URL(url);
    const cloudName = encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME);
    const publicId = publicIdFor(localPath).split('/').map(encodeURIComponent).join('/');
    return parsed.protocol === 'https:'
      && parsed.hostname === 'res.cloudinary.com'
      && parsed.pathname.startsWith(`/${cloudName}/${resourceType}/upload/`)
      && parsed.pathname.includes(`/${publicId}`);
  } catch {
    return false;
  }
}

async function mappedUrlIsReachable(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    if (response.status === 404) return false;
    if (response.ok) return true;
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function retryable(error) {
  const status = Number(error?.http_code || error?.status || error?.error?.http_code || error?.error?.status || 0);
  return status === 408 || status === 429 || status >= 500 || /ECONNRESET|ETIMEDOUT|Request Timeout|socket hang up/i.test(errorMessage(error));
}

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

async function findExistingAsset(publicId, resourceType) {
  try {
    return await cloudinary.api.resource(publicId, { resource_type: resourceType });
  } catch {
    return null;
  }
}

async function uploadFile(filePath, publicId, resourceType, assetFolder) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        public_id: publicId,
        asset_folder: assetFolder,
        overwrite: false,
        unique_filename: false,
        use_filename: false,
      });
    } catch (error) {
      lastError = error;
      if (/already exists/i.test(errorMessage(error))) {
        const existing = await findExistingAsset(publicId, resourceType);
        if (existing?.secure_url) return existing;
      }
      if (attempt === 3 || !retryable(error)) break;
      await delay(attempt * 1_500);
    }
  }
  throw lastError;
}

const discoveredFiles = (await Promise.all(sourceDirectories.map(async directory => {
  const absoluteDirectory = path.join(publicDirectory, directory);
  try {
    return await collectFiles(absoluteDirectory);
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}))).flat().sort((left, right) => localPublicPath(left).localeCompare(localPublicPath(right), 'en'));
const files = limit ? discoveredFiles.slice(0, limit) : discoveredFiles;

const totalBytes = (await Promise.all(files.map(file => fs.stat(file)))).reduce((sum, stat) => sum + stat.size, 0);
const imageCount = files.filter(file => resourceTypeFor(file) === 'image').length;
const videoCount = files.length - imageCount;
const mediaMap = await readMap();
const failures = [];
const counters = { uploaded: 0, reused: 0, failed: 0, completed: 0 };

console.log(`Encontrados: ${discoveredFiles.length} archivos. Procesando: ${files.length} (${imageCount} imágenes, ${videoCount} videos, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB).`);
console.log(`Concurrencia: ${concurrency}. Destino: ${cloudinaryRoot}/`);

let nextIndex = 0;

async function worker() {
  while (true) {
    const index = nextIndex;
    nextIndex += 1;
    if (index >= files.length) return;

    const filePath = files[index];
    const localPath = localPublicPath(filePath);
    const resourceType = resourceTypeFor(filePath);
    const mappedUrl = mediaMap[localPath];

    try {
      if (typeof mappedUrl === 'string' && mappedUrlMatches(mappedUrl, localPath, resourceType)) {
        const reachable = await mappedUrlIsReachable(mappedUrl);
        // A transient CDN/network error must not trigger an unnecessary upload.
        // Only a confirmed 404 invalidates an otherwise well-formed map entry.
        if (reachable !== false) {
          counters.reused += 1;
          counters.completed += 1;
          console.log(`[${counters.completed}/${files.length}] REUTILIZADO ${localPath}`);
          continue;
        }
      }

      const result = await uploadFile(filePath, publicIdFor(localPath), resourceType, assetFolderFor(localPath));
      if (!result?.secure_url) throw new Error('Cloudinary no devolvió secure_url');
      mediaMap[localPath] = result.secure_url;
      await saveJson(mapPath, Object.fromEntries(Object.entries(mediaMap).sort(([left], [right]) => left.localeCompare(right, 'en'))));
      counters.uploaded += 1;
      counters.completed += 1;
      console.log(`[${counters.completed}/${files.length}] SUBIDO ${localPath}`);
    } catch (error) {
      counters.failed += 1;
      counters.completed += 1;
      const failure = { path: localPath, error: errorMessage(error) };
      failures.push(failure);
      console.error(`[${counters.completed}/${files.length}] ERROR ${localPath}: ${failure.error}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, files.length || 1) }, () => worker()));
await saveJson(failuresPath, failures);
await saveSequence;

console.log('\nResumen de migración');
console.log(`Subidos correctamente: ${counters.uploaded}`);
console.log(`Reutilizados/omitidos: ${counters.reused}`);
console.log(`Fallidos: ${counters.failed}`);
console.log(`Mapa: ${path.relative(projectRoot, mapPath)}`);
if (failures.length > 0) console.log(`Detalle de fallos: ${path.relative(projectRoot, failuresPath)}`);

process.exitCode = failures.length > 0 ? 1 : 0;

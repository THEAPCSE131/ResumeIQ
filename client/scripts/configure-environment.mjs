import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const environmentsDirectory = resolve(scriptsDirectory, '../src/environments');
const templatePath = resolve(environmentsDirectory, 'environment.prod.template.ts');
const outputPath = resolve(environmentsDirectory, 'environment.prod.ts');
const apiBaseUrl = process.env.API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('API_BASE_URL must be set when building the production frontend.');
}

try {
  const parsedUrl = new URL(apiBaseUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('API_BASE_URL must use HTTP or HTTPS.');
  }
} catch (error) {
  throw new Error('API_BASE_URL must be a valid HTTP(S) URL.', { cause: error });
}

const template = await readFile(templatePath, 'utf8');
const configuredSource = template.replace('__API_BASE_URL__', apiBaseUrl.replace(/\/$/, ''));

await mkdir(environmentsDirectory, { recursive: true });
await writeFile(outputPath, configuredSource, 'utf8');

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createApp } from './app.js';
import { readConfig } from './config.js';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const template = readFileSync(
  path.join(appRoot, 'resources', 'Test_Strategy_Template.md'),
  'utf8'
);

export const vercelApp = createApp({ config: readConfig(), template });

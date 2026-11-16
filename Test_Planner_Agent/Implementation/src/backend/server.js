import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { createApp } from './app.js';
import { readConfig } from './config.js';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repositoryRoot = path.resolve(appRoot, '../..');
for (const envPath of [path.join(repositoryRoot, '.env'), path.join(appRoot, '.env')]) {
  if (existsSync(envPath)) dotenv.config({ path: envPath });
}

const templatePath = path.join(appRoot, 'resources', 'TestPlan_Template.md');
const template = await readFile(templatePath, 'utf8');
const config = readConfig();
const port = Number(process.env.PORT || 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const app = createApp({ config, template });
const frontendDirectory = path.join(appRoot, 'public');
const frontendIndex = path.join(frontendDirectory, 'index.html');

if (existsSync(frontendIndex)) {
  app.use(express.static(frontendDirectory));
}

app.get('/{*path}', (request, response, next) => {
  if (request.path.startsWith('/api/')) return next();
  if (!existsSync(frontendIndex)) {
    return response.status(503).send('Frontend build is missing. Run npm run build first.');
  }
  return response.sendFile(frontendIndex, (error) => {
    if (error) next(error);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test planner listening on port ${port}`);
});

import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { readConfig } from './config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
dotenv.config({ path: path.join(root, '.env') });

const templatePath = path.join(root, 'Test_Planner_Agent', 'Resources', 'TestPlan_Template.md');
const template = await readFile(templatePath, 'utf8');
const config = readConfig();
const port = Number(process.env.PORT || 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const app = createApp({ config, template });
app.listen(port, '127.0.0.1', () => {
  console.log(`Test planner backend listening on http://127.0.0.1:${port}`);
});

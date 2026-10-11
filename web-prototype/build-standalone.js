// Script to build a zero-dependency standalone single-file HTML version
// This allows opening the prototype directly via file:// in any browser without CORS module restrictions.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sprites = fs.readFileSync(path.join(__dirname, 'sprites.js'), 'utf8')
  .replace(/export const SPRITES =/, 'const SPRITES =');

const creatures = fs.readFileSync(path.join(__dirname, 'creatures.js'), 'utf8')
  .replace(/export const/g, 'const')
  .replace(/export function/g, 'function');

const audio = fs.readFileSync(path.join(__dirname, 'audio.js'), 'utf8')
  .replace(/export const Sound =/, 'const Sound =');

const storage = fs.readFileSync(path.join(__dirname, 'storage.js'), 'utf8')
  .replace(/export const Storage =/, 'const Storage =');

const battle = fs.readFileSync(path.join(__dirname, 'battle.js'), 'utf8')
  .replace(/import .*?;/g, '')
  .replace(/export class BattleEngine/, 'class BattleEngine');

const app = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8')
  .replace(/import .*?;/g, '')
  .replace(/export function/g, 'function');

const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const combinedJs = `
// MONSTERLINK BUNDLED RUNTIME
(function() {
${sprites}

${creatures}

${audio}

${storage}

${battle}

${app}
})();
`;

// Create standalone bundle.js
fs.writeFileSync(path.join(__dirname, 'bundle.js'), combinedJs);

// Create standalone.html with inlined scripts and styles
const standaloneHtml = html
  .replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', `<script>\n${combinedJs}\n</script>`);

fs.writeFileSync(path.join(__dirname, 'standalone.html'), standaloneHtml);
console.log('Successfully generated web-prototype/bundle.js and web-prototype/standalone.html!');

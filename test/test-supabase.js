import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsPath = join(__dirname, '../src/lib/utils.ts');
let code = readFileSync(tsPath, 'utf8');
code = code.replace(/import[^;]+;/g, '');
code = code.replace(/: [A-Za-z0-9_<>,\[\]| ]+/g, '');
code = code.replace(/export /g, '');
code += '\nmodule.exports = { formatCurrency };';
const module = { exports: {} };
new Function('module', code)(module);
const { formatCurrency } = module.exports;

test('formatCurrency formats numbers as USD', () => {
  assert.strictEqual(formatCurrency(1234.56), '$1,234.56');
});

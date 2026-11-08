/**
 * Offline regression checks for the ML curriculum v2.
 * Run from any cwd: node maintenance/check-ml-curriculum-v2.mjs
 * Uses Node.js built-ins only. This is a structural and arithmetic check, not a browser test.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moduleDir = '机器学习与深度学习基础';
const fixtureNames = [
  'A04-数据特征标签与数据划分.html',
  'B03-梯度下降与参数更新.html',
  'B05-多分类与Softmax.html',
];
const checkedNames = [
  'index.html', '02a-手动训练一个模型.html', '03-线性模型.html',
  '03b-损失函数与输出层进阶.html', '03a-逻辑回归与分类.html',
  '03c-回归输出层.html', ...fixtureNames,
];

function rel(...parts) { return path.join(root, ...parts); }
function text(p) { return readFileSync(p, 'utf8'); }
function findAll(input, re) {
  return [...input.matchAll(re)].map(m => m[1]);
}

const mapping = JSON.parse(text(rel('maintenance', 'polished-pages.json')));
for (const filename of fixtureNames) {
  const output = path.posix.join(moduleDir, filename);
  const hits = mapping.entries.filter(e => e.output === output);
  assert.equal(hits.length, 1, 'Exactly one maintained mapping for ' + filename);
  assert.equal(hits[0].kind, 'recovered_html');
  assert.ok(existsSync(rel(hits[0].source)), 'Missing source ' + hits[0].source);
  assert.equal(text(rel(hits[0].source)), text(rel(output)), 'Source/output mismatch: ' + filename);
}

const index = text(rel(moduleDir, 'index.html'));
assert.equal(index, text(rel('_src', 'recovered_html', moduleDir, 'index.html')));
const cards = [...index.matchAll(/<a class="card" href="([^"]+)" data-md="([^"]+)"/g)]
  .map(m => ({ href: m[1], key: m[2] }));
assert.equal(cards.length, 36, 'Expected 36 published reading cards (including appendices)');
assert.equal(new Set(cards.map(c => c.href)).size, cards.length, 'Duplicate card href');
assert.equal(new Set(cards.map(c => c.key)).size, cards.length, 'Duplicate progress keys');
const progress = index.match(/var KEY="mlbase-progress",FILES=(\[[^\]]+\]),F2H=(\{[\s\S]*?\});/);
assert.ok(progress, 'Missing existing localStorage progress data');
const keys = JSON.parse(progress[1]);
const hrefs = JSON.parse(progress[2]);
assert.deepEqual(keys, cards.map(c => c.key), 'FILES order must match visual card order');
assert.ok(keys.every(key => hrefs[key] && cards.some(c => c.key === key && c.href === hrefs[key])));
assert.ok(keys.includes('03a-逻辑回归与分类.md'), 'Legacy progress keys must remain intact');
assert.ok(keys.includes('B03-梯度下降与参数更新.md'));
assert.ok(keys.includes('B05-多分类与Softmax.md'));

const coreOrder = [
  '03-线性模型.html', '03b-损失函数与输出层进阶.html',
  'B03-梯度下降与参数更新.html', '03a-逻辑回归与分类.html',
  'B05-多分类与Softmax.html',
];
for (let i = 1; i < coreOrder.length; i++) {
  assert.ok(cards.findIndex(c => c.href === coreOrder[i - 1])
    < cards.findIndex(c => c.href === coreOrder[i]), 'Wrong curriculum order');
}
for (const filename of checkedNames) {
  const full = rel(moduleDir, filename);
  assert.ok(existsSync(full), 'Missing lesson: ' + filename);
  const html = text(full);
  const ids = findAll(html, /\bid="([^"]+)"/g);
  assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs: ' + filename);
  assert.equal((html.match(/<main\b/g) || []).length, 1, 'Expected one main in ' + filename);
  assert.equal((html.match(/<\/main>/g) || []).length, 1, 'Missing closing main in ' + filename);
  const links = findAll(html, /\bhref=["']([^"']+\.html(?:#[^"']*)?)["']/g);
  for (const href of links) {
    const file = href.split('#')[0];
    if (!file || /^[a-z][a-z0-9+.-]*:/i.test(file)) continue;
    const destination = path.resolve(path.dirname(full), decodeURIComponent(file));
    assert.ok(destination.startsWith(root + path.sep), 'Link leaves project: ' + href);
    assert.ok(existsSync(destination), 'Broken link from ' + filename + ': ' + href);
  }
}
const checkLinkNav = [
  ['03-线性模型.html', '03b-损失函数与输出层进阶.html'],
  ['03b-损失函数与输出层进阶.html', 'B03-梯度下降与参数更新.html'],
  ['B03-梯度下降与参数更新.html', '03a-逻辑回归与分类.html'],
  ['03a-逻辑回归与分类.html', 'B05-多分类与Softmax.html'],
];
for (const [from, to] of checkLinkNav) {
  const nav = text(rel(moduleDir, from)).match(/<nav class="pagenav">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav && nav.includes('href="' + to + '"'), 'Broken next navigation: ' + from);
}

// Numeric fixtures independently calculate the results displayed in the lessons.
function trainStep(eta, rounds) {
  let w = 5, b = 2;
  for (let t = 0; t < rounds; t++) {
    const e = 3 * w + b - 20;
    w -= eta * 2 * e * 3;
    b -= eta * 2 * e;
  }
  return (3 * w + b - 20) ** 2;
}
function close(actual, expected, tol = 1e-9) {
  assert.ok(Math.abs(actual - expected) < tol, 'Expected ' + expected + ' but got ' + actual);
}
close(trainStep(0.01, 1), 5.76);
close(trainStep(0.05, 1), 0);
close(trainStep(0.1, 2), 9);
close(trainStep(0.2, 1), 81);

function softmax(logits) {
  const shift = Math.max(...logits);
  const scores = logits.map(z => Math.exp(z - shift));
  const sum = scores.reduce((a, b) => a + b, 0);
  return scores.map(s => s / sum);
}
const p = softmax([2, 1, 0]), q = softmax([1000, 999, 998]);
for (let k = 0; k < 3; k++) close(p[k], q[k]);
close(p.reduce((a, b) => a + b, 0), 1);
close(-Math.log(p[1]), 1.4076059644443804);
close(p[1] - 1, -0.7552715289452023);

console.log(JSON.stringify({
  status: 'pass', pagesChecked: checkedNames.length,
  cards: cards.length, sourcePagesChecked: fixtureNames.length,
  numericFixtures: 7, scope: 'offline structural + numeric only',
}, null, 2));

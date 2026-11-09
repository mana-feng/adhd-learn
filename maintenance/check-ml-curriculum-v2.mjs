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
  'C01-回归与分类评估指标.html',
  'C02-过拟合与偏差方差.html',
  'C04-交叉验证与数据泄漏.html',
  'C05-不泄漏的预处理Pipeline.html',
  'D01-KNN与距离度量.html',
  'D02-朴素贝叶斯与概率分类.html',
  'E02-DBSCAN与层次聚类.html',
  'E05-异常检测与孤立森林.html',
];
const checkedNames = [
  'index.html', '02a-手动训练一个模型.html', '03-线性模型.html',
  '03b-损失函数与输出层进阶.html', '03a-逻辑回归与分类.html',
  '03c-回归输出层.html',
  '05-评估与过拟合.html', '05a-正则化与调参实验.html',
  '16-特征工程基础.html', '04-决策树与集成学习.html',
  '06-无监督-聚类与降维.html', '07-从线性到神经网络.html',
  ...fixtureNames,
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
assert.equal(cards.length, 44, 'Expected 44 published reading cards (including appendices)');
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
for (const filename of fixtureNames) {
  const key = filename.replace(/\.html$/, '.md');
  assert.ok(keys.includes(key), 'New lesson must have a unique progress key: ' + key);
}

const coreOrder = [
  '03-线性模型.html', '03b-损失函数与输出层进阶.html',
  'B03-梯度下降与参数更新.html', '03a-逻辑回归与分类.html',
  'B05-多分类与Softmax.html',
  'C01-回归与分类评估指标.html',
  'C02-过拟合与偏差方差.html', 'C04-交叉验证与数据泄漏.html',
  '05-评估与过拟合.html',
  '05a-正则化与调参实验.html', '16-特征工程基础.html',
  'C05-不泄漏的预处理Pipeline.html', 'D01-KNN与距离度量.html',
  'D02-朴素贝叶斯与概率分类.html', '04-决策树与集成学习.html',
  '06-无监督-聚类与降维.html', 'E02-DBSCAN与层次聚类.html',
  'E05-异常检测与孤立森林.html', '07-从线性到神经网络.html',
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
  ['B05-多分类与Softmax.html', 'C01-回归与分类评估指标.html'],
  ['C01-回归与分类评估指标.html', 'C02-过拟合与偏差方差.html'],
  ['C02-过拟合与偏差方差.html', 'C04-交叉验证与数据泄漏.html'],
  ['C04-交叉验证与数据泄漏.html', '05-评估与过拟合.html'],
  ['05-评估与过拟合.html', '05a-正则化与调参实验.html'],
  ['05a-正则化与调参实验.html', '16-特征工程基础.html'],
  ['16-特征工程基础.html', 'C05-不泄漏的预处理Pipeline.html'],
  ['C05-不泄漏的预处理Pipeline.html', 'D01-KNN与距离度量.html'],
  ['D01-KNN与距离度量.html', 'D02-朴素贝叶斯与概率分类.html'],
  ['D02-朴素贝叶斯与概率分类.html', '04-决策树与集成学习.html'],
  ['06-无监督-聚类与降维.html', 'E02-DBSCAN与层次聚类.html'],
  ['E02-DBSCAN与层次聚类.html', 'E05-异常检测与孤立森林.html'],
  ['E05-异常检测与孤立森林.html', '07-从线性到神经网络.html'],
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

// C01 confusion matrix, threshold tradeoff, and regression metrics.
const TP = 4, FP = 6, FN = 1, TN = 89;
const precision = TP / (TP + FP), recall = TP / (TP + FN);
close((TP + TN) / (TP + TN + FP + FN), 0.93);
close(precision, 0.4);
close(recall, 0.8);
close(2 * precision * recall / (precision + recall), 0.5333333333333333);
const scores = [.95, .80, .70, .60, .55, .45, .35, .25, .20, .10];
const labels = [1, 1, 0, 1, 0, 0, 0, 0, 0, 0];
function confusion(t) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  scores.forEach((v, i) => {
    if (v >= t && labels[i]) tp++;
    else if (v >= t) fp++;
    else if (labels[i]) fn++;
    else tn++;
  });
  return [tp, fp, fn, tn];
}
assert.deepEqual(confusion(.5), [3, 2, 0, 5]);
assert.deepEqual(confusion(.8), [2, 0, 1, 7]);
const errors = [2, -2, 3];
close(errors.map(Math.abs).reduce((a, b) => a + b, 0) / 3, 7 / 3);
close(Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / 3), Math.sqrt(17 / 3));
close(1 - 17 / 200, .915);

// C05: fit only on training rows; never learn imputation/scaling from validation.
function median(values) {
  const s = values.filter(x => x !== null).sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function preprocessingStats(values) {
  const middle = median(values);
  const filled = values.map(x => x === null ? middle : x);
  const mean = filled.reduce((a, b) => a + b, 0) / filled.length;
  const sigma = Math.sqrt(filled.reduce((a, b) => a + (b - mean) ** 2, 0) / filled.length);
  return { median: middle, mean, sigma };
}
const train = preprocessingStats([2, 4, null, 6]);
const leaked = preprocessingStats([2, 4, null, 6, 8, 10]);
close(train.median, 4); close(train.mean, 4); close(train.sigma, Math.sqrt(2));
close(leaked.median, 6); close(leaked.mean, 6); close(leaked.sigma, Math.sqrt(20 / 3));
close((8 - train.mean) / train.sigma, 2.82842712474619);
close((8 - leaked.mean) / leaked.sigma, 0.7745966692414834);

// D01: tie-breaking by stable ID; K=1 and K=3 differ in this lesson.
const examples = [
  { id: 'A', x: 2, y: 0 }, { id: 'B', x: 3, y: 0 },
  { id: 'C', x: 4.6, y: 1 }, { id: 'D', x: 6.1, y: 0 },
  { id: 'E', x: 7.4, y: 0 },
];
const neighbors = examples.slice().sort((a, b) =>
  Math.abs(a.x - 5) - Math.abs(b.x - 5) || a.id.localeCompare(b.id));
assert.deepEqual(neighbors.map(x => x.id), ['C', 'D', 'B', 'E', 'A']);
assert.equal(neighbors[0].y, 1);
assert.equal(neighbors.slice(0, 3).reduce((s, x) => s + x.y, 0), 1);

// D02: independent Laplace-smoothed Bernoulli probabilities.
function conditional(countYes, countAll, value, alpha) {
  return (value ? countYes + alpha : countAll - countYes + alpha) / (countAll + 2 * alpha);
}
const bayes1 = .4 * conditional(3, 4, 1, 1) * conditional(2, 4, 1, 1);
const bayes0 = .6 * conditional(0, 6, 1, 1) * conditional(1, 6, 1, 1);
close(bayes1, .13333333333333333);
close(bayes0, .01875);
close(bayes1 / (bayes1 + bayes0), .8767123287671234);
assert.equal(.6 * conditional(0, 6, 1, 0) * conditional(1, 6, 1, 0), 0);


// E02: include the query point itself when counting DBSCAN eps-neighborhood.
const dbscanCoords = [0, 1, 2, 6, 7, 8, 15];
function densityGroups(eps, minPts) {
  const ns = dbscanCoords.map(x => dbscanCoords.map((y, j) => Math.abs(x - y) <= eps + 1e-8 ? j : -1).filter(j => j >= 0));
  const core = ns.map(n => n.length >= minPts);
  const labels = Array(dbscanCoords.length).fill(-1);
  let cluster = 0;
  for (let i = 0; i < core.length; i++) {
    if (!core[i] || labels[i] >= 0) continue;
    labels[i] = cluster;
    const queue = [i], seen = new Set([i]);
    for (let p = 0; p < queue.length; p++) {
      for (const j of ns[queue[p]]) {
        if (labels[j] < 0) labels[j] = cluster;
        if (core[j] && !seen.has(j)) {
          queue.push(j);
          seen.add(j);
        }
      }
    }
    cluster++;
  }
  return {core, labels, cluster};
}
const defaultDensity = densityGroups(1.1, 3);
assert.deepEqual(defaultDensity.core, [false, true, false, false, true, false, false]);
assert.deepEqual(defaultDensity.labels, [0, 0, 0, 1, 1, 1, -1]);
assert.deepEqual(densityGroups(.5, 3).labels, [-1, -1, -1, -1, -1, -1, -1]);
assert.deepEqual(densityGroups(1.1, 4).labels, [-1, -1, -1, -1, -1, -1, -1]);
assert.deepEqual(densityGroups(4.1, 3).labels, [0, 0, 0, 0, 0, 0, -1]);
// Agglomerative single/complete/average linkage for {0,1} vs {5,6}.
const crossDistances = [5, 6, 4, 5];
assert.equal(Math.min(...crossDistances), 4);
assert.equal(Math.max(...crossDistances), 6);
assert.equal(crossDistances.reduce((a, b) => a + b, 0) / 4, 5);

// E05: independent novelty score, not the actual LOF formula.
const normalX = [0, .2, .4, .6, 9, 9.2, 9.4, 9.6];
function neighborScore(x, k = 2) {
  return normalX.map(a => Math.abs(x - a)).sort((a, b) => a - b)
    .slice(0, k).reduce((a, b) => a + b, 0) / k;
}
close(normalX.reduce((a, b) => a + b, 0) / normalX.length, 4.8);
close(neighborScore(5), 4.1);
close(neighborScore(.3), .1);
close(neighborScore(9.3), .1);
close(((1.0 + 1.2) / 2) / .2, 5.5);

// C02: training fit versus genuinely unseen validation points.
const c02Y = [0, 2, 0];
function c02Simple(x) { return 2 / 3; }
function c02Curved(x) { return -2 * x * x + 4 * x; }
function c02Mse(xs, ys, predictor) {
  return xs.reduce((sum, x, i) => sum + (predictor(x) - ys[i]) ** 2, 0) / ys.length;
}
close(c02Mse([0, 1, 2], c02Y, c02Simple), 8 / 9);
close(c02Mse([0, 1, 2], c02Y, c02Curved), 0);
close(c02Mse([.5, 1.5], [0, 0], c02Simple), 4 / 9);
close(c02Mse([.5, 1.5], [0, 0], c02Curved), 2.25);
const c02Repeat = [2, 0, 0], c02Mean = c02Repeat.reduce((a, b) => a + b) / 3;
close(c02Mean, 2 / 3);
close(c02Mean ** 2, 4 / 9);
close(c02Repeat.reduce((a, b) => a + (b - c02Mean) ** 2, 0) / 3, 8 / 9);

// C04: folds, group containment, and forward-chaining time boundaries.
const c04Iid = [[0, 3, 6, 9], [1, 4, 7, 10], [2, 5, 8, 11]];
const c04Groups = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]];
const c04Time = [[3, 4, 5], [6, 7, 8], [9, 10, 11]];
assert.deepEqual(c04Iid.flat().slice().sort((a, b) => a - b), Array.from({length: 12}, (_, i) => i));
assert.ok(c04Iid.every(fold => fold.filter(i => i % 2 === 1).length === 2));
for (const valid of c04Groups) {
  const groupsInValid = new Set(valid.map(i => Math.floor(i / 2)));
  const train = Array.from({length: 12}, (_, i) => i).filter(i => !valid.includes(i));
  assert.ok(train.every(i => !groupsInValid.has(Math.floor(i / 2))));
}
for (let i = 0; i < 3; i++) {
  assert.equal(c04Time[i].length, 3);
  assert.equal(c04Time[i][0], (i + 1) * 3);
  assert.ok(Array.from({length: (i + 1) * 3}, (_, j) => j).every(j => j < c04Time[i][0]));
}
const c04Scores = [.75, .5, 1], c04Mean = c04Scores.reduce((a, b) => a + b) / 3;
close(c04Mean, .75);
close(Math.sqrt(c04Scores.reduce((a, b) => a + (b - c04Mean) ** 2, 0) / 3), Math.sqrt(.125 / 3));

// Ensure old bookmarks and completion key survive the move to optional 05 review.
const oldReview = text(rel(moduleDir, '05-评估与过拟合.html'));
for (const anchor of ['05', '_2', '_3', '_6', '_7', 'confusion-matrix-example',
                      'metric-advanced', 'sampling-prior-example', '05_1', '_8', '_9', '_10']) {
  assert.ok(oldReview.includes('id="' + anchor + '"'), 'Missing legacy 05 bookmark: ' + anchor);
}
assert.ok(oldReview.includes('FILE="05-') || oldReview.includes('FILE="05-\\u'), 'Legacy 05 progress key lost');
for (const [page, inputId] of [['C02-过拟合与偏差方差.html', 'c02Model'],
                              ['C04-交叉验证与数据泄漏.html', 'c04Mode']]) {
  assert.ok(text(rel(moduleDir, page)).includes('id="' + inputId + '"'), 'Missing lab control: ' + inputId);
}

console.log(JSON.stringify({
  status: 'pass', pagesChecked: checkedNames.length,
  cards: cards.length, sourcePagesChecked: fixtureNames.length,
  numericFixtures: 'B03/B05/C01/C02/C04/C05/D01/D02/E02/E05', scope: 'offline structural + numeric only',
}, null, 2));

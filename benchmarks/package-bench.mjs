import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  createLintProof,
  formatLintJsonl,
  formatLintSarif,
  lintFrontier
} from '../dist/index.js';

const args = process.argv.slice(2);
const out = readArg('--out');
const resources = Number(readArg('--resources') ?? 2000);
const runs = Number(readArg('--runs') ?? 9);
const input = buildInput(resources);

const measures = {
  lintRecommended: measure(() => lintFrontier(input), runs),
  formatSarif: measure(() => formatLintSarif(lintFrontier(input)), Math.max(3, Math.ceil(runs / 3))),
  formatJsonl: measure(() => formatLintJsonl(lintFrontier(input)), Math.max(3, Math.ceil(runs / 3))),
  proof: measure(() => createLintProof(lintFrontier(input)), Math.max(3, Math.ceil(runs / 3)))
};

const result = {
  generatedAt: new Date().toISOString(),
  package: '@shapeshift-labs/frontier-linter',
  resources,
  runs,
  measures
};

if (out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(result, null, 2));

function buildInput(count) {
  const resources = [];
  const edges = [];
  const evidence = [];
  for (let i = 0; i < count; i++) {
    const feature = `feature-${i % 20}`;
    resources.push({
      id: `action:${i}`,
      kind: 'action',
      feature,
      owner: `@team/${i % 10}`,
      writes: [`/entities/items/${i}/done`],
      effects: i % 7 === 0 ? ['fetch:/api/items'] : [],
      policies: i % 7 === 0 ? ['policy:item.write'] : [],
      rollback: i % 7 === 0 ? 'action:item.rollback' : undefined,
      tests: [`spec:item.${i}`],
      hotPaths: i % 11 === 0 ? [`hot:item.${i}`] : [],
      benchmarks: i % 11 === 0 ? [`bench:item.${i}`] : [],
      imports: i % 101 === 0 ? ['@shapeshift-labs/frontier-dom'] : []
    });
    resources.push({
      id: `test:spec.item.${i}`,
      kind: 'test',
      feature,
      owner: `@team/${i % 10}`,
      tests: [`spec:item.${i}`],
      covers: [`action:${i}`]
    });
    edges.push({ from: `test:spec.item.${i}`, to: `action:${i}`, kind: 'covers' });
    evidence.push({
      id: `run:${i}`,
      kind: 'test',
      nodes: [`action:${i}`],
      paths: [`/entities/items/${i}/done`],
      timestamp: 1
    });
  }
  return {
    id: 'bench.linter',
    generatedAt: 1,
    resources,
    edges,
    evidence,
    forbiddenImports: ['@shapeshift-labs/frontier-dom'],
    now: 1,
    packages: [
      { name: '@shapeshift-labs/frontier', layer: 0 },
      { name: '@shapeshift-labs/frontier-linter', layer: 1, dependsOn: ['@shapeshift-labs/frontier'] }
    ]
  };
}

function measure(fn, count) {
  if (global.gc) global.gc();
  const samples = [];
  let last;
  for (let i = 0; i < count; i++) {
    const start = performance.now();
    last = fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return {
    minMs: samples[0],
    medianMs: samples[Math.floor(samples.length / 2)],
    maxMs: samples[samples.length - 1],
    p95Ms: samples[Math.min(samples.length - 1, Math.ceil(samples.length * 0.95) - 1)],
    diagnostics: last?.summary?.diagnosticCount
  };
}

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { lintFrontier } from '../dist/index.js';

const args = process.argv.slice(2);
const out = readArg('--out');
const resources = Number(readArg('--resources') ?? 2000);
const runs = Number(readArg('--runs') ?? 7);
const input = buildInput(resources);

const result = {
  generatedAt: new Date().toISOString(),
  package: '@shapeshift-labs/frontier-linter',
  note: 'Competitor-inspired controls model common rule-runner shapes without making package README comparison claims.',
  resources,
  runs,
  measures: {
    frontierRecommended: measure(() => lintFrontier(input).summary.diagnosticCount, runs),
    eslintStyleVisitors: measure(() => eslintStyleVisitors(input), runs),
    biomeStyleSinglePass: measure(() => biomeStyleSinglePass(input), runs),
    sarifStyleCollector: measure(() => sarifStyleCollector(input), runs)
  }
};

if (out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(result, null, 2));

function eslintStyleVisitors(input) {
  const diagnostics = [];
  const visitors = [
    (resource, context) => {
      if (!resource.owner && resource.kind !== 'test') diagnostics.push(['owner', resource.id]);
      if (resource.imports?.some((specifier) => context.forbidden.has(specifier))) diagnostics.push(['import', resource.id]);
    },
    (resource, context) => {
      for (const edge of context.edgesByFrom.get(resource.id) ?? []) {
        if (!context.ids.has(edge.to)) diagnostics.push(['edge', resource.id]);
      }
    }
  ];
  const context = {
    forbidden: new Set(input.forbiddenImports),
    ids: new Set(input.resources.map((resource) => resource.id)),
    edgesByFrom: groupEdges(input.edges)
  };
  for (const resource of input.resources) {
    for (const visitor of visitors) visitor(resource, context);
  }
  return diagnostics.length;
}

function biomeStyleSinglePass(input) {
  const ids = new Set();
  const diagnostics = [];
  for (const resource of input.resources) {
    if (ids.has(resource.id)) diagnostics.push(['duplicate', resource.id]);
    ids.add(resource.id);
    if (!resource.owner && resource.kind !== 'test') diagnostics.push(['owner', resource.id]);
  }
  for (const edge of input.edges) {
    if (!ids.has(edge.to)) diagnostics.push(['edge', edge.to]);
  }
  return diagnostics.length;
}

function sarifStyleCollector(input) {
  const ids = new Set(input.resources.map((resource) => resource.id));
  const results = [];
  for (const edge of input.edges) {
    if (!ids.has(edge.to)) {
      results.push({
        ruleId: 'unknown-edge',
        message: { text: edge.to },
        locations: [{ physicalLocation: { artifactLocation: { uri: edge.from } } }]
      });
    }
  }
  return JSON.stringify({ version: '2.1.0', runs: [{ results }] }).length;
}

function groupEdges(edges) {
  const map = new Map();
  for (const edge of edges) {
    const bucket = map.get(edge.from);
    if (bucket) bucket.push(edge);
    else map.set(edge.from, [edge]);
  }
  return map;
}

function buildInput(count) {
  const resources = [];
  const edges = [];
  const evidence = [];
  for (let i = 0; i < count; i++) {
    resources.push({
      id: `action:${i}`,
      kind: 'action',
      feature: `feature-${i % 20}`,
      owner: i % 37 === 0 ? undefined : `@team/${i % 10}`,
      writes: [`/entities/items/${i}`],
      tests: [`spec:${i}`],
      imports: i % 83 === 0 ? ['@shapeshift-labs/frontier-dom'] : []
    });
    edges.push({ from: `action:${i}`, to: i % 97 === 0 ? `missing:${i}` : `action:${Math.max(0, i - 1)}`, kind: 'depends-on' });
    evidence.push({ id: `run:${i}`, kind: 'test', nodes: [`action:${i}`], paths: [`/entities/items/${i}`] });
  }
  return {
    resources,
    edges,
    evidence,
    forbiddenImports: ['@shapeshift-labs/frontier-dom'],
    now: 1
  };
}

function measure(fn, count) {
  if (global.gc) global.gc();
  const samples = [];
  let last = 0;
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
    output: last
  };
}

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

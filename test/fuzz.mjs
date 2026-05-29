import assert from 'node:assert';
import {
  createLintProof,
  formatLintSarif,
  lintFrontier
} from '../dist/index.js';

const args = process.argv.slice(2);
const cases = Number(readArg('--cases') ?? 400);
let seed = Number(readArg('--seed') ?? 0x51f15e);
let diagnosticTotal = 0;

for (let i = 0; i < cases; i++) {
  const input = randomInput(i);
  const resultA = lintFrontier(input);
  const resultB = lintFrontier(input);
  assert.deepStrictEqual(resultA.diagnostics, resultB.diagnostics, 'lint output should be deterministic');
  assert.strictEqual(createLintProof(resultA).digest, createLintProof(resultB).digest, 'proof digest should be deterministic');
  const sarif = JSON.parse(formatLintSarif(resultA));
  assert.strictEqual(sarif.version, '2.1.0');
  assert.strictEqual(resultA.summary.diagnosticCount, resultA.diagnostics.length);
  assert.strictEqual(resultA.summary.valid, resultA.summary.errorCount === 0);
  diagnosticTotal += resultA.summary.diagnosticCount;
}

console.log(`frontier-linter fuzz ok cases=${cases} diagnostics=${diagnosticTotal}`);

function randomInput(index) {
  const count = 1 + randInt(24);
  const resources = [];
  const edges = [];
  const evidence = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(['feature', 'route', 'view', 'action', 'worker', 'asset', 'test', 'benchmark', 'policy']);
    const id = maybe(0.06) && resources.length ? resources[randInt(resources.length)].id : `${kind}:${index}.${i}`;
    const writes = kind === 'action' || kind === 'worker' ? [maybe(0.1) ? `entities/${i}` : `/entities/${kind}/${i}`] : [];
    resources.push({
      id,
      kind,
      feature: maybe(0.8) ? `feature-${randInt(5)}` : undefined,
      owner: maybe(0.75) ? `@team/${randInt(4)}` : undefined,
      actions: kind === 'route' ? [`action-${randInt(count)}`] : [],
      writes,
      effects: kind === 'action' && maybe(0.35) ? [pick(['fetch:/api/items', 'storage:s3/assets', 'log:local'])] : [],
      policies: maybe(0.3) ? [`policy:${randInt(4)}`] : [],
      tests: maybe(0.4) ? [`spec:${randInt(8)}`] : [],
      hotPaths: maybe(0.25) ? [`hot:${randInt(4)}`] : [],
      benchmarks: maybe(0.2) ? [`bench:${randInt(4)}`] : [],
      dependsOn: maybe(0.2) && resources.length ? [resources[randInt(resources.length)].id] : [],
      imports: maybe(0.2) ? ['@shapeshift-labs/frontier-dom'] : []
    });
    if (maybe(0.35) && resources.length > 1) {
      edges.push({
        from: id,
        to: maybe(0.12) ? `missing:${i}` : resources[randInt(resources.length)].id,
        kind: pick(['depends-on', 'covers', 'touches'])
      });
    }
    if (writes.length && maybe(0.55)) {
      evidence.push({
        id: `evidence:${index}.${i}`,
        kind: pick(['test', 'trace', 'benchmark', 'policy']),
        nodes: [id],
        paths: writes,
        timestamp: Date.now() - randInt(1000 * 60 * 60 * 24 * 60)
      });
    }
  }
  return {
    id: `fuzz:${index}`,
    resources,
    edges,
    evidence,
    forbiddenImports: ['@shapeshift-labs/frontier-dom'],
    now: Date.now(),
    maxEvidenceAgeMs: 1000 * 60 * 60 * 24 * 30
  };
}

function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 0xffffffff;
}

function randInt(max) {
  return Math.floor(rand() * max);
}

function maybe(chance) {
  return rand() < chance;
}

function pick(values) {
  return values[randInt(values.length)];
}

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

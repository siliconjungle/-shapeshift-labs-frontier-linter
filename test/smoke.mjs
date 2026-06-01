import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  applyLintFixes,
  createLintProof,
  createLintRegistryGraph,
  defineLintRule,
  filterLintDiagnostics,
  formatLintGitHubAnnotations,
  formatLintJsonl,
  formatLintSarif,
  lintFrontier,
  lintFrontierText
} from '../dist/index.js';

const customRule = defineLintRule({
  id: 'frontier/custom-smoke',
  meta: { title: 'Custom smoke rule', defaultSeverity: 'info', tags: ['custom'] },
  check() {
    return [{ message: 'custom diagnostic', target: 'feature:todos' }];
  }
});

const input = {
  id: 'lint.smoke',
  generatedAt: 1,
  rules: [customRule],
  forbiddenImports: ['@shapeshift-labs/frontier-dom'],
  packageOrder: ['@shapeshift-labs/frontier', '@shapeshift-labs/frontier-linter', '@shapeshift-labs/frontier-dom'],
  packages: [
    { name: '@shapeshift-labs/frontier-linter', dependsOn: ['@shapeshift-labs/frontier-dom'] }
  ],
  resources: [
    {
      id: 'feature:todos',
      kind: 'feature',
      feature: 'todos',
      owner: '@team/todos',
      tests: ['spec.todos.complete']
    },
    {
      id: 'feature:todos',
      kind: 'feature',
      feature: 'todos',
      owner: '@team/todos'
    },
    {
      id: 'route:/todos',
      kind: 'route',
      feature: 'todos',
      owner: '@team/todos',
      actions: ['todos.complete']
    },
    {
      id: 'action:todos.complete',
      kind: 'action',
      feature: 'todos',
      owner: '@team/todos',
      writes: ['/entities/todos/t1/done'],
      effects: ['fetch:/api/todos'],
      tags: ['agent'],
      imports: ['@shapeshift-labs/frontier-dom'],
      hotPaths: ['todos.complete.latency']
    },
    {
      id: 'benchmark:todos.complete',
      kind: 'benchmark',
      feature: 'todos',
      owner: '@team/perf',
      benchmarks: ['bench.todos.complete'],
      hotPaths: ['todos.complete.latency'],
      covers: ['action:todos.complete']
    }
  ],
  edges: [
    { from: 'action:todos.complete', to: 'missing:node', kind: 'depends-on' },
    { from: 'cycle:a', to: 'cycle:b', kind: 'depends-on' },
    { from: 'cycle:b', to: 'cycle:a', kind: 'depends-on' }
  ],
  evidence: [
    {
      id: 'spec-run:todos.complete',
      kind: 'test',
      nodes: ['action:todos.complete'],
      paths: ['/entities/todos/t1/done'],
      status: 'ok',
      timestamp: 1
    }
  ],
  suppressions: [
    { ruleId: 'frontier/no-stale-evidence', targetId: 'spec-run:todos.complete' }
  ],
  now: 1000 * 60 * 60 * 24 * 40
};

const result = lintFrontier(input);
assert.strictEqual(result.kind, 'frontier.linter.report');
assert.ok(result.summary.errorCount >= 4);
assert.ok(result.summary.warningCount >= 1);
assert.ok(result.summary.suppressedCount >= 1);
assert.ok(result.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/no-duplicate-resource-id'));
assert.ok(result.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/no-unknown-edge-target'));
assert.ok(result.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/no-forbidden-import'));
assert.ok(result.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/package-layer-order'));
assert.ok(result.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/custom-smoke'));

const packageUseResult = lintFrontier({
  id: 'lint.package-use',
  packages: [{ name: '@shapeshift-labs/frontier-dom' }],
  sources: [
    {
      id: 'source:home-view',
      file: 'apps/web/src/components/HomeView.tsx',
      text: "import { state } from '@shapeshift-labs/frontier-dom';\nexport function HomeView() { return <main />; }\n"
    }
  ],
  requiredPackageUses: [
    {
      id: 'frontend-design',
      package: '@shapeshift-labs/frontier-design',
      mode: 'import',
      perSource: true,
      filePatterns: ['apps/web/src/**/*.tsx'],
      reason: 'Frontend TSX must use Frontier design tokens or recipes.',
      tags: ['design', 'frontend']
    }
  ]
});
assert.strictEqual(packageUseResult.summary.errorCount, 1);
assert.ok(packageUseResult.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/require-package-use'));

const packageUseDirectChildGlob = lintFrontier({
  id: 'lint.package-use.direct-child-glob',
  sources: [
    {
      id: 'source:missing-design',
      file: 'apps/web/src/components/MissingDesign.tsx',
      text: "import { state } from '@shapeshift-labs/frontier-dom';\nexport function MissingDesign() { return <main />; }\n"
    }
  ],
  requiredPackageUses: [
    {
      package: '@shapeshift-labs/frontier-design',
      mode: 'import',
      perSource: true,
      filePatterns: ['apps/web/src/components/**/*.tsx']
    }
  ]
});
assert.strictEqual(packageUseDirectChildGlob.summary.errorCount, 1);

const packageUseOk = lintFrontier({
  id: 'lint.package-use.ok',
  sources: [
    {
      id: 'source:home-view',
      file: 'apps/web/src/components/HomeView.tsx',
      text: "import { defineDesignTokens } from '@shapeshift-labs/frontier-design';\nexport function HomeView() { return <main />; }\n"
    }
  ],
  requiredPackageUses: [
    {
      package: '@shapeshift-labs/frontier-design',
      mode: 'import',
      perSource: true,
      filePatterns: ['apps/web/src/**/*.tsx']
    }
  ]
});
assert.strictEqual(packageUseOk.summary.errorCount, 0);

const errors = filterLintDiagnostics(result.diagnostics, { severity: ['error'] });
assert.ok(errors.every((diagnostic) => diagnostic.severity === 'error'));

const jsonl = formatLintJsonl(result);
assert.ok(jsonl.includes('frontier/no-duplicate-resource-id'));
const sarif = JSON.parse(formatLintSarif(result));
assert.strictEqual(sarif.version, '2.1.0');
assert.ok(sarif.runs[0].results.length >= 1);
assert.ok(formatLintGitHubAnnotations(result).includes('::error'));

const registry = createLintRegistryGraph(result);
assert.ok(registry.entries.some((entry) => entry.kind === 'lint-diagnostic'));

const proof = createLintProof(result);
assert.ok(proof.digest.startsWith('fnv1a64:'));
assert.strictEqual(createLintProof(result).digest, proof.digest);

const fixed = applyLintFixes({ resources: { 'feature:todos': {} } }, [
  {
    operations: [
      { op: 'set', path: '/resources/feature:todos/owner', value: '@team/todos' },
      { op: 'append', path: '/resources/feature:todos/tests', value: 'spec.todos.complete' }
    ]
  }
]);
assert.strictEqual(fixed.resources['feature:todos'].owner, '@team/todos');
assert.deepStrictEqual(fixed.resources['feature:todos'].tests, ['spec.todos.complete']);

const sourceResult = lintFrontierText("import { createRoot } from '@shapeshift-labs/frontier-dom';", {
  forbiddenImports: ['@shapeshift-labs/frontier-dom']
});
assert.strictEqual(sourceResult.summary.errorCount, 1);

const tmp = path.join(os.tmpdir(), `frontier-lint-${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify(input));
const packageDir = path.resolve(new URL('..', import.meta.url).pathname);
const cliPath = path.join(packageDir, 'dist', 'cli.js');
try {
  let failed = false;
  try {
    execFileSync(process.execPath, [cliPath, tmp, '--format', 'summary'], { cwd: packageDir });
  } catch (error) {
    failed = true;
    assert.ok(String(error.stdout).includes('frontier-lint invalid'));
  }
  assert.strictEqual(failed, true);
} finally {
  fs.rmSync(tmp, { force: true });
}

console.log('frontier-linter smoke ok');

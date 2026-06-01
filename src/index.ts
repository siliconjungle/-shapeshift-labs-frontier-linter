import type { JsonObject, JsonValue } from '@shapeshift-labs/frontier';
import { cloneJson } from '@shapeshift-labs/frontier/clone';
import {
  createFrontierRegistryGraph,
  normalizeFrontierRegistryPath,
  type FrontierRegistryEdge,
  type FrontierRegistryEntry,
  type FrontierRegistryGraph,
  type FrontierRegistryGraphInput,
  type FrontierRegistryPath,
  type FrontierRegistryRecord,
  type FrontierRegistrySource
} from '@shapeshift-labs/frontier/registry';

export const FRONTIER_LINTER_KIND = 'frontier.linter.report';
export const FRONTIER_LINTER_VERSION = 1;
export const FRONTIER_LINTER_RULE_KIND = 'frontier.linter.rule';
export const FRONTIER_LINTER_RULESET_KIND = 'frontier.linter.ruleset';
export const FRONTIER_LINTER_PROOF_KIND = 'frontier.linter.proof';
export const FRONTIER_LINTER_REGISTRY_KIND = 'frontier.linter.registry';
export const FRONTIER_LINTER_DEFAULT_MAX_EVIDENCE_AGE_MS = 1000 * 60 * 60 * 24 * 30;

export type FrontierLintSeverity = 'off' | 'hint' | 'info' | 'warning' | 'error';
export type FrontierLintRuleId = `frontier/${string}` | string;
export type FrontierLintTargetKind =
  | 'resource'
  | 'node'
  | 'edge'
  | 'evidence'
  | 'source'
  | 'package'
  | 'rule'
  | string;

export type FrontierLintResourceKind =
  | 'feature'
  | 'package'
  | 'owner'
  | 'route'
  | 'view'
  | 'action'
  | 'tool'
  | 'mutation'
  | 'state'
  | 'effect'
  | 'worker'
  | 'asset'
  | 'test'
  | 'trace'
  | 'policy'
  | 'workflow'
  | 'migration'
  | 'benchmark'
  | 'resource'
  | 'task'
  | 'source'
  | 'component'
  | string;

export type FrontierLintEdgeKind =
  | 'depends-on'
  | 'reads-state'
  | 'writes-state'
  | 'covers'
  | 'proves'
  | 'allows'
  | 'guards'
  | 'uses'
  | 'declared-in'
  | 'touches'
  | string;

export type FrontierLintFixOperation =
  | { op: 'set'; path: FrontierRegistryPath; value: JsonValue }
  | { op: 'remove'; path: FrontierRegistryPath }
  | { op: 'append'; path: FrontierRegistryPath; value: JsonValue };

export interface FrontierLintRange {
  file?: string;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
}

export interface FrontierLintFix {
  id?: string;
  title?: string;
  operations: readonly FrontierLintFixOperation[];
  safe?: boolean;
  metadata?: JsonObject;
}

export interface FrontierLintSuggestion extends FrontierLintFix {
  message?: string;
}

export interface FrontierLintTarget {
  id: string;
  kind?: FrontierLintTargetKind;
  file?: string;
  path?: string;
}

export interface FrontierLintDiagnostic {
  id: string;
  ruleId: FrontierLintRuleId;
  severity: Exclude<FrontierLintSeverity, 'off'>;
  message: string;
  target: FrontierLintTarget;
  path?: string;
  range?: FrontierLintRange;
  fixes?: readonly FrontierLintFix[];
  suggestions?: readonly FrontierLintSuggestion[];
  evidence?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierLintRuleMeta {
  title: string;
  description?: string;
  docsUrl?: string;
  defaultSeverity?: FrontierLintSeverity;
  category?: 'correctness' | 'coverage' | 'security' | 'performance' | 'style' | string;
  recommended?: boolean;
  fixable?: boolean;
  tags?: readonly string[];
}

export interface FrontierLintRule {
  id: FrontierLintRuleId;
  meta: FrontierLintRuleMeta;
  check(context: FrontierLintContext): Iterable<FrontierLintDiagnosticInput> | readonly FrontierLintDiagnosticInput[] | void;
}

export interface FrontierLintRuleInput {
  id: FrontierLintRuleId;
  meta: FrontierLintRuleMeta;
  check(context: FrontierLintContext): Iterable<FrontierLintDiagnosticInput> | readonly FrontierLintDiagnosticInput[] | void;
}

export interface FrontierLintRuleset {
  kind: typeof FRONTIER_LINTER_RULESET_KIND;
  version: 1;
  id: string;
  rules: readonly FrontierLintRule[];
  severity?: Record<string, FrontierLintSeverity>;
  metadata?: JsonObject;
}

export interface FrontierLintResourceInput {
  id: string;
  kind?: FrontierLintResourceKind;
  title?: string;
  description?: string;
  package?: string;
  feature?: string;
  owner?: string;
  owners?: readonly string[];
  source?: string | FrontierRegistrySource;
  files?: readonly string[];
  routes?: readonly string[];
  views?: readonly string[];
  actions?: readonly string[];
  tools?: readonly string[];
  mutations?: readonly string[];
  states?: readonly FrontierRegistryPath[];
  reads?: readonly FrontierRegistryPath[];
  writes?: readonly FrontierRegistryPath[];
  effects?: readonly string[];
  workers?: readonly string[];
  assets?: readonly string[];
  tests?: readonly string[];
  traces?: readonly string[];
  policies?: readonly string[];
  workflows?: readonly string[];
  migrations?: readonly string[];
  benchmarks?: readonly string[];
  resources?: readonly string[];
  hotPaths?: readonly string[];
  dependsOn?: readonly string[];
  covers?: readonly string[];
  proves?: readonly string[];
  allows?: readonly string[];
  guards?: readonly string[];
  produces?: readonly string[];
  consumes?: readonly string[];
  imports?: readonly string[];
  rollback?: string | JsonObject;
  tags?: readonly string[];
  metadata?: unknown;
  text?: string;
}

export interface FrontierLintResource {
  id: string;
  kind: FrontierLintResourceKind;
  title: string;
  description?: string;
  package?: string;
  feature?: string;
  owner?: string;
  owners: string[];
  source?: FrontierRegistrySource;
  files: string[];
  routes: string[];
  views: string[];
  actions: string[];
  tools: string[];
  mutations: string[];
  states: string[];
  reads: string[];
  writes: string[];
  effects: string[];
  workers: string[];
  assets: string[];
  tests: string[];
  traces: string[];
  policies: string[];
  workflows: string[];
  migrations: string[];
  benchmarks: string[];
  resources: string[];
  hotPaths: string[];
  dependsOn: string[];
  covers: string[];
  proves: string[];
  allows: string[];
  guards: string[];
  produces: string[];
  consumes: string[];
  imports: string[];
  rollback?: string | JsonObject;
  tags: string[];
  metadata?: JsonObject;
  text?: string;
}

export interface FrontierLintEdgeInput {
  from: string;
  to: string;
  kind?: FrontierLintEdgeKind;
  metadata?: unknown;
}

export interface FrontierLintEdge {
  from: string;
  to: string;
  kind: FrontierLintEdgeKind;
  metadata?: JsonObject;
}

export interface FrontierLintEvidenceInput {
  id?: string;
  kind?: string;
  sourcePackage?: string;
  nodes?: readonly string[];
  paths?: readonly FrontierRegistryPath[];
  features?: readonly string[];
  routes?: readonly string[];
  actions?: readonly string[];
  tests?: readonly string[];
  traces?: readonly string[];
  policies?: readonly string[];
  workflows?: readonly string[];
  benchmarks?: readonly string[];
  status?: string;
  timestamp?: number | string | Date;
  metadata?: unknown;
}

export interface FrontierLintEvidence {
  id: string;
  kind: string;
  sourcePackage?: string;
  nodes: string[];
  paths: string[];
  features: string[];
  routes: string[];
  actions: string[];
  tests: string[];
  traces: string[];
  policies: string[];
  workflows: string[];
  benchmarks: string[];
  status?: string;
  timestamp?: number;
  metadata?: JsonObject;
}

export interface FrontierLintPackageInput {
  id?: string;
  name: string;
  layer?: number;
  package?: string;
  dependsOn?: readonly string[];
  files?: readonly string[];
  metadata?: unknown;
}

export interface FrontierLintPackage {
  id: string;
  name: string;
  layer?: number;
  package?: string;
  dependsOn: string[];
  files: string[];
  metadata?: JsonObject;
}

export interface FrontierLintSourceInput {
  id?: string;
  file?: string;
  package?: string;
  text?: string;
  imports?: readonly string[];
  metadata?: unknown;
}

export type FrontierRequiredPackageUseMode = 'dependency' | 'import' | 'dependency-or-import' | string;

export interface FrontierRequiredPackageUseInput {
  id?: string;
  package: string;
  mode?: FrontierRequiredPackageUseMode;
  required?: boolean;
  perSource?: boolean;
  reason?: string;
  resourceKinds?: readonly string[];
  resourceTags?: readonly string[];
  filePatterns?: readonly string[];
  importPatterns?: readonly string[];
  textPatterns?: readonly string[];
  tags?: readonly string[];
  metadata?: unknown;
}

export interface FrontierRequiredPackageUse {
  id: string;
  package: string;
  mode: FrontierRequiredPackageUseMode;
  required: boolean;
  perSource: boolean;
  reason?: string;
  resourceKinds: string[];
  resourceTags: string[];
  filePatterns: string[];
  importPatterns: string[];
  textPatterns: string[];
  tags: string[];
  metadata?: JsonObject;
}

export interface FrontierLintBudget {
  maxErrors?: number;
  maxWarnings?: number;
  maxDiagnostics?: number;
  maxElapsedMs?: number;
}

export interface FrontierLintSuppression {
  ruleId?: string;
  targetId?: string;
  path?: string;
  reason?: string;
  expiresAt?: number | string | Date;
}

export interface FrontierLintConfig {
  rulesets?: readonly FrontierLintRuleset[];
  rules?: readonly FrontierLintRule[];
  severity?: Record<string, FrontierLintSeverity>;
  disabledRules?: readonly string[];
  suppressions?: readonly FrontierLintSuppression[];
  requireOwnersForKinds?: readonly string[];
  requireFeaturesForKinds?: readonly string[];
  requireTestEvidenceForKinds?: readonly string[];
  requireBenchmarkEvidenceForKinds?: readonly string[];
  dangerousEffectPrefixes?: readonly string[];
  forbiddenImports?: readonly string[];
  packageOrder?: readonly string[];
  requiredPackageUses?: readonly FrontierRequiredPackageUseInput[];
  now?: number | string | Date;
  maxEvidenceAgeMs?: number;
  budgets?: FrontierLintBudget;
  metadata?: unknown;
}

export interface FrontierLintInput extends FrontierLintConfig {
  id?: string;
  generatedAt?: number | string | Date;
  resources?: readonly FrontierLintResourceInput[];
  nodes?: readonly FrontierLintResourceInput[];
  entries?: readonly FrontierRegistryEntry[];
  edges?: readonly FrontierLintEdgeInput[];
  evidence?: readonly FrontierLintEvidenceInput[];
  records?: readonly FrontierRegistryRecord[];
  sources?: readonly FrontierLintSourceInput[];
  packages?: readonly FrontierLintPackageInput[];
}

export interface FrontierLintSummary {
  resourceCount: number;
  edgeCount: number;
  evidenceCount: number;
  packageCount: number;
  sourceCount: number;
  ruleCount: number;
  diagnosticCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  hintCount: number;
  fixableCount: number;
  suppressedCount: number;
  elapsedMs: number;
  valid: boolean;
}

export interface FrontierLintResult {
  kind: typeof FRONTIER_LINTER_KIND;
  version: 1;
  id: string;
  generatedAt: number;
  diagnostics: readonly FrontierLintDiagnostic[];
  suppressed: readonly FrontierLintDiagnostic[];
  summary: FrontierLintSummary;
  metadata?: JsonObject;
}

export interface FrontierLintDiagnosticInput {
  id?: string;
  ruleId?: FrontierLintRuleId;
  severity?: FrontierLintSeverity;
  message: string;
  target?: string | FrontierLintTarget;
  path?: FrontierRegistryPath;
  range?: FrontierLintRange;
  fixes?: readonly FrontierLintFix[];
  suggestions?: readonly FrontierLintSuggestion[];
  evidence?: readonly string[];
  tags?: readonly string[];
  metadata?: unknown;
}

export interface FrontierLintContext {
  readonly id: string;
  readonly generatedAt: number;
  readonly resources: readonly FrontierLintResource[];
  readonly edges: readonly FrontierLintEdge[];
  readonly evidence: readonly FrontierLintEvidence[];
  readonly packages: readonly FrontierLintPackage[];
  readonly sources: readonly FrontierLintSourceInput[];
  readonly duplicateResourceIds: ReadonlyMap<string, readonly FrontierLintResource[]>;
  readonly resourcesById: ReadonlyMap<string, FrontierLintResource>;
  readonly evidenceByNode: ReadonlyMap<string, readonly FrontierLintEvidence[]>;
  readonly evidenceByPath: ReadonlyMap<string, readonly FrontierLintEvidence[]>;
  readonly evidenceByKind: ReadonlyMap<string, readonly FrontierLintEvidence[]>;
  readonly packagesByName: ReadonlyMap<string, FrontierLintPackage>;
  readonly config: RequiredFrontierLintConfig;
  hasResource(id: string): boolean;
  hasEvidence(target: string, kinds?: readonly string[]): boolean;
  hasCoverage(target: string, kinds?: readonly string[]): boolean;
  pathHasCoverage(path: FrontierRegistryPath, kinds?: readonly string[]): boolean;
  resourceEvidence(resource: FrontierLintResource, kinds?: readonly string[]): readonly FrontierLintEvidence[];
  normalizePath(path: FrontierRegistryPath): string;
}

export interface RequiredFrontierLintConfig {
  rulesets: readonly FrontierLintRuleset[];
  rules: readonly FrontierLintRule[];
  severity: Record<string, FrontierLintSeverity>;
  disabledRules: readonly string[];
  suppressions: readonly FrontierLintSuppression[];
  requireOwnersForKinds: readonly string[];
  requireFeaturesForKinds: readonly string[];
  requireTestEvidenceForKinds: readonly string[];
  requireBenchmarkEvidenceForKinds: readonly string[];
  dangerousEffectPrefixes: readonly string[];
  forbiddenImports: readonly string[];
  packageOrder: readonly string[];
  requiredPackageUses: readonly FrontierRequiredPackageUse[];
  now: number;
  maxEvidenceAgeMs: number;
  budgets: FrontierLintBudget;
  metadata?: JsonObject;
}

export interface FrontierLintProof {
  kind: typeof FRONTIER_LINTER_PROOF_KIND;
  version: 1;
  reportId: string;
  generatedAt: number;
  digest: string;
  summary: FrontierLintSummary;
  diagnostics: readonly { id: string; ruleId: string; severity: string; target: string; path?: string }[];
}

const defaultOwnerKinds = ['feature', 'route', 'view', 'action', 'tool', 'mutation', 'effect', 'worker', 'asset', 'workflow', 'migration', 'benchmark'];
const defaultFeatureKinds = ['route', 'view', 'action', 'tool', 'mutation', 'effect', 'worker', 'asset', 'test', 'trace', 'policy', 'workflow', 'migration', 'benchmark'];
const defaultTestEvidenceKinds = ['action', 'tool', 'mutation', 'effect', 'workflow', 'worker'];
const defaultBenchmarkEvidenceKinds = ['action', 'tool', 'mutation', 'worker', 'view'];
const defaultDangerousEffectPrefixes = ['fetch:', 'http:', 'https:', 'storage:', 'db:', 'sql:', 'queue:', 'worker:', 'email:', 'payment:', 'secret:'];

export function defineLintRule(input: FrontierLintRuleInput): FrontierLintRule {
  return {
    id: input.id,
    meta: {
      ...input.meta,
      tags: dedupeStrings(input.meta.tags ?? [])
    },
    check: input.check
  };
}

export function createLintRuleset(input: {
  id?: string;
  rules?: readonly FrontierLintRule[];
  severity?: Record<string, FrontierLintSeverity>;
  metadata?: unknown;
} = {}): FrontierLintRuleset {
  return {
    kind: FRONTIER_LINTER_RULESET_KIND,
    version: 1,
    id: input.id ?? 'frontier.recommended',
    rules: (input.rules ?? frontierRecommendedRules).slice(),
    severity: input.severity ? { ...input.severity } : undefined,
    metadata: asJsonObject(input.metadata)
  };
}

export function createLintResource(input: FrontierLintResourceInput): FrontierLintResource {
  const kind = input.kind ?? inferResourceKind(input.id);
  return {
    id: input.id,
    kind,
    title: input.title ?? input.id,
    description: input.description,
    package: input.package,
    feature: input.feature,
    owner: input.owner,
    owners: dedupeStrings((input.owner ? [input.owner] : []).concat(input.owners ?? [])),
    source: normalizeSource(input.source),
    files: dedupeStrings(input.files ?? []),
    routes: dedupeStrings(input.routes ?? []),
    views: dedupeStrings(input.views ?? []),
    actions: dedupeStrings(input.actions ?? []),
    tools: dedupeStrings(input.tools ?? []),
    mutations: dedupeStrings(input.mutations ?? []),
    states: normalizePaths(input.states ?? []),
    reads: normalizePaths(input.reads ?? []),
    writes: normalizePaths(input.writes ?? []),
    effects: dedupeStrings(input.effects ?? []),
    workers: dedupeStrings(input.workers ?? []),
    assets: dedupeStrings(input.assets ?? []),
    tests: dedupeStrings(input.tests ?? []),
    traces: dedupeStrings(input.traces ?? []),
    policies: dedupeStrings(input.policies ?? []),
    workflows: dedupeStrings(input.workflows ?? []),
    migrations: dedupeStrings(input.migrations ?? []),
    benchmarks: dedupeStrings(input.benchmarks ?? []),
    resources: dedupeStrings(input.resources ?? []),
    hotPaths: dedupeStrings(input.hotPaths ?? []),
    dependsOn: dedupeStrings(input.dependsOn ?? []),
    covers: dedupeStrings(input.covers ?? []),
    proves: dedupeStrings(input.proves ?? []),
    allows: dedupeStrings(input.allows ?? []),
    guards: dedupeStrings(input.guards ?? []),
    produces: dedupeStrings(input.produces ?? []),
    consumes: dedupeStrings(input.consumes ?? []),
    imports: dedupeStrings((input.imports ?? []).concat(extractImports(input.text))),
    rollback: normalizeRollback(input.rollback),
    tags: dedupeStrings(input.tags ?? []),
    metadata: asJsonObject(input.metadata),
    text: input.text
  };
}

export function createLintContext(input: FrontierLintInput, config: FrontierLintConfig = {}): FrontierLintContext {
  const mergedConfig = normalizeConfig(input, config);
  const resources = normalizeResources(input);
  const edges = normalizeEdges(input);
  const evidence = normalizeEvidence(input);
  const packages = normalizePackages(input);
  const sources = (input.sources ?? []).map((source, index) => normalizeSourceInput(source, index));
  const generatedAt = toTimestamp(input.generatedAt) ?? mergedConfig.now;
  const resourcesById = new Map<string, FrontierLintResource>();
  const resourceBuckets = new Map<string, FrontierLintResource[]>();
  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    if (!resourcesById.has(resource.id)) resourcesById.set(resource.id, resource);
    appendMapArray(resourceBuckets, resource.id, resource);
  }
  const duplicateResourceIds = new Map<string, readonly FrontierLintResource[]>();
  for (const [id, bucket] of resourceBuckets) {
    if (bucket.length > 1) duplicateResourceIds.set(id, bucket.slice());
  }
  const evidenceByNode = new Map<string, FrontierLintEvidence[]>();
  const evidenceByPath = new Map<string, FrontierLintEvidence[]>();
  const evidenceByKind = new Map<string, FrontierLintEvidence[]>();
  for (const item of evidence) {
    appendMapArray(evidenceByKind, item.kind, item);
    for (const node of item.nodes) appendMapArray(evidenceByNode, node, item);
    for (const path of item.paths) appendMapArray(evidenceByPath, path, item);
  }
  const packagesByName = new Map<string, FrontierLintPackage>();
  for (const pkg of packages) packagesByName.set(pkg.name, pkg);
  return {
    id: input.id ?? 'frontier.lint',
    generatedAt,
    resources,
    edges,
    evidence,
    packages,
    sources,
    duplicateResourceIds,
    resourcesById,
    evidenceByNode,
    evidenceByPath,
    evidenceByKind,
    packagesByName,
    config: mergedConfig,
    hasResource(id) {
      return resourcesById.has(id) || resources.some((resource) => resourceContainsAlias(resource, id));
    },
    hasEvidence(target, kinds) {
      const items = collectEvidenceForTarget(evidenceByNode, evidenceByPath, target);
      return kinds === undefined ? items.length > 0 : items.some((item) => kinds.includes(item.kind));
    },
    hasCoverage(target, kinds = ['test', 'trace', 'replay', 'benchmark']) {
      return this.hasEvidence(target, kinds);
    },
    pathHasCoverage(path, kinds = ['test', 'trace', 'replay', 'benchmark']) {
      const normalized = normalizeFrontierRegistryPath(path);
      const exact = evidenceByPath.get(normalized);
      if (exact?.some((item) => kinds.includes(item.kind))) return true;
      for (const [knownPath, items] of evidenceByPath) {
        if (!pathsOverlap(knownPath, normalized)) continue;
        if (items.some((item) => kinds.includes(item.kind))) return true;
      }
      return false;
    },
    resourceEvidence(resource, kinds) {
      const items = collectEvidenceForResource(resource, evidenceByNode, evidenceByPath);
      return kinds === undefined ? items : items.filter((item) => kinds.includes(item.kind));
    },
    normalizePath(path) {
      return normalizeFrontierRegistryPath(path);
    }
  };
}

export function lintFrontier(input: FrontierLintInput, config: FrontierLintConfig = {}): FrontierLintResult {
  const start = nowMs();
  const context = createLintContext(input, config);
  const rules = activeRules(context.config);
  const diagnostics: FrontierLintDiagnostic[] = [];
  const suppressed: FrontierLintDiagnostic[] = [];
  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const rule = rules[ruleIndex];
    const severity = ruleSeverity(rule, context.config);
    if (severity === 'off') continue;
    const findings = rule.check(context);
    if (!findings) continue;
    let findingIndex = 0;
    for (const finding of findings) {
      const diagnostic = normalizeDiagnostic(rule, severity, finding, ruleIndex, findingIndex++);
      if (isSuppressed(diagnostic, context.config.suppressions, context.config.now)) suppressed[suppressed.length] = diagnostic;
      else diagnostics[diagnostics.length] = diagnostic;
      const maxDiagnostics = context.config.budgets.maxDiagnostics;
      if (maxDiagnostics !== undefined && diagnostics.length >= maxDiagnostics) break;
    }
  }
  diagnostics.sort(compareDiagnostics);
  suppressed.sort(compareDiagnostics);
  const elapsedMs = nowMs() - start;
  return {
    kind: FRONTIER_LINTER_KIND,
    version: 1,
    id: context.id,
    generatedAt: context.generatedAt,
    diagnostics,
    suppressed,
    summary: summarizeLintDiagnostics(context, diagnostics, suppressed, elapsedMs, rules.length),
    metadata: context.config.metadata
  };
}

export function lintFrontierText(text: string, input: Omit<FrontierLintInput, 'sources' | 'resources'> = {}): FrontierLintResult {
  return lintFrontier({
    ...input,
    resources: [
      ...(input.nodes ?? []),
      {
        id: 'source:inline',
        kind: 'source',
        text,
        imports: extractImports(text)
      }
    ]
  });
}

export function summarizeLintResult(result: FrontierLintResult): FrontierLintSummary {
  return { ...result.summary };
}

export function filterLintDiagnostics(
  diagnostics: readonly FrontierLintDiagnostic[],
  input: { severity?: readonly FrontierLintSeverity[]; ruleIds?: readonly string[]; targetIds?: readonly string[]; tags?: readonly string[] } = {}
): FrontierLintDiagnostic[] {
  const severity = input.severity ? new Set(input.severity) : undefined;
  const ruleIds = input.ruleIds ? new Set(input.ruleIds) : undefined;
  const targetIds = input.targetIds ? new Set(input.targetIds) : undefined;
  const tags = input.tags ? new Set(input.tags) : undefined;
  return diagnostics.filter((diagnostic) => {
    if (severity && !severity.has(diagnostic.severity)) return false;
    if (ruleIds && !ruleIds.has(diagnostic.ruleId)) return false;
    if (targetIds && !targetIds.has(diagnostic.target.id)) return false;
    if (tags && !(diagnostic.tags ?? []).some((tag) => tags.has(tag))) return false;
    return true;
  });
}

export function applyLintFixes<T extends JsonValue>(document: T, fixes: readonly FrontierLintFix[]): T {
  let next = cloneJson(document) as T;
  for (const fix of fixes) {
    for (const operation of fix.operations) {
      next = applyLintFixOperation(next, operation);
    }
  }
  return next;
}

export function formatLintJson(result: FrontierLintResult, space = 2): string {
  return JSON.stringify(result, null, space);
}

export function formatLintJsonl(result: FrontierLintResult): string {
  return result.diagnostics.map((diagnostic) => JSON.stringify(diagnostic)).join('\n') + (result.diagnostics.length ? '\n' : '');
}

export function formatLintGitHubAnnotations(result: FrontierLintResult): string {
  return result.diagnostics.map((diagnostic) => {
    const command = diagnostic.severity === 'error' ? 'error' : diagnostic.severity === 'warning' ? 'warning' : 'notice';
    const range = diagnostic.range ?? {};
    const props = [
      diagnostic.range?.file ?? diagnostic.target.file ? `file=${escapeAnnotationProperty(diagnostic.range?.file ?? diagnostic.target.file ?? '')}` : '',
      range.startLine ? `line=${range.startLine}` : '',
      range.startColumn ? `col=${range.startColumn}` : '',
      range.endLine ? `endLine=${range.endLine}` : '',
      range.endColumn ? `endColumn=${range.endColumn}` : '',
      `title=${escapeAnnotationProperty(diagnostic.ruleId)}`
    ].filter(Boolean).join(',');
    return `::${command} ${props}::${escapeAnnotationMessage(diagnostic.message)}`;
  }).join('\n') + (result.diagnostics.length ? '\n' : '');
}

export function formatLintSarif(result: FrontierLintResult, options: { uriBaseId?: string; toolName?: string } = {}): string {
  const rules = new Map<string, FrontierLintDiagnostic[]>();
  for (const diagnostic of result.diagnostics) appendMapArray(rules, diagnostic.ruleId, diagnostic);
  return JSON.stringify({
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: options.toolName ?? '@shapeshift-labs/frontier-linter',
            informationUri: 'https://github.com/siliconjungle/-shapeshift-labs-frontier-linter',
            rules: Array.from(rules.keys()).sort().map((ruleId) => ({
              id: ruleId,
              name: ruleId,
              shortDescription: { text: ruleId },
              properties: {
                tags: dedupeStrings(rules.get(ruleId)?.flatMap((diagnostic) => diagnostic.tags ?? []) ?? [])
              }
            }))
          }
        },
        invocations: [
          {
            executionSuccessful: result.summary.errorCount === 0,
            startTimeUtc: new Date(result.generatedAt).toISOString(),
            properties: { reportId: result.id }
          }
        ],
        results: result.diagnostics.map((diagnostic) => ({
          ruleId: diagnostic.ruleId,
          level: diagnostic.severity === 'error' ? 'error' : diagnostic.severity === 'warning' ? 'warning' : 'note',
          message: { text: diagnostic.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: diagnostic.range?.file ?? diagnostic.target.file ?? diagnostic.target.id,
                  uriBaseId: options.uriBaseId
                },
                region: {
                  startLine: diagnostic.range?.startLine ?? 1,
                  startColumn: diagnostic.range?.startColumn ?? 1,
                  endLine: diagnostic.range?.endLine,
                  endColumn: diagnostic.range?.endColumn
                }
              },
              logicalLocations: [
                {
                  name: diagnostic.target.id,
                  kind: diagnostic.target.kind
                }
              ]
            }
          ],
          properties: {
            id: diagnostic.id,
            path: diagnostic.path,
            evidence: diagnostic.evidence,
            tags: diagnostic.tags
          }
        })),
        properties: {
          summary: result.summary
        }
      }
    ]
  }, null, 2);
}

export function createLintRegistryGraph(result: FrontierLintResult, input: FrontierRegistryGraphInput = {}): FrontierRegistryGraph {
  const entries: FrontierRegistryEntry[] = result.diagnostics.map((diagnostic) => ({
    id: 'diagnostic:' + diagnostic.id,
    kind: 'lint-diagnostic',
    description: diagnostic.message,
    feature: diagnostic.target.id.startsWith('feature:') ? diagnostic.target.id.slice('feature:'.length) : undefined,
    source: diagnostic.range?.file ? { file: diagnostic.range.file, line: diagnostic.range.startLine } : undefined,
    reads: diagnostic.path ? [diagnostic.path] : [],
    affects: [diagnostic.target.id],
    tags: [diagnostic.severity, diagnostic.ruleId].concat(diagnostic.tags ?? []),
    metadata: compactJsonObject({
      severity: diagnostic.severity,
      ruleId: diagnostic.ruleId,
      fixable: Boolean(diagnostic.fixes?.length),
      ...(diagnostic.metadata ?? {})
    })
  }));
  const records: FrontierRegistryRecord[] = result.diagnostics.map((diagnostic) => ({
    id: 'record:' + diagnostic.id,
    entryId: 'diagnostic:' + diagnostic.id,
    kind: diagnostic.severity,
    status: diagnostic.severity === 'error' ? 'failed' : 'warn',
    startedAt: result.generatedAt,
    affected: [diagnostic.target.id].concat(diagnostic.evidence ?? []),
    metadata: compactJsonObject({ ruleId: diagnostic.ruleId })
  }));
  const edges: FrontierRegistryEdge[] = result.diagnostics.map((diagnostic) => ({
    from: 'diagnostic:' + diagnostic.id,
    to: diagnostic.target.id,
    kind: 'flags'
  }));
  return createFrontierRegistryGraph({
    generatedAt: result.generatedAt,
    entries: (input.entries ?? []).concat(entries),
    records: (input.records ?? []).concat(records),
    edges: (input.edges ?? []).concat(edges),
    metadata: compactJsonObject({ ...(input.metadata ?? {}), reportId: result.id, linterKind: FRONTIER_LINTER_REGISTRY_KIND })
  });
}

export function createLintProof(result: FrontierLintResult): FrontierLintProof {
  const diagnostics = result.diagnostics.map((diagnostic) => ({
    id: diagnostic.id,
    ruleId: diagnostic.ruleId,
    severity: diagnostic.severity,
    target: diagnostic.target.id,
    path: diagnostic.path
  }));
  const proofSummary = { ...result.summary, elapsedMs: 0 };
  const payload = stableStringify({
    kind: FRONTIER_LINTER_PROOF_KIND,
    version: 1,
    reportId: result.id,
    generatedAt: result.generatedAt,
    summary: proofSummary,
    diagnostics
  });
  return {
    kind: FRONTIER_LINTER_PROOF_KIND,
    version: 1,
    reportId: result.id,
    generatedAt: result.generatedAt,
    digest: 'fnv1a64:' + fnv1a64(payload),
    summary: result.summary,
    diagnostics
  };
}

export const duplicateResourceIdRule = defineLintRule({
  id: 'frontier/no-duplicate-resource-id',
  meta: {
    title: 'Resource IDs must be unique',
    description: 'Duplicate resource IDs make impact, policy, and evidence queries ambiguous.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['graph', 'identity']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const [id, resources] of context.duplicateResourceIds) {
      diagnostics.push({
        message: `Resource id "${id}" appears ${resources.length} times.`,
        target: { id, kind: 'resource' },
        tags: ['identity']
      });
    }
    return diagnostics;
  }
});

export const unknownEdgeTargetRule = defineLintRule({
  id: 'frontier/no-unknown-edge-target',
  meta: {
    title: 'Edges must target known resources',
    description: 'Edges to missing resources break graph impact and provenance queries.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['graph']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const edge of context.edges) {
      if (!context.hasResource(edge.from)) {
        diagnostics.push({
          message: `Edge source "${edge.from}" is not declared as a resource.`,
          target: { id: edge.from, kind: 'edge' },
          metadata: { to: edge.to, edgeKind: edge.kind },
          tags: ['graph']
        });
      }
      if (!context.hasResource(edge.to)) {
        diagnostics.push({
          message: `Edge target "${edge.to}" is not declared as a resource.`,
          target: { id: edge.to, kind: 'edge' },
          metadata: { from: edge.from, edgeKind: edge.kind },
          tags: ['graph']
        });
      }
    }
    return diagnostics;
  }
});

export const validJsonPointerRule = defineLintRule({
  id: 'frontier/valid-json-pointer',
  meta: {
    title: 'State paths must be valid JSON Pointers',
    description: 'Frontier state paths should be JSON Pointer strings so patch and evidence paths line up.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['path', 'json-pointer']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const resource of context.resources) {
      for (const path of resource.states.concat(resource.reads, resource.writes)) {
        if (!isValidJsonPointer(path)) {
          diagnostics.push({
            message: `Path "${path}" is not a valid JSON Pointer.`,
            target: { id: resource.id, kind: 'resource' },
            path,
            tags: ['path']
          });
        }
      }
    }
    for (const item of context.evidence) {
      for (const path of item.paths) {
        if (!isValidJsonPointer(path)) {
          diagnostics.push({
            message: `Evidence path "${path}" is not a valid JSON Pointer.`,
            target: { id: item.id, kind: 'evidence' },
            path,
            tags: ['path']
          });
        }
      }
    }
    return diagnostics;
  }
});

export const requireOwnerRule = defineLintRule({
  id: 'frontier/require-owner',
  meta: {
    title: 'Linted resources should name an owner',
    description: 'Owners make diagnostics actionable during package and feature review.',
    defaultSeverity: 'warning',
    category: 'coverage',
    recommended: true,
    tags: ['ownership']
  },
  check(context) {
    return context.resources
      .filter((resource) => context.config.requireOwnersForKinds.includes(resource.kind) && resource.owners.length === 0)
      .map((resource) => ({
        message: `${resource.kind} "${resource.id}" has no owner.`,
        target: { id: resource.id, kind: 'resource' },
        fixes: [
          {
            title: 'Add owner placeholder',
            safe: false,
            operations: [{ op: 'set', path: `/resources/${escapePointerToken(resource.id)}/owner`, value: 'owner:unknown' }]
          }
        ],
        tags: ['ownership']
      }));
  }
});

export const requireFeatureRule = defineLintRule({
  id: 'frontier/require-feature',
  meta: {
    title: 'Linted resources should map to a feature',
    description: 'Feature links make app impact and coverage reports queryable.',
    defaultSeverity: 'warning',
    category: 'coverage',
    recommended: true,
    tags: ['feature-map']
  },
  check(context) {
    return context.resources
      .filter((resource) => context.config.requireFeaturesForKinds.includes(resource.kind) && !resource.feature)
      .map((resource) => ({
        message: `${resource.kind} "${resource.id}" has no feature.`,
        target: { id: resource.id, kind: 'resource' },
        tags: ['feature-map']
      }));
  }
});

export const orphanRouteActionRule = defineLintRule({
  id: 'frontier/no-orphan-route-action',
  meta: {
    title: 'Route actions must resolve to action resources',
    description: 'Routes that expose actions should point at declared action/tool resources.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['route', 'action']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const resource of context.resources) {
      if (resource.kind !== 'route') continue;
      for (const action of resource.actions.concat(resource.tools)) {
        if (!context.hasResource(action) && !context.hasResource('action:' + action) && !context.hasResource('tool:' + action)) {
          diagnostics.push({
            message: `Route "${resource.id}" references undeclared action "${action}".`,
            target: { id: resource.id, kind: 'resource' },
            evidence: [action],
            tags: ['route', 'action']
          });
        }
      }
    }
    return diagnostics;
  }
});

export const requireTestEvidenceRule = defineLintRule({
  id: 'frontier/require-test-evidence',
  meta: {
    title: 'Mutable resources need test evidence',
    description: 'Actions, mutations, workers, effects, and workflows should have test, trace, or replay evidence.',
    defaultSeverity: 'warning',
    category: 'coverage',
    recommended: true,
    tags: ['tests', 'evidence']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const resource of context.resources) {
      if (!context.config.requireTestEvidenceForKinds.includes(resource.kind)) continue;
      const writes = resource.writes.length > 0 || resource.effects.length > 0 || resource.workers.length > 0;
      if (!writes) continue;
      const declared = resource.tests.length > 0 || resource.traces.length > 0 || resource.proves.length > 0;
      if (declared || context.hasCoverage(resource.id, ['test', 'trace', 'replay'])) continue;
      diagnostics.push({
        message: `${resource.kind} "${resource.id}" writes or performs effects without test/trace evidence.`,
        target: { id: resource.id, kind: 'resource' },
        tags: ['tests', 'evidence']
      });
    }
    return diagnostics;
  }
});

export const requireBenchmarkEvidenceRule = defineLintRule({
  id: 'frontier/require-benchmark-evidence',
  meta: {
    title: 'Hot paths need benchmark evidence',
    description: 'Resources declaring hot paths should be protected by benchmark evidence.',
    defaultSeverity: 'warning',
    category: 'performance',
    recommended: true,
    tags: ['benchmark', 'performance']
  },
  check(context) {
    return context.resources
      .filter((resource) => context.config.requireBenchmarkEvidenceForKinds.includes(resource.kind))
      .filter((resource) => resource.hotPaths.length > 0 && resource.benchmarks.length === 0 && !context.hasCoverage(resource.id, ['benchmark']))
      .map((resource) => ({
        message: `${resource.kind} "${resource.id}" declares hot paths without benchmark evidence.`,
        target: { id: resource.id, kind: 'resource' },
        evidence: resource.hotPaths,
        tags: ['benchmark', 'performance']
      }));
  }
});

export const dangerousEffectPolicyRule = defineLintRule({
  id: 'frontier/no-dangerous-effect-without-policy',
  meta: {
    title: 'Dangerous effects require policy guards',
    description: 'External, storage, queue, email, payment, and secret effects should be guarded by policies.',
    defaultSeverity: 'error',
    category: 'security',
    recommended: true,
    tags: ['policy', 'effect']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const resource of context.resources) {
      const dangerousEffects = resource.effects.filter((effect) => context.config.dangerousEffectPrefixes.some((prefix) => effect.startsWith(prefix)));
      if (dangerousEffects.length === 0) continue;
      if (resource.policies.length > 0 || resource.guards.length > 0 || context.hasCoverage(resource.id, ['policy'])) continue;
      diagnostics.push({
        message: `${resource.kind} "${resource.id}" uses dangerous effects without policy guards.`,
        target: { id: resource.id, kind: 'resource' },
        evidence: dangerousEffects,
        tags: ['policy', 'effect']
      });
    }
    return diagnostics;
  }
});

export const effectfulRollbackRule = defineLintRule({
  id: 'frontier/require-rollback-for-effectful-action',
  meta: {
    title: 'Effectful actions should declare rollback',
    description: 'Rollback or compensation links make agent and workflow execution recoverable.',
    defaultSeverity: 'warning',
    category: 'correctness',
    recommended: true,
    tags: ['rollback', 'effect']
  },
  check(context) {
    return context.resources
      .filter((resource) => (resource.kind === 'action' || resource.kind === 'tool' || resource.kind === 'workflow') && resource.effects.length > 0 && resource.rollback === undefined)
      .map((resource) => ({
        message: `${resource.kind} "${resource.id}" has effects but no rollback or compensation metadata.`,
        target: { id: resource.id, kind: 'resource' },
        evidence: resource.effects,
        tags: ['rollback', 'effect']
      }));
  }
});

export const uncoveredStateWriteRule = defineLintRule({
  id: 'frontier/no-uncovered-state-write',
  meta: {
    title: 'State writes should be covered',
    description: 'Each declared state write should have test, trace, replay, or benchmark evidence.',
    defaultSeverity: 'warning',
    category: 'coverage',
    recommended: true,
    tags: ['state', 'coverage']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const resource of context.resources) {
      for (const path of resource.writes) {
        if (resource.tests.length || resource.traces.length || context.pathHasCoverage(path)) continue;
        diagnostics.push({
          message: `State write "${path}" from "${resource.id}" has no evidence coverage.`,
          target: { id: resource.id, kind: 'resource' },
          path,
          tags: ['state', 'coverage']
        });
      }
    }
    return diagnostics;
  }
});

export const staleEvidenceRule = defineLintRule({
  id: 'frontier/no-stale-evidence',
  meta: {
    title: 'Evidence should not be stale',
    description: 'Old test, benchmark, and trace evidence should be refreshed before relying on it.',
    defaultSeverity: 'warning',
    category: 'coverage',
    recommended: true,
    tags: ['evidence']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const item of context.evidence) {
      if (item.timestamp === undefined) continue;
      const age = context.config.now - item.timestamp;
      if (age <= context.config.maxEvidenceAgeMs) continue;
      diagnostics.push({
        message: `Evidence "${item.id}" is older than ${context.config.maxEvidenceAgeMs}ms.`,
        target: { id: item.id, kind: 'evidence' },
        metadata: { ageMs: age },
        tags: ['evidence']
      });
    }
    return diagnostics;
  }
});

export const cyclicDependencyRule = defineLintRule({
  id: 'frontier/no-cyclic-dependency',
  meta: {
    title: 'Dependency edges should be acyclic',
    description: 'Cycles make package and application impact ordering ambiguous.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['graph', 'dependency']
  },
  check(context) {
    const adjacency = new Map<string, string[]>();
    for (const resource of context.resources) {
      for (const dep of resource.dependsOn) appendMapArray(adjacency, resource.id, dep);
    }
    for (const edge of context.edges) {
      if (edge.kind === 'depends-on') appendMapArray(adjacency, edge.from, edge.to);
    }
    const cycles = findCycles(adjacency, 32);
    return cycles.map((cycle) => ({
      message: `Dependency cycle detected: ${cycle.join(' -> ')}.`,
      target: { id: cycle[0] ?? 'dependency-cycle', kind: 'resource' },
      evidence: cycle,
      tags: ['graph', 'dependency']
    }));
  }
});

export const forbiddenImportRule = defineLintRule({
  id: 'frontier/no-forbidden-import',
  meta: {
    title: 'Sources must not import forbidden packages',
    description: 'Package boundaries stay clean by treating forbidden Frontier imports as lint diagnostics.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['package-boundary', 'imports']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    if (context.config.forbiddenImports.length === 0) return diagnostics;
    for (const resource of context.resources) {
      for (const specifier of resource.imports) {
        const match = findForbiddenImport(specifier, context.config.forbiddenImports);
        if (!match) continue;
        diagnostics.push({
          message: `Resource "${resource.id}" imports forbidden package "${specifier}".`,
          target: { id: resource.id, kind: 'resource', file: resource.files[0] },
          evidence: [match],
          range: resource.files[0] ? { file: resource.files[0] } : undefined,
          tags: ['package-boundary', 'imports']
        });
      }
    }
    for (const source of context.sources) {
      for (const specifier of dedupeStrings((source.imports ?? []).concat(extractImports(source.text)))) {
        const match = findForbiddenImport(specifier, context.config.forbiddenImports);
        if (!match) continue;
        diagnostics.push({
          message: `Source "${source.id ?? source.file ?? 'source'}" imports forbidden package "${specifier}".`,
          target: { id: source.id ?? source.file ?? 'source', kind: 'source', file: source.file },
          evidence: [match],
          range: source.file ? { file: source.file } : undefined,
          tags: ['package-boundary', 'imports']
        });
      }
    }
    return diagnostics;
  }
});

export const packageLayerOrderRule = defineLintRule({
  id: 'frontier/package-layer-order',
  meta: {
    title: 'Package dependencies should follow layer order',
    description: 'Higher layers can depend on lower layers, but lower layers should not import higher ones.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['package-boundary', 'layering']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    const order = new Map<string, number>();
    context.config.packageOrder.forEach((name, index) => order.set(name, index));
    for (const pkg of context.packages) {
      const sourceIndex = pkg.layer ?? order.get(pkg.name) ?? order.get(pkg.id);
      if (sourceIndex === undefined) continue;
      for (const dep of pkg.dependsOn) {
        const target = context.packagesByName.get(dep);
        const targetIndex = target?.layer ?? order.get(dep);
        if (targetIndex === undefined) continue;
        if (targetIndex > sourceIndex) {
          diagnostics.push({
            message: `Package "${pkg.name}" at layer ${sourceIndex} depends on higher layer "${dep}" at ${targetIndex}.`,
            target: { id: pkg.id, kind: 'package' },
            evidence: [dep],
            tags: ['package-boundary', 'layering']
          });
        }
      }
    }
    return diagnostics;
  }
});

export const agentActionProofRule = defineLintRule({
  id: 'frontier/no-agent-action-without-proof',
  meta: {
    title: 'Agent-operable actions need proof evidence',
    description: 'Actions exposed to agents should carry test, trace, policy, or replay evidence.',
    defaultSeverity: 'warning',
    category: 'security',
    recommended: true,
    tags: ['agent', 'proof']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const resource of context.resources) {
      const agentFacing = resource.tags.includes('agent') || Boolean(resource.metadata?.agent);
      if (!agentFacing) continue;
      const hasProof = resource.tests.length > 0 || resource.traces.length > 0 || resource.policies.length > 0 || resource.proves.length > 0 || context.hasCoverage(resource.id, ['test', 'trace', 'policy', 'replay']);
      if (hasProof) continue;
      diagnostics.push({
        message: `Agent-facing resource "${resource.id}" has no proof evidence.`,
        target: { id: resource.id, kind: 'resource' },
        tags: ['agent', 'proof']
      });
    }
    return diagnostics;
  }
});

export const requiredPackageUseRule = defineLintRule({
  id: 'frontier/require-package-use',
  meta: {
    title: 'Required Frontier packages must be used by matching surfaces',
    description: 'Framework and app surfaces that opt into a Frontier capability should depend on or import the matching package.',
    defaultSeverity: 'error',
    category: 'correctness',
    recommended: true,
    tags: ['package-use', 'frontier-framework', 'agent']
  },
  check(context) {
    const diagnostics: FrontierLintDiagnosticInput[] = [];
    for (const requirement of context.config.requiredPackageUses) {
      if (!requirement.required) continue;
      const matchedResources = context.resources.filter((resource) => requirementMatchesResource(requirement, resource));
      const matchedSources = context.sources.filter((source) => requirementMatchesSource(requirement, source));
      if (matchedResources.length === 0 && matchedSources.length === 0) continue;

      if (requirement.perSource && packageUseModeNeedsImport(requirement.mode)) {
        for (const source of matchedSources) {
          if (sourceImportsPackage(source, requirement)) continue;
          diagnostics.push({
            message: packageUseMessage(requirement, `Source "${source.file ?? source.id ?? 'source'}" does not import ${requirement.package}.`),
            target: { id: source.id ?? source.file ?? requirement.id, kind: 'source', file: source.file },
            range: source.file ? { file: source.file } : undefined,
            evidence: [requirement.package],
            suggestions: [{
              title: 'Import the required Frontier package',
              message: 'Wire this source through ' + requirement.package + ' or disable this requirement with a documented config override.',
              safe: false,
              operations: []
            }],
            tags: ['package-use', ...requirement.tags]
          });
        }
        if (matchedSources.length > 0) continue;
      }

      if (packageUseSatisfied(context, requirement)) continue;
      const targetResource = matchedResources[0];
      const targetSource = matchedSources[0];
      diagnostics.push({
        message: packageUseMessage(requirement, `Matching Frontier surfaces do not use ${requirement.package}.`),
        target: targetResource
          ? { id: targetResource.id, kind: targetResource.kind, file: targetResource.files[0] }
          : { id: targetSource?.id ?? targetSource?.file ?? requirement.id, kind: 'source', file: targetSource?.file },
        range: targetSource?.file ? { file: targetSource.file } : targetResource?.files[0] ? { file: targetResource.files[0] } : undefined,
        evidence: [requirement.package],
        suggestions: [{
          title: 'Declare or import the required Frontier package',
          message: 'Add ' + requirement.package + ' to dependencies or import it from the matching source surface.',
          safe: false,
          operations: []
        }],
        tags: ['package-use', ...requirement.tags]
      });
    }
    return diagnostics;
  }
});

export const frontierRecommendedRules: readonly FrontierLintRule[] = [
  duplicateResourceIdRule,
  unknownEdgeTargetRule,
  validJsonPointerRule,
  requireOwnerRule,
  requireFeatureRule,
  orphanRouteActionRule,
  requireTestEvidenceRule,
  requireBenchmarkEvidenceRule,
  dangerousEffectPolicyRule,
  effectfulRollbackRule,
  uncoveredStateWriteRule,
  staleEvidenceRule,
  cyclicDependencyRule,
  forbiddenImportRule,
  packageLayerOrderRule,
  agentActionProofRule,
  requiredPackageUseRule
];

export const frontierRecommendedRuleset = createLintRuleset({
  id: 'frontier.recommended',
  rules: frontierRecommendedRules,
  metadata: { builtIn: true }
});

function normalizeConfig(input: FrontierLintInput, config: FrontierLintConfig): RequiredFrontierLintConfig {
  const rulesets = (config.rulesets ?? input.rulesets ?? [frontierRecommendedRuleset]).slice();
  const severity = {
    ...mergeRulesetSeverity(rulesets),
    ...(input.severity ?? {}),
    ...(config.severity ?? {})
  };
  const disabledRules = dedupeStrings((input.disabledRules ?? []).concat(config.disabledRules ?? []));
  return {
    rulesets,
    rules: dedupeRules((input.rules ?? []).concat(config.rules ?? [])),
    severity,
    disabledRules,
    suppressions: normalizeSuppressions((input.suppressions ?? []).concat(config.suppressions ?? [])),
    requireOwnersForKinds: dedupeStrings(config.requireOwnersForKinds ?? input.requireOwnersForKinds ?? defaultOwnerKinds),
    requireFeaturesForKinds: dedupeStrings(config.requireFeaturesForKinds ?? input.requireFeaturesForKinds ?? defaultFeatureKinds),
    requireTestEvidenceForKinds: dedupeStrings(config.requireTestEvidenceForKinds ?? input.requireTestEvidenceForKinds ?? defaultTestEvidenceKinds),
    requireBenchmarkEvidenceForKinds: dedupeStrings(config.requireBenchmarkEvidenceForKinds ?? input.requireBenchmarkEvidenceForKinds ?? defaultBenchmarkEvidenceKinds),
    dangerousEffectPrefixes: dedupeStrings(config.dangerousEffectPrefixes ?? input.dangerousEffectPrefixes ?? defaultDangerousEffectPrefixes),
    forbiddenImports: dedupeStrings((input.forbiddenImports ?? []).concat(config.forbiddenImports ?? [])),
    packageOrder: dedupeStrings(config.packageOrder ?? input.packageOrder ?? []),
    requiredPackageUses: normalizeRequiredPackageUses((input.requiredPackageUses ?? []).concat(config.requiredPackageUses ?? [])),
    now: toTimestamp(config.now) ?? toTimestamp(input.now) ?? Date.now(),
    maxEvidenceAgeMs: config.maxEvidenceAgeMs ?? input.maxEvidenceAgeMs ?? FRONTIER_LINTER_DEFAULT_MAX_EVIDENCE_AGE_MS,
    budgets: { ...(input.budgets ?? {}), ...(config.budgets ?? {}) },
    metadata: asJsonObject(config.metadata ?? input.metadata)
  };
}

function normalizeRequiredPackageUses(input: readonly FrontierRequiredPackageUseInput[]): FrontierRequiredPackageUse[] {
  const byId = new Map<string, FrontierRequiredPackageUse>();
  for (const item of input) {
    const packageName = item.package?.trim();
    if (!packageName) continue;
    const id = item.id ?? 'required-package:' + packageName;
    byId.set(id, {
      id,
      package: packageName,
      mode: item.mode ?? 'dependency-or-import',
      required: item.required ?? true,
      perSource: item.perSource ?? false,
      reason: item.reason,
      resourceKinds: dedupeStrings(item.resourceKinds ?? []),
      resourceTags: dedupeStrings(item.resourceTags ?? []),
      filePatterns: dedupeStrings(item.filePatterns ?? []),
      importPatterns: dedupeStrings(item.importPatterns ?? []),
      textPatterns: dedupeStrings(item.textPatterns ?? []),
      tags: dedupeStrings(item.tags ?? []),
      metadata: asJsonObject(item.metadata)
    });
  }
  return Array.from(byId.values());
}

function normalizeResources(input: FrontierLintInput): FrontierLintResource[] {
  const resources: FrontierLintResource[] = [];
  for (const resource of input.resources ?? []) resources[resources.length] = createLintResource(resource);
  for (const node of input.nodes ?? []) resources[resources.length] = createLintResource(node);
  for (const entry of input.entries ?? []) {
    resources[resources.length] = createLintResource({
      id: entry.id,
      kind: entry.kind,
      description: entry.description,
      package: entry.package,
      feature: entry.feature,
      owner: entry.owner,
      source: entry.source,
      reads: entry.reads,
      writes: entry.writes,
      actions: entry.calls,
      dependsOn: entry.dependsOn,
      produces: entry.produces,
      consumes: entry.consumes,
      covers: entry.covers,
      tags: entry.tags,
      metadata: entry.metadata
    });
  }
  for (const source of input.sources ?? []) {
    resources[resources.length] = createLintResource({
      id: source.id ?? source.file ?? 'source:' + resources.length,
      kind: 'source',
      package: source.package,
      files: source.file ? [source.file] : [],
      text: source.text,
      imports: source.imports,
      metadata: source.metadata
    });
  }
  return resources;
}

function normalizeEdges(input: FrontierLintInput): FrontierLintEdge[] {
  const edges: FrontierLintEdge[] = [];
  for (const edge of input.edges ?? []) edges[edges.length] = { from: edge.from, to: edge.to, kind: edge.kind ?? 'depends-on', metadata: asJsonObject(edge.metadata) };
  for (const entry of input.entries ?? []) {
    for (const dep of entry.dependsOn ?? []) edges[edges.length] = { from: entry.id, to: dep, kind: 'depends-on' };
    for (const target of entry.covers ?? []) edges[edges.length] = { from: entry.id, to: target, kind: 'covers' };
    for (const target of entry.affects ?? []) edges[edges.length] = { from: entry.id, to: target, kind: 'touches' };
  }
  return edges;
}

function normalizeEvidence(input: FrontierLintInput): FrontierLintEvidence[] {
  const evidence: FrontierLintEvidence[] = [];
  let index = 0;
  for (const item of input.evidence ?? []) evidence[evidence.length] = normalizeEvidenceItem(item, index++);
  for (const record of input.records ?? []) {
    evidence[evidence.length] = normalizeEvidenceItem({
      id: record.id,
      kind: record.kind ?? 'record',
      nodes: [record.entryId],
      paths: (record.reads ?? []).concat(record.writes ?? []),
      status: record.status,
      timestamp: record.startedAt,
      metadata: record.metadata
    }, index++);
  }
  return evidence;
}

function normalizeEvidenceItem(input: FrontierLintEvidenceInput, index: number): FrontierLintEvidence {
  return {
    id: input.id ?? `evidence:${index}`,
    kind: input.kind ?? 'evidence',
    sourcePackage: input.sourcePackage,
    nodes: dedupeStrings(input.nodes ?? []),
    paths: normalizePaths(input.paths ?? []),
    features: dedupeStrings(input.features ?? []),
    routes: dedupeStrings(input.routes ?? []),
    actions: dedupeStrings(input.actions ?? []),
    tests: dedupeStrings(input.tests ?? []),
    traces: dedupeStrings(input.traces ?? []),
    policies: dedupeStrings(input.policies ?? []),
    workflows: dedupeStrings(input.workflows ?? []),
    benchmarks: dedupeStrings(input.benchmarks ?? []),
    status: input.status,
    timestamp: toTimestamp(input.timestamp),
    metadata: asJsonObject(input.metadata)
  };
}

function normalizePackages(input: FrontierLintInput): FrontierLintPackage[] {
  return (input.packages ?? []).map((pkg) => ({
    id: pkg.id ?? pkg.name,
    name: pkg.name,
    layer: pkg.layer,
    package: pkg.package,
    dependsOn: dedupeStrings(pkg.dependsOn ?? []),
    files: dedupeStrings(pkg.files ?? []),
    metadata: asJsonObject(pkg.metadata)
  }));
}

function normalizeSourceInput(input: FrontierLintSourceInput, index: number): FrontierLintSourceInput {
  return {
    id: input.id ?? input.file ?? `source:${index}`,
    file: input.file,
    package: input.package,
    text: input.text,
    imports: dedupeStrings((input.imports ?? []).concat(extractImports(input.text))),
    metadata: input.metadata
  };
}

function normalizeDiagnostic(
  rule: FrontierLintRule,
  severity: Exclude<FrontierLintSeverity, 'off'>,
  input: FrontierLintDiagnosticInput,
  ruleIndex: number,
  findingIndex: number
): FrontierLintDiagnostic {
  const target = typeof input.target === 'string' || input.target === undefined
    ? { id: input.target ?? 'lint', kind: 'resource' }
    : input.target;
  const ruleId = input.ruleId ?? rule.id;
  const path = input.path === undefined ? undefined : normalizeFrontierRegistryPath(input.path);
  return {
    id: input.id ?? `${ruleId}:${ruleIndex}:${findingIndex}:${target.id}:${path ?? ''}`,
    ruleId,
    severity: input.severity === undefined || input.severity === 'off' ? severity : input.severity,
    message: input.message,
    target: { ...target },
    path,
    range: input.range,
    fixes: input.fixes,
    suggestions: input.suggestions,
    evidence: input.evidence ? dedupeStrings(input.evidence) : undefined,
    tags: dedupeStrings((rule.meta.tags ?? []).concat(input.tags ?? [])),
    metadata: asJsonObject(input.metadata)
  };
}

function summarizeLintDiagnostics(
  context: FrontierLintContext,
  diagnostics: readonly FrontierLintDiagnostic[],
  suppressed: readonly FrontierLintDiagnostic[],
  elapsedMs: number,
  ruleCount: number
): FrontierLintSummary {
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let hintCount = 0;
  let fixableCount = 0;
  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === 'error') errorCount++;
    else if (diagnostic.severity === 'warning') warningCount++;
    else if (diagnostic.severity === 'info') infoCount++;
    else if (diagnostic.severity === 'hint') hintCount++;
    if (diagnostic.fixes?.length) fixableCount++;
  }
  return {
    resourceCount: context.resources.length,
    edgeCount: context.edges.length,
    evidenceCount: context.evidence.length,
    packageCount: context.packages.length,
    sourceCount: context.sources.length,
    ruleCount,
    diagnosticCount: diagnostics.length,
    errorCount,
    warningCount,
    infoCount,
    hintCount,
    fixableCount,
    suppressedCount: suppressed.length,
    elapsedMs,
    valid: errorCount === 0
  };
}

function activeRules(config: RequiredFrontierLintConfig): FrontierLintRule[] {
  const disabled = new Set(config.disabledRules);
  const allRules = new Map<string, FrontierLintRule>();
  for (const ruleset of config.rulesets) {
    for (const rule of ruleset.rules) allRules.set(rule.id, rule);
  }
  for (const rule of config.rules) allRules.set(rule.id, rule);
  return Array.from(allRules.values()).filter((rule) => !disabled.has(rule.id) && ruleSeverity(rule, config) !== 'off');
}

function ruleSeverity(rule: FrontierLintRule, config: RequiredFrontierLintConfig): FrontierLintSeverity {
  return config.severity[rule.id] ?? rule.meta.defaultSeverity ?? 'warning';
}

function mergeRulesetSeverity(rulesets: readonly FrontierLintRuleset[]): Record<string, FrontierLintSeverity> {
  const severity: Record<string, FrontierLintSeverity> = {};
  for (const ruleset of rulesets) Object.assign(severity, ruleset.severity ?? {});
  return severity;
}

function dedupeRules(rules: readonly FrontierLintRule[]): FrontierLintRule[] {
  const byId = new Map<string, FrontierLintRule>();
  for (const rule of rules) byId.set(rule.id, rule);
  return Array.from(byId.values());
}

function normalizeSuppressions(input: readonly FrontierLintSuppression[]): FrontierLintSuppression[] {
  return input.map((suppression) => ({
    ...suppression,
    expiresAt: toTimestamp(suppression.expiresAt)
  }));
}

function isSuppressed(diagnostic: FrontierLintDiagnostic, suppressions: readonly FrontierLintSuppression[], now: number): boolean {
  for (const suppression of suppressions) {
    const expiresAt = toTimestamp(suppression.expiresAt);
    if (expiresAt !== undefined && expiresAt < now) continue;
    if (suppression.ruleId && suppression.ruleId !== diagnostic.ruleId) continue;
    if (suppression.targetId && suppression.targetId !== diagnostic.target.id) continue;
    if (suppression.path && suppression.path !== diagnostic.path) continue;
    return true;
  }
  return false;
}

function applyLintFixOperation<T extends JsonValue>(document: T, operation: FrontierLintFixOperation): T {
  const path = normalizeFrontierRegistryPath(operation.path);
  if (path === '') {
    if (operation.op === 'remove') return undefined as unknown as T;
    return cloneJson(operation.value) as T;
  }
  const root = (Array.isArray(document) || isPlainObject(document) ? cloneJson(document) : {}) as JsonValue;
  const parts = path.split('/').slice(1).map(unescapePointerToken);
  let cursor = root as JsonValue;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!isPlainObject(cursor) && !Array.isArray(cursor)) return root as T;
    const part = parts[i];
    const nextPart = parts[i + 1];
    const current = Array.isArray(cursor) ? cursor[numberFromToken(part)] : cursor[part];
    if (isPlainObject(current) || Array.isArray(current)) {
      cursor = current;
      continue;
    }
    const next: JsonValue = /^\d+$/.test(nextPart) ? [] : {};
    if (Array.isArray(cursor)) cursor[numberFromToken(part)] = next;
    else cursor[part] = next;
    cursor = next;
  }
  if (!isPlainObject(cursor) && !Array.isArray(cursor)) return root as T;
  const key = parts[parts.length - 1] ?? '';
  if (operation.op === 'remove') {
    if (Array.isArray(cursor)) cursor.splice(numberFromToken(key), 1);
    else delete cursor[key];
  } else if (operation.op === 'append') {
    const value = cloneJson(operation.value);
    if (Array.isArray(cursor)) cursor[cursor.length] = value;
    else {
      const existing = cursor[key];
      if (Array.isArray(existing)) existing[existing.length] = value;
      else cursor[key] = [value];
    }
  } else {
    const value = cloneJson(operation.value);
    if (Array.isArray(cursor)) cursor[numberFromToken(key)] = value;
    else cursor[key] = value;
  }
  return root as T;
}

function collectEvidenceForResource(
  resource: FrontierLintResource,
  evidenceByNode: ReadonlyMap<string, readonly FrontierLintEvidence[]>,
  evidenceByPath: ReadonlyMap<string, readonly FrontierLintEvidence[]>
): FrontierLintEvidence[] {
  const items = new Map<string, FrontierLintEvidence>();
  for (const item of collectEvidenceForTarget(evidenceByNode, evidenceByPath, resource.id)) items.set(item.id, item);
  for (const path of resource.writes.concat(resource.reads, resource.states)) {
    for (const item of collectEvidenceForTarget(evidenceByNode, evidenceByPath, path)) items.set(item.id, item);
  }
  return Array.from(items.values());
}

function collectEvidenceForTarget(
  evidenceByNode: ReadonlyMap<string, readonly FrontierLintEvidence[]>,
  evidenceByPath: ReadonlyMap<string, readonly FrontierLintEvidence[]>,
  target: string
): FrontierLintEvidence[] {
  const exactNode = evidenceByNode.get(target) ?? [];
  const exactPath = evidenceByPath.get(target) ?? [];
  if (!target.startsWith('/')) return exactNode.concat(exactPath);
  const items = exactNode.concat(exactPath);
  for (const [path, bucket] of evidenceByPath) {
    if (path !== target && pathsOverlap(path, target)) items.push(...bucket);
  }
  return items;
}

function requirementMatchesResource(requirement: FrontierRequiredPackageUse, resource: FrontierLintResource): boolean {
  const hasExplicitMatcher = requirement.resourceKinds.length > 0
    || requirement.resourceTags.length > 0
    || requirement.filePatterns.length > 0
    || requirement.importPatterns.length > 0
    || requirement.textPatterns.length > 0;
  if (!hasExplicitMatcher) return true;
  if (requirement.resourceKinds.length > 0 && requirement.resourceKinds.includes(resource.kind)) return true;
  if (requirement.resourceTags.length > 0 && resource.tags.some((tag) => requirement.resourceTags.includes(tag))) return true;
  if (requirement.filePatterns.length > 0 && resource.files.some((file) => matchesAnyPattern(file, requirement.filePatterns))) return true;
  if (requirement.importPatterns.length > 0 && resource.imports.some((specifier) => matchesAnyPattern(specifier, requirement.importPatterns) || packageSpecifierMatches(specifier, requirement.package))) return true;
  if (requirement.textPatterns.length > 0 && resource.text && matchesAnyTextPattern(resource.text, requirement.textPatterns)) return true;
  return false;
}

function requirementMatchesSource(requirement: FrontierRequiredPackageUse, source: FrontierLintSourceInput): boolean {
  const hasExplicitMatcher = requirement.filePatterns.length > 0
    || requirement.importPatterns.length > 0
    || requirement.textPatterns.length > 0;
  if (!hasExplicitMatcher && requirement.resourceKinds.length === 0 && requirement.resourceTags.length === 0) return true;
  if (source.file && requirement.filePatterns.length > 0 && matchesAnyPattern(source.file, requirement.filePatterns)) return true;
  const imports = dedupeStrings((source.imports ?? []).concat(extractImports(source.text)));
  if (requirement.importPatterns.length > 0 && imports.some((specifier) => matchesAnyPattern(specifier, requirement.importPatterns) || packageSpecifierMatches(specifier, requirement.package))) return true;
  if (source.text && requirement.textPatterns.length > 0 && matchesAnyTextPattern(source.text, requirement.textPatterns)) return true;
  return false;
}

function packageUseSatisfied(context: FrontierLintContext, requirement: FrontierRequiredPackageUse): boolean {
  if (requirement.mode === 'dependency') return contextHasPackage(context, requirement.package);
  if (requirement.mode === 'import') return contextImportsPackage(context, requirement);
  return contextHasPackage(context, requirement.package) || contextImportsPackage(context, requirement);
}

function packageUseModeNeedsImport(mode: FrontierRequiredPackageUseMode): boolean {
  return mode === 'import' || mode === 'dependency-or-import';
}

function contextHasPackage(context: FrontierLintContext, packageName: string): boolean {
  if (context.packagesByName.has(packageName)) return true;
  return context.resources.some((resource) => resource.kind === 'package' && (resource.id === packageName || resource.package === packageName || resource.title === packageName));
}

function contextImportsPackage(context: FrontierLintContext, requirement: FrontierRequiredPackageUse): boolean {
  return context.resources.some((resource) => resource.imports.some((specifier) => packageSpecifierMatchesRequirement(specifier, requirement)))
    || context.sources.some((source) => sourceImportsPackage(source, requirement));
}

function sourceImportsPackage(source: FrontierLintSourceInput, requirement: FrontierRequiredPackageUse): boolean {
  return dedupeStrings((source.imports ?? []).concat(extractImports(source.text)))
    .some((specifier) => packageSpecifierMatchesRequirement(specifier, requirement));
}

function packageSpecifierMatchesRequirement(specifier: string, requirement: FrontierRequiredPackageUse): boolean {
  return packageSpecifierMatches(specifier, requirement.package)
    || requirement.importPatterns.some((pattern) => matchesPattern(specifier, pattern));
}

function packageSpecifierMatches(specifier: string, packageName: string): boolean {
  return specifier === packageName || specifier.startsWith(packageName + '/');
}

function packageUseMessage(requirement: FrontierRequiredPackageUse, fallback: string): string {
  return requirement.reason ? fallback + ' ' + requirement.reason : fallback;
}

function matchesAnyTextPattern(text: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
      const lastSlash = pattern.lastIndexOf('/');
      try {
        return new RegExp(pattern.slice(1, lastSlash), pattern.slice(lastSlash + 1)).test(text);
      } catch {
        return text.includes(pattern);
      }
    }
    return text.includes(pattern);
  });
}

function matchesAnyPattern(value: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => matchesPattern(value, pattern));
}

function matchesPattern(value: string, pattern: string): boolean {
  const normalizedValue = value.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');
  if (normalizedPattern === normalizedValue) return true;
  if (!normalizedPattern.includes('*')) return normalizedValue.includes(normalizedPattern);
  let patternSource = '';
  for (let index = 0; index < normalizedPattern.length; index++) {
    const char = normalizedPattern[index];
    if (char === '*' && normalizedPattern[index + 1] === '*') {
      if (normalizedPattern[index + 2] === '/') {
        patternSource += '(?:.*/)?';
        index += 2;
      } else {
        patternSource += '.*';
        index++;
      }
    } else if (char === '*') {
      patternSource += '[^/]*';
    } else {
      patternSource += char.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp('^' + patternSource + '$').test(normalizedValue);
}

function resourceContainsAlias(resource: FrontierLintResource, id: string): boolean {
  const bare = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id;
  return resource.routes.includes(id) || resource.routes.includes(bare)
    || resource.actions.includes(id) || resource.actions.includes(bare)
    || resource.tools.includes(id) || resource.tools.includes(bare)
    || resource.effects.includes(id) || resource.effects.includes(bare)
    || resource.workers.includes(id) || resource.workers.includes(bare)
    || resource.assets.includes(id) || resource.assets.includes(bare)
    || resource.tests.includes(id) || resource.tests.includes(bare)
    || resource.traces.includes(id) || resource.traces.includes(bare)
    || resource.policies.includes(id) || resource.policies.includes(bare)
    || resource.workflows.includes(id) || resource.workflows.includes(bare)
    || resource.benchmarks.includes(id) || resource.benchmarks.includes(bare);
}

function normalizePaths(paths: readonly FrontierRegistryPath[]): string[] {
  const normalized: string[] = [];
  for (const path of paths) {
    try {
      normalized[normalized.length] = normalizeFrontierRegistryPath(path);
    } catch {
      normalized[normalized.length] = String(path);
    }
  }
  return dedupeStrings(normalized);
}

function normalizeSource(source: string | FrontierRegistrySource | undefined): FrontierRegistrySource | undefined {
  if (source === undefined) return undefined;
  return typeof source === 'string' ? { file: source } : { ...source };
}

function normalizeRollback(input: string | JsonObject | undefined): string | JsonObject | undefined {
  if (input === undefined) return undefined;
  return typeof input === 'string' ? input : cloneJsonObject(input);
}

function inferResourceKind(id: string): FrontierLintResourceKind {
  const marker = id.indexOf(':');
  return marker > 0 ? id.slice(0, marker) : 'resource';
}

function isValidJsonPointer(path: string): boolean {
  if (path === '') return true;
  if (!path.startsWith('/')) return false;
  for (let i = 0; i < path.length; i++) {
    if (path[i] === '~' && path[i + 1] !== '0' && path[i + 1] !== '1') return false;
  }
  return true;
}

function pathsOverlap(a: string, b: string): boolean {
  if (a === b) return true;
  if (a === '' || b === '') return true;
  return a.startsWith(b.endsWith('/') ? b : b + '/') || b.startsWith(a.endsWith('/') ? a : a + '/');
}

function extractImports(text: string | undefined): string[] {
  if (!text) return [];
  const imports: string[] = [];
  const importPattern = /\b(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const requirePattern = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(text)) !== null) imports[imports.length] = match[1];
  while ((match = requirePattern.exec(text)) !== null) imports[imports.length] = match[1];
  return dedupeStrings(imports);
}

function findForbiddenImport(specifier: string, forbidden: readonly string[]): string | undefined {
  for (const pattern of forbidden) {
    if (specifier === pattern || specifier.startsWith(pattern + '/') || specifier.includes(pattern)) return pattern;
  }
  return undefined;
}

function findCycles(adjacency: ReadonlyMap<string, readonly string[]>, limit: number): string[][] {
  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const visit = (node: string) => {
    if (cycles.length >= limit) return;
    if (visiting.has(node)) {
      const start = stack.indexOf(node);
      if (start >= 0) cycles.push(stack.slice(start).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    for (const next of adjacency.get(node) ?? []) visit(next);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  };
  for (const node of adjacency.keys()) visit(node);
  return cycles;
}

function compareDiagnostics(a: FrontierLintDiagnostic, b: FrontierLintDiagnostic): number {
  return severityRank(b.severity) - severityRank(a.severity)
    || a.ruleId.localeCompare(b.ruleId)
    || a.target.id.localeCompare(b.target.id)
    || (a.path ?? '').localeCompare(b.path ?? '')
    || a.id.localeCompare(b.id);
}

function severityRank(severity: FrontierLintSeverity): number {
  if (severity === 'error') return 4;
  if (severity === 'warning') return 3;
  if (severity === 'info') return 2;
  if (severity === 'hint') return 1;
  return 0;
}

function dedupeStrings(values: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const str = String(value);
    if (str.length === 0 || seen.has(str)) continue;
    seen.add(str);
    out[out.length] = str;
  }
  return out;
}

function appendMapArray<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const bucket = map.get(key);
  if (bucket) bucket[bucket.length] = value;
  else map.set(key, [value]);
}

function asJsonObject(value: unknown): JsonObject | undefined {
  if (!isPlainObject(value)) return undefined;
  return cloneJsonObject(value as Record<string, unknown>);
}

function compactJsonObject(value: Record<string, unknown>): JsonObject {
  const out: Record<string, JsonValue> = {};
  for (const [key, item] of Object.entries(value)) {
    const json = toJsonValue(item);
    if (json !== undefined) out[key] = json;
  }
  return out as JsonObject;
}

function cloneJsonObject(value: Record<string, unknown>): JsonObject {
  return compactJsonObject(value);
}

function toJsonValue(value: unknown): JsonValue | undefined {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const out: JsonValue[] = [];
    for (const item of value) {
      const json = toJsonValue(item);
      if (json !== undefined) out[out.length] = json;
    }
    return out;
  }
  if (isPlainObject(value)) return compactJsonObject(value);
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toTimestamp(value: number | string | Date | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now();
  return Date.now();
}

function escapePointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

function unescapePointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

function numberFromToken(token: string): number {
  const value = Number(token);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function escapeAnnotationProperty(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/:/g, '%3A').replace(/,/g, '%2C');
}

function escapeAnnotationMessage(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableStringify((value as Record<string, unknown>)[key])).join(',') + '}';
}

function fnv1a64(value: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < value.length; i++) {
    hash ^= BigInt(value.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, '0');
}

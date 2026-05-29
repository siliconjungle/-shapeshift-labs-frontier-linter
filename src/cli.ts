#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  formatLintGitHubAnnotations,
  formatLintJson,
  formatLintJsonl,
  formatLintSarif,
  lintFrontier,
  type FrontierLintConfig,
  type FrontierLintInput,
  type FrontierLintSeverity
} from './index.js';

interface CliOptions {
  files: string[];
  format: 'json' | 'jsonl' | 'sarif' | 'github' | 'summary';
  failOn: FrontierLintSeverity;
  config?: string;
  maxWarnings?: number;
}

const options = parseArgs(process.argv.slice(2));
const config = options.config ? readConfig(options.config) : {};
const input = readInputs(options.files);
const result = lintFrontier(input, config);

if (options.format === 'sarif') process.stdout.write(formatLintSarif(result));
else if (options.format === 'jsonl') process.stdout.write(formatLintJsonl(result));
else if (options.format === 'github') process.stdout.write(formatLintGitHubAnnotations(result));
else if (options.format === 'summary') process.stdout.write(formatSummary(result));
else process.stdout.write(formatLintJson(result));

const failRank = severityRank(options.failOn);
const failed = result.diagnostics.some((diagnostic) => severityRank(diagnostic.severity) >= failRank)
  || (options.maxWarnings !== undefined && result.summary.warningCount > options.maxWarnings);
process.exitCode = failed ? 1 : 0;

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { files: [], format: 'json', failOn: 'error' };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      process.stdout.write([
        'frontier-lint [files...] [--format json|jsonl|sarif|github|summary]',
        '  --config <file>       JSON config merged into lint input.',
        '  --fail-on <severity>  off, hint, info, warning, or error. Default: error.',
        '  --max-warnings <n>    Fail when warnings exceed n.',
        ''
      ].join('\n'));
      process.exit(0);
    }
    if (arg === '--format') {
      options.format = parseFormat(args[++i]);
      continue;
    }
    if (arg.startsWith('--format=')) {
      options.format = parseFormat(arg.slice('--format='.length));
      continue;
    }
    if (arg === '--fail-on') {
      options.failOn = parseSeverity(args[++i]);
      continue;
    }
    if (arg.startsWith('--fail-on=')) {
      options.failOn = parseSeverity(arg.slice('--fail-on='.length));
      continue;
    }
    if (arg === '--config') {
      options.config = args[++i];
      continue;
    }
    if (arg.startsWith('--config=')) {
      options.config = arg.slice('--config='.length);
      continue;
    }
    if (arg === '--max-warnings') {
      options.maxWarnings = Number(args[++i]);
      continue;
    }
    if (arg.startsWith('--max-warnings=')) {
      options.maxWarnings = Number(arg.slice('--max-warnings='.length));
      continue;
    }
    options.files.push(arg);
  }
  return options;
}

function parseFormat(value: string | undefined): CliOptions['format'] {
  if (value === 'json' || value === 'jsonl' || value === 'sarif' || value === 'github' || value === 'summary') return value;
  throw new Error('Unknown format: ' + value);
}

function parseSeverity(value: string | undefined): FrontierLintSeverity {
  if (value === 'off' || value === 'hint' || value === 'info' || value === 'warning' || value === 'error') return value;
  throw new Error('Unknown severity: ' + value);
}

function readConfig(file: string): FrontierLintConfig {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) as FrontierLintConfig;
}

function readInputs(files: readonly string[]): FrontierLintInput {
  if (files.length === 0) {
    const text = fs.readFileSync(0, 'utf8');
    return parseInputText(text, '<stdin>');
  }
  const merged: FrontierLintInput = { resources: [], edges: [], evidence: [], sources: [], packages: [] };
  for (const file of files) mergeInput(merged, parseInputText(fs.readFileSync(path.resolve(file), 'utf8'), file));
  return merged;
}

function parseInputText(text: string, file: string): FrontierLintInput {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as FrontierLintInput | NonNullable<FrontierLintInput['resources']>;
    if (Array.isArray(parsed)) return { resources: parsed };
    return parsed as FrontierLintInput;
  }
  const input: FrontierLintInput = { resources: [] };
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const parsed = JSON.parse(line) as FrontierLintInput | NonNullable<FrontierLintInput['resources']>[number];
    if ('resources' in parsed || 'nodes' in parsed || 'edges' in parsed || 'evidence' in parsed) mergeInput(input, parsed as FrontierLintInput);
    else input.resources = [...(input.resources ?? []), parsed as NonNullable<FrontierLintInput['resources']>[number]];
  }
  if ((input.resources?.length ?? 0) === 0 && trimmed) {
    input.sources = [{ id: file, file, text }];
  }
  return input;
}

function mergeInput(target: FrontierLintInput, source: FrontierLintInput): void {
  target.id ??= source.id;
  target.generatedAt ??= source.generatedAt;
  target.resources = [...(target.resources ?? []), ...(source.resources ?? []), ...(source.nodes ?? [])];
  target.edges = [...(target.edges ?? []), ...(source.edges ?? [])];
  target.evidence = [...(target.evidence ?? []), ...(source.evidence ?? [])];
  target.sources = [...(target.sources ?? []), ...(source.sources ?? [])];
  target.packages = [...(target.packages ?? []), ...(source.packages ?? [])];
  target.entries = [...(target.entries ?? []), ...(source.entries ?? [])];
  target.records = [...(target.records ?? []), ...(source.records ?? [])];
}

function formatSummary(result: ReturnType<typeof lintFrontier>): string {
  return [
    `frontier-lint ${result.summary.valid ? 'valid' : 'invalid'}`,
    `resources=${result.summary.resourceCount}`,
    `edges=${result.summary.edgeCount}`,
    `diagnostics=${result.summary.diagnosticCount}`,
    `errors=${result.summary.errorCount}`,
    `warnings=${result.summary.warningCount}`,
    `elapsedMs=${result.summary.elapsedMs.toFixed(3)}`,
    ''
  ].join('\n');
}

function severityRank(severity: FrontierLintSeverity): number {
  if (severity === 'error') return 4;
  if (severity === 'warning') return 3;
  if (severity === 'info') return 2;
  if (severity === 'hint') return 1;
  return 0;
}

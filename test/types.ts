import type {
  FrontierLintDiagnostic,
  FrontierLintInput,
  FrontierLintResourceInput,
  FrontierLintRule,
  FrontierLintRuleset
} from '../dist/index.js';
import { createLintRuleset, defineLintRule, lintFrontier } from '../dist/index.js';

const resource: FrontierLintResourceInput = {
  id: 'action:todos.complete',
  kind: 'action',
  feature: 'todos',
  owner: '@team/todos',
  writes: ['/entities/todos/t1/done'],
  tests: ['spec.todos.complete']
};

const rule: FrontierLintRule = defineLintRule({
  id: 'frontier/custom-types',
  meta: { title: 'Custom rule', defaultSeverity: 'warning' },
  check() {
    return [{ message: 'typed diagnostic', target: resource.id }];
  }
});

const ruleset: FrontierLintRuleset = createLintRuleset({ id: 'types', rules: [rule] });
const input: FrontierLintInput = { resources: [resource], rulesets: [ruleset] };
const diagnostics: readonly FrontierLintDiagnostic[] = lintFrontier(input).diagnostics;

void diagnostics;

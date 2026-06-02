/**
 * Tests for scripts/hooks/pre-compact-preserve.js
 *
 * Run with: node tests/hooks/pre-compact-preserve.test.js
 */

'use strict';

const assert = require('assert');

const {
  run,
  extractEssentialState,
  formatCompactState,
} = require('../../scripts/hooks/pre-compact-preserve');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

console.log('\nPre Compact Preserve Hook Tests');
console.log('================================\n');

// Helper: build transcript content as JSONL string
function makeTranscript(entries) {
  return entries.map(e => JSON.stringify(e)).join('\n');
}

console.log('--- extractEssentialState() ---\n');

if (test('extracts last user message as current objective', () => {
  const content = makeTranscript([
    { type: 'user', content: 'First message' },
    { type: 'assistant', content: 'Response' },
    { type: 'user', content: 'Final goal message' },
  ]);
  const state = extractEssentialState(content);
  assert.ok(state.lastGoal, 'should have lastGoal');
  assert.strictEqual(state.lastGoal.content, 'Final goal message');
})) passed++; else failed++;

if (test('returns null lastGoal when no user messages', () => {
  const content = makeTranscript([
    { type: 'assistant', content: 'No user messages here' },
  ]);
  const state = extractEssentialState(content);
  assert.strictEqual(state.lastGoal, null);
})) passed++; else failed++;

if (test('extracts modified files from Write tool calls', () => {
  const content = makeTranscript([
    { type: 'tool_use', tool_name: 'Write', tool_input: { file_path: '/src/foo.ts' } },
    { type: 'tool_use', tool_name: 'Write', tool_input: { file_path: '/src/bar.ts' } },
  ]);
  const state = extractEssentialState(content);
  assert.ok(state.modifiedFiles.includes('/src/foo.ts'));
  assert.ok(state.modifiedFiles.includes('/src/bar.ts'));
})) passed++; else failed++;

if (test('extracts modified files from Edit tool calls', () => {
  const content = makeTranscript([
    { type: 'tool_use', tool_name: 'Edit', tool_input: { file_path: '/src/utils.ts' } },
  ]);
  const state = extractEssentialState(content);
  assert.ok(state.modifiedFiles.includes('/src/utils.ts'));
})) passed++; else failed++;

if (test('extracts modified files from MultiEdit edits[] array', () => {
  const content = makeTranscript([
    {
      type: 'tool_use',
      tool_name: 'MultiEdit',
      tool_input: {
        edits: [
          { file_path: '/src/a.ts' },
          { file_path: '/src/b.ts' },
        ],
      },
    },
  ]);
  const state = extractEssentialState(content);
  assert.ok(state.modifiedFiles.includes('/src/a.ts'));
  assert.ok(state.modifiedFiles.includes('/src/b.ts'));
})) passed++; else failed++;

if (test('deduplicates modified files', () => {
  const content = makeTranscript([
    { type: 'tool_use', tool_name: 'Write', tool_input: { file_path: '/src/foo.ts' } },
    { type: 'tool_use', tool_name: 'Edit', tool_input: { file_path: '/src/foo.ts' } },
  ]);
  const state = extractEssentialState(content);
  assert.strictEqual(state.modifiedFiles.filter(f => f === '/src/foo.ts').length, 1);
})) passed++; else failed++;

if (test('returns empty modifiedFiles when no tool calls', () => {
  const content = makeTranscript([
    { type: 'user', content: 'hello' },
  ]);
  const state = extractEssentialState(content);
  assert.deepStrictEqual(state.modifiedFiles, []);
})) passed++; else failed++;

if (test('extracts last error from tool outputs', () => {
  const content = makeTranscript([
    { type: 'tool_result', tool_output: { output: 'Error: something failed' } },
    { type: 'tool_result', tool_output: { output: 'Success' } },
    { type: 'tool_result', tool_output: { output: 'Exception: bad thing' } },
  ]);
  const state = extractEssentialState(content);
  assert.ok(state.lastError, 'should have lastError');
  assert.match(state.lastError.tool_output.output, /Exception/);
})) passed++; else failed++;

if (test('returns null lastError when no errors in outputs', () => {
  const content = makeTranscript([
    { type: 'tool_result', tool_output: { output: 'All good' } },
  ]);
  const state = extractEssentialState(content);
  assert.strictEqual(state.lastError, null);
})) passed++; else failed++;

console.log('\n--- formatCompactState() ---\n');

if (test('produces markdown with all sections', () => {
  const state = {
    lastGoal: { content: 'Implement feature X' },
    modifiedFiles: ['/src/foo.ts', '/src/bar.ts'],
    lastError: null,
  };
  const md = formatCompactState(state);
  assert.match(md, /Compact State Snapshot/);
  assert.match(md, /Current Objective/);
  assert.match(md, /Implement feature X/);
  assert.match(md, /Modified Files/);
  assert.match(md, /foo\.ts/);
  assert.match(md, /bar\.ts/);
  assert.match(md, /Last Error/);
  assert.match(md, /No recent errors/);
})) passed++; else failed++;

if (test('includes error text when lastError is present', () => {
  const state = {
    lastGoal: null,
    modifiedFiles: [],
    lastError: { tool_output: { output: 'Error: build failed at line 42' } },
  };
  const md = formatCompactState(state);
  assert.match(md, /build failed/);
})) passed++; else failed++;

if (test('shows _Not captured_ when no lastGoal', () => {
  const state = { lastGoal: null, modifiedFiles: [], lastError: null };
  const md = formatCompactState(state);
  assert.match(md, /Not captured/);
})) passed++; else failed++;

if (test('shows _None tracked_ when no modifiedFiles', () => {
  const state = { lastGoal: null, modifiedFiles: [], lastError: null };
  const md = formatCompactState(state);
  assert.match(md, /None tracked/);
})) passed++; else failed++;

console.log('\n--- run() integration ---\n');

if (test('run() returns exitCode 0 always', () => {
  const result = run('{}');
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

if (test('run() does not throw when no transcript found', () => {
  // No projects dir → findActiveTranscript returns null → run exits cleanly
  const result = run('{}');
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);

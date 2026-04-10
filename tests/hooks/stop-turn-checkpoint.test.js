/**
 * Tests for scripts/hooks/stop-turn-checkpoint.js
 *
 * Run with: node tests/hooks/stop-turn-checkpoint.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const hook = require('../../scripts/hooks/stop-turn-checkpoint');

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

console.log('\nStop Turn Checkpoint Hook Tests');
console.log('================================\n');

// Helper: build a JSONL transcript with N user turns
function makeTranscript(userTurns, extraEntries = []) {
  const lines = [];
  for (let i = 0; i < userTurns; i++) {
    lines.push(JSON.stringify({ type: 'user', content: `message ${i + 1}` }));
    lines.push(JSON.stringify({ type: 'assistant', content: `response ${i + 1}` }));
  }
  for (const e of extraEntries) {
    lines.push(JSON.stringify(e));
  }
  return lines.join('\n');
}

function writeTempTranscript(content) {
  const tmpFile = path.join(os.tmpdir(), `ecc-test-checkpoint-${Date.now()}.jsonl`);
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

const MILESTONE = hook.MILESTONE_EVERY; // default 10

if (test('does not fire at non-milestone turns (e.g. 5)', () => {
  const content = makeTranscript(5);
  const tmpFile = writeTempTranscript(content);
  try {
    const result = hook.run(JSON.stringify({ transcript_path: tmpFile }));
    assert.strictEqual(result.exitCode, 0);
    assert.ok(!result.stderr, `should not fire at 5 turns (milestone=${MILESTONE})`);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('fires at exactly the milestone turn count', () => {
  const content = makeTranscript(MILESTONE);
  const tmpFile = writeTempTranscript(content);
  try {
    const result = hook.run(JSON.stringify({ transcript_path: tmpFile }));
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.stderr, `should fire at ${MILESTONE} turns`);
    assert.match(result.stderr, /ECC Turn Checkpoint/);
    assert.match(result.stderr, new RegExp(String(MILESTONE)));
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('fires at second milestone (2x)', () => {
  const content = makeTranscript(MILESTONE * 2);
  const tmpFile = writeTempTranscript(content);
  try {
    const result = hook.run(JSON.stringify({ transcript_path: tmpFile }));
    assert.ok(result.stderr, `should fire at ${MILESTONE * 2} turns`);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('does not fire between milestones', () => {
  const content = makeTranscript(MILESTONE + 3);
  const tmpFile = writeTempTranscript(content);
  try {
    const result = hook.run(JSON.stringify({ transcript_path: tmpFile }));
    assert.ok(!result.stderr, `should not fire at ${MILESTONE + 3} turns`);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('writes checkpoint file to sessions dir at milestone', () => {
  const content = makeTranscript(MILESTONE);
  const tmpFile = writeTempTranscript(content);
  try {
    const { getSessionsDir } = require('../../scripts/lib/utils');
    const expectedPath = path.join(getSessionsDir(), hook.CHECKPOINT_FILE);
    // Remove existing checkpoint to ensure a fresh write
    try { fs.unlinkSync(expectedPath); } catch { /* ignore */ }

    hook.run(JSON.stringify({ transcript_path: tmpFile }));
    assert.ok(fs.existsSync(expectedPath), 'checkpoint file should exist');

    const content2 = fs.readFileSync(expectedPath, 'utf8');
    assert.match(content2, /Turn Checkpoint/);
    assert.match(content2, /Session Goals/);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('checkpoint contains last 5 user messages', () => {
  const content = makeTranscript(MILESTONE);
  const tmpFile = writeTempTranscript(content);
  try {
    const { getSessionsDir } = require('../../scripts/lib/utils');
    const expectedPath = path.join(getSessionsDir(), hook.CHECKPOINT_FILE);
    try { fs.unlinkSync(expectedPath); } catch { /* ignore */ }

    hook.run(JSON.stringify({ transcript_path: tmpFile }));
    const checkpointContent = fs.readFileSync(expectedPath, 'utf8');
    // Should contain some of the last user messages
    assert.match(checkpointContent, /message/i);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('checkpoint lists modified files from Write/Edit entries', () => {
  const editEntries = [
    { type: 'tool_use', tool_name: 'Write', tool_input: { file_path: '/src/foo.ts' } },
    { type: 'tool_use', tool_name: 'Edit', tool_input: { file_path: '/src/bar.ts' } },
  ];
  const content = makeTranscript(MILESTONE, editEntries);
  const tmpFile = writeTempTranscript(content);
  try {
    const { getSessionsDir } = require('../../scripts/lib/utils');
    const expectedPath = path.join(getSessionsDir(), hook.CHECKPOINT_FILE);
    try { fs.unlinkSync(expectedPath); } catch { /* ignore */ }

    hook.run(JSON.stringify({ transcript_path: tmpFile }));
    const checkpointContent = fs.readFileSync(expectedPath, 'utf8');
    assert.match(checkpointContent, /foo\.ts/);
    assert.match(checkpointContent, /bar\.ts/);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

if (test('handles missing transcript gracefully', () => {
  const result = hook.run(JSON.stringify({ transcript_path: '/nonexistent/file.jsonl' }));
  assert.strictEqual(result.exitCode, 0);
  assert.ok(!result.stderr);
})) passed++; else failed++;

if (test('handles missing transcript_path gracefully', () => {
  const result = hook.run(JSON.stringify({}));
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

if (test('handles malformed JSON gracefully', () => {
  const result = hook.run('{bad json');
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

if (test('stderr message mentions /compact suggestion', () => {
  const content = makeTranscript(MILESTONE);
  const tmpFile = writeTempTranscript(content);
  try {
    const result = hook.run(JSON.stringify({ transcript_path: tmpFile }));
    assert.ok(result.stderr);
    assert.match(result.stderr, /compact/i);
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);

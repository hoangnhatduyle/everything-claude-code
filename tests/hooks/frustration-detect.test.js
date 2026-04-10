/**
 * Tests for scripts/hooks/stop-frustration-detect.js and
 *          scripts/hooks/pre-frustration-warn.js
 *
 * Run with: node tests/hooks/frustration-detect.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const detectHook = require('../../scripts/hooks/stop-frustration-detect');
const warnHook = require('../../scripts/hooks/pre-frustration-warn');

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

console.log('\nFrustration Detection Hook Tests');
console.log('=================================\n');

// Helper: create a temp transcript file with given user messages
function makeTempTranscript(userMessages) {
  const tmpFile = path.join(os.tmpdir(), `ecc-test-transcript-${Date.now()}.jsonl`);
  const lines = userMessages.map(msg => JSON.stringify({ type: 'user', content: msg }));
  fs.writeFileSync(tmpFile, lines.join('\n'), 'utf8');
  return tmpFile;
}

// Helper: clean up signal file if it exists
function cleanSignal(signalPath) {
  try { fs.unlinkSync(signalPath); } catch { /* ignore */ }
}

// Set a stable test session ID
const origSessionId = process.env.CLAUDE_SESSION_ID;
process.env.CLAUDE_SESSION_ID = 'test-frustration-' + Date.now();
const signalPath = detectHook.getSignalPath();
cleanSignal(signalPath);

console.log('--- stop-frustration-detect.js ---\n');

if (test('does NOT write signal for neutral messages', () => {
  const transcript = makeTempTranscript([
    'Can you help me with this function?',
    'Thanks, that looks good.',
    'What about adding error handling?',
  ]);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(!fs.existsSync(signalPath), 'signal should not be written for neutral messages');
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "wtf" detected', () => {
  const transcript = makeTempTranscript(['wtf why is this broken']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath), 'signal should be written');
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "still broken" detected', () => {
  const transcript = makeTempTranscript(['this is still broken after your fix']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "not what I asked" detected', () => {
  const transcript = makeTempTranscript(['that is not what I asked for']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "you are not understanding" detected', () => {
  const transcript = makeTempTranscript(['you are not understanding what I want']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "keeps doing" detected', () => {
  const transcript = makeTempTranscript(['it keeps doing the same thing']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "again same error" detected', () => {
  const transcript = makeTempTranscript(['again the same error as before']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('writes signal when "I already said" detected', () => {
  const transcript = makeTempTranscript(['I already said I want it in TypeScript']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('only scans last 5 user messages', () => {
  const messages = [
    'wtf this is broken',   // old message — beyond scan window
    'message 2',
    'message 3',
    'message 4',
    'message 5',
    'message 6',            // last 5 start here
  ];
  // The frustration is in position 0 (oldest), should NOT trigger
  const transcript = makeTempTranscript(messages);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(!fs.existsSync(signalPath), 'signal should not trigger for message outside window');
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

if (test('handles missing transcript gracefully', () => {
  const result = detectHook.run(JSON.stringify({ transcript_path: '/nonexistent/path.jsonl' }));
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

if (test('handles missing transcript_path gracefully', () => {
  const result = detectHook.run(JSON.stringify({}));
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

if (test('handles malformed JSON gracefully', () => {
  const result = detectHook.run('{bad json');
  assert.strictEqual(result.exitCode, 0);
})) passed++; else failed++;

if (test('signal file contains detectedAt timestamp', () => {
  const transcript = makeTempTranscript(['wtf is going on']);
  try {
    cleanSignal(signalPath);
    detectHook.run(JSON.stringify({ transcript_path: transcript }));
    assert.ok(fs.existsSync(signalPath));
    const signal = JSON.parse(fs.readFileSync(signalPath, 'utf8'));
    assert.ok(typeof signal.detectedAt === 'number');
    assert.ok(signal.detectedAt > 0);
    cleanSignal(signalPath);
  } finally {
    fs.unlinkSync(transcript);
  }
})) passed++; else failed++;

console.log('\n--- pre-frustration-warn.js ---\n');

if (test('is silent when no signal file exists', () => {
  cleanSignal(signalPath);
  const input = JSON.stringify({ tool_name: 'Read' });
  const result = warnHook.run(input);
  assert.strictEqual(result.exitCode, 0);
  assert.ok(!result.stderr, 'should not emit warning when no signal');
})) passed++; else failed++;

if (test('emits advisory and deletes signal when signal is fresh', () => {
  cleanSignal(signalPath);
  // Write a fresh signal
  fs.writeFileSync(signalPath, JSON.stringify({ detectedAt: Date.now(), sessionId: 'test' }), 'utf8');
  const input = JSON.stringify({ tool_name: 'Read' });
  const result = warnHook.run(input);
  assert.strictEqual(result.exitCode, 0);
  assert.ok(result.stderr, 'should emit advisory');
  assert.match(result.stderr, /ECC Frustration Detected/);
  assert.ok(!fs.existsSync(signalPath), 'signal should be deleted after warning');
})) passed++; else failed++;

if (test('is silent when signal is stale (> TTL)', () => {
  cleanSignal(signalPath);
  const staleTime = Date.now() - (warnHook.SIGNAL_TTL_MS + 1000);
  fs.writeFileSync(signalPath, JSON.stringify({ detectedAt: staleTime, sessionId: 'test' }), 'utf8');
  const input = JSON.stringify({ tool_name: 'Read' });
  const result = warnHook.run(input);
  assert.strictEqual(result.exitCode, 0);
  assert.ok(!result.stderr, 'stale signal should not emit warning');
  assert.ok(!fs.existsSync(signalPath), 'stale signal should be deleted');
})) passed++; else failed++;

if (test('passes rawInput as stdout', () => {
  cleanSignal(signalPath);
  const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } });
  const result = warnHook.run(input);
  assert.strictEqual(result.stdout, input);
})) passed++; else failed++;

if (test('signal is one-time only (deleted after first warn)', () => {
  cleanSignal(signalPath);
  fs.writeFileSync(signalPath, JSON.stringify({ detectedAt: Date.now() }), 'utf8');
  // First call — should warn and delete
  const first = warnHook.run('{}');
  assert.ok(first.stderr);
  // Second call — no signal, should be silent
  const second = warnHook.run('{}');
  assert.ok(!second.stderr);
})) passed++; else failed++;

// Restore session ID
if (origSessionId === undefined) delete process.env.CLAUDE_SESSION_ID;
else process.env.CLAUDE_SESSION_ID = origSessionId;

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);

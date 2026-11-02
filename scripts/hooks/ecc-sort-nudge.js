#!/usr/bin/env node
/**
 * SessionStart nudge (not a hard gate): reminds the user to scope ECC's
 * 300+ agents/skills/commands to a specific repo instead of leaving every
 * project on the full unscoped bundle.
 *
 * Mirrors harness_engineering's own SessionStart nag style (preflight.js /
 * check-harness-init.js): plain stdout text, exit 0 always, never blocks.
 * Called directly, not through run-with-flags.js — SessionStart hooks fire
 * once per session, so per-tool-call flag-gating overhead doesn't apply.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIRECT_MANIFESTS = [
  'package.json', 'pyproject.toml', 'requirements.txt', 'go.mod',
  'Cargo.toml', 'pom.xml', 'build.gradle', 'build.gradle.kts',
  'Gemfile', 'composer.json',
];

function hasAnyStackManifest(dir) {
  if (DIRECT_MANIFESTS.some((f) => fs.existsSync(path.join(dir, f)))) return true;
  try {
    return fs.readdirSync(dir).some((f) => f.endsWith('.csproj') || f.endsWith('.sln'));
  } catch {
    return false;
  }
}

function isEccSourceRepoRoot(dir) {
  // The ECC repo itself ships all of these as top-level dirs + .claude-plugin/plugin.json;
  // a consumer project installing ECC does not have this combination.
  return ['.claude-plugin/plugin.json', 'agents', 'skills', 'commands', 'rules']
    .every((f) => fs.existsSync(path.join(dir, f)));
}

function commitCount(dir) {
  try {
    return parseInt(
      execSync('git rev-list --count HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim(),
      10,
    ) || 0;
  } catch {
    return 0; // not a git repo yet, or no commits
  }
}

function main() {
  const cwd = process.cwd();

  if (isEccSourceRepoRoot(cwd)) return;
  if (!hasAnyStackManifest(cwd)) return; // nothing to sort yet

  const planPath = path.join(cwd, '.claude', 'ecc-install-plan.md');
  const skipPath = path.join(cwd, '.claude', '.ecc-sort-skip');
  if (fs.existsSync(planPath) || fs.existsSync(skipPath)) return;

  const suggestion = commitCount(cwd) < 5
    ? '/project-init (brand-new repo — fast stack-detection onboarding)'
    : '/agent-sort (evidence-backed — greps your real code/tests/migrations)';

  console.log('[ecc-sort-nudge] No ECC install plan found for this project (.claude/ecc-install-plan.md missing).');
  console.log('[ecc-sort-nudge]   300+ agents/skills/commands are installed globally and load into every session unscoped.');
  console.log(`[ecc-sort-nudge]   Run ${suggestion} to scope them to what this repo actually uses.`);
  console.log('[ecc-sort-nudge]   Already decided not to bother here? Create an empty .claude/.ecc-sort-skip to silence this.');
}

try {
  main();
} catch {
  // Never block session start over this.
}

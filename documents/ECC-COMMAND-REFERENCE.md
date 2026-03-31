# Everything Claude Code (ECC) — Command Reference

## How ECC Commands Work with Claude Code

Claude Code has 3 built-in modes: **Ask**, **Plan**, and **Edit**. ECC commands work **on top of** these modes — they're slash commands you type in the chat that invoke specialized agents with structured workflows.

| Claude Code Mode | Best paired with | Why |
|-----------------|-----------------|-----|
| **Plan** | `/plan` | Plan mode thinks before acting + `/plan` gives it the planner agent's structured framework |
| **Edit** | `/tdd`, `/build-fix`, `/refactor-clean` | Edit mode writes code + these commands control *how* it writes |
| **Ask** | `/docs`, `/code-review`, `/aside` | Ask mode answers questions + these give it specialized knowledge |

**Usage:** Just type the command as part of your message. Examples:
```
/plan Add OAuth2 login with Google and GitHub
/tdd Create a rate limiter middleware
/code-review
/build-fix
```

---

## Everyday Commands (Use on Every Project)

### `/plan` — Plan Before Coding
Invokes the **planner** agent. Produces structured phases, dependencies, risk analysis, testing strategy, and success criteria. **Waits for your approval before any code is written.**

```
/plan Add a REST API for user management with auth
```

### `/tdd` — Test-Driven Development
Invokes the **tdd-guide** agent. Writes failing tests first (RED), implements minimal code (GREEN), then refactors. Enforces 80%+ coverage.

```
/tdd Write a utility that parses CSV files with error handling
```

### `/code-review` — Security & Quality Review
Invokes the **code-reviewer** agent. Scans staged/unstaged changes for security issues, code quality, and bugs. Severity: CRITICAL → HIGH → MEDIUM → LOW.

```
/code-review
```

### `/build-fix` — Fix Build Errors
Invokes the **build-error-resolver** agent. Auto-detects your build system (npm, cargo, go, gradle, maven, etc.) and incrementally fixes errors with minimal changes.

```
/build-fix
```

### `/e2e` — End-to-End Testing
Invokes the **e2e-runner** agent. Generates Playwright tests, runs across browsers, captures screenshots/videos/traces.

```
/e2e Test the complete signup-to-dashboard flow
```

### `/verify` — Pre-Merge Verification
Runs comprehensive checks: build, type checking, linting, and test validation.

```
/verify
```

### `/learn` — Extract Patterns
Analyzes your current session and extracts reusable patterns, saving them as skills for future sessions.

```
/learn
```

---

## Planning & Optimization

| Command | What it does |
|---------|-------------|
| `/plan` | Structured implementation plan with phases, risks, and testing strategy |
| `/prompt-optimize` | Analyzes a draft prompt and outputs an optimized version leveraging ECC components |
| `/model-route` | Recommends best model tier (Haiku/Sonnet/Opus) for your task complexity |
| `/context-budget` | Analyzes context window usage and finds token optimization opportunities |

---

## Code Review (By Language)

| Command | Language | Agent |
|---------|----------|-------|
| `/code-review` | Any | code-reviewer |
| `/python-review` | Python | python-reviewer |
| `/cpp-review` | C++ | cpp-reviewer |
| `/go-review` | Go | go-reviewer |
| `/kotlin-review` | Kotlin | kotlin-reviewer |
| `/rust-review` | Rust | rust-reviewer |

---

## TDD & Testing (By Language)

| Command | Language | Test Framework |
|---------|----------|---------------|
| `/tdd` | Any (JS/TS default) | Jest/Vitest |
| `/cpp-test` | C++ | GoogleTest + gcov/lcov |
| `/go-test` | Go | Table-driven tests + `go test -cover` |
| `/kotlin-test` | Kotlin | Kotest + Kover |
| `/rust-test` | Rust | proptest/rstest + cargo-llvm-cov |
| `/e2e` | Browser/UI | Playwright |
| `/test-coverage` | Any | Analyze gaps and generate missing tests |

---

## Build Fix (By Language)

| Command | Language | Agent |
|---------|----------|-------|
| `/build-fix` | Any (auto-detect) | build-error-resolver |
| `/cpp-build` | C++ / CMake | cpp-build-resolver |
| `/go-build` | Go | go-build-resolver |
| `/kotlin-build` | Kotlin / Gradle | kotlin-build-resolver |
| `/rust-build` | Rust / Cargo | rust-build-resolver |
| `/gradle-build` | Android / KMP | kotlin-build-resolver |

---

## Session Management

| Command | What it does |
|---------|-------------|
| `/save-session` | Save current session context to `~/.claude/session-data/` for later |
| `/resume-session` | Load most recent saved session and continue where you left off |
| `/sessions` | Browse session history, create aliases, view metadata |
| `/checkpoint` | Create a named checkpoint with git info for later reference |
| `/aside` | Ask a quick side question without interrupting your current task |

---

## Learning & Instincts

| Command | What it does |
|---------|-------------|
| `/learn` | Extract reusable patterns from current session and save as skills |
| `/learn-eval` | Same as `/learn` but self-evaluates quality before saving |
| `/skill-create` | Analyze git history to generate SKILL.md files from repo patterns |
| `/skill-health` | Show skill portfolio dashboard with success rates and analytics |
| `/instinct-status` | Display all learned instincts grouped by domain with confidence scores |
| `/instinct-export` | Export instincts to shareable file for team or migration |
| `/instinct-import` | Import instincts from file or URL |
| `/evolve` | Analyze instincts and suggest evolved skill structures |
| `/promote` | Promote project-scoped instincts to global scope |
| `/prune` | Delete expired pending instincts (>30 days, never promoted) |
| `/projects` | List known projects with instinct/observation counts |

---

## Multi-Agent Orchestration

| Command | What it does |
|---------|-------------|
| `/orchestrate` | Sequential multi-agent workflows (plan → tdd → review → security) |
| `/multi-workflow` | Full 6-phase multi-model development workflow |
| `/multi-plan` | Multi-model planning phase |
| `/multi-execute` | Multi-model execution phase |
| `/multi-backend` | Backend-focused multi-model workflow |
| `/multi-frontend` | Frontend-focused multi-model workflow |
| `/devfleet` | Orchestrate parallel agents in isolated git worktrees |
| `/loop-start` | Start autonomous agent loop with safety controls |
| `/loop-status` | Inspect loop state, progress, and failure signals |

---

## Documentation & Maintenance

| Command | What it does |
|---------|-------------|
| `/docs` | Look up current library/framework docs via Context7 |
| `/update-docs` | Sync documentation with codebase changes |
| `/update-codemaps` | Generate architecture codemaps from codebase |
| `/refactor-clean` | Safely identify and remove dead code with test verification |
| `/quality-gate` | Run format + lint + type checks on demand |
| `/rules-distill` | Extract cross-cutting principles from skills into rules |
| `/harness-audit` | Run deterministic repository audit and return scorecard |

---

## Setup & Utilities

| Command | What it does |
|---------|-------------|
| `/setup-pm` | Configure preferred package manager (npm/pnpm/yarn/bun) |
| `/pm2` | Auto-analyze project and generate PM2 service commands |
| `/claw` | Start NanoClaw — persistent REPL with model routing and branching |
| `/eval` | Manage eval-driven development workflows |

---

## Recommended Workflows

### Feature Development
```
/plan Add feature X          ← plan it
  [approve]
/tdd                         ← implement with tests
/code-review                 ← review before commit
  git commit
```

### Bug Fix
```
/tdd Fix the race condition in payment processing
/build-fix                   ← if build breaks
/verify                      ← confirm everything passes
  git commit
```

### End of Session
```
/save-session                ← bookmark your progress
/learn                       ← extract patterns for next time
```

### Start of Session
```
/resume-session              ← pick up where you left off
```

### Pre-Deployment
```
/code-review                 ← security + quality scan
/e2e                         ← end-to-end test critical flows
/verify                      ← full build + lint + type check
/quality-gate                ← format + lint final pass
```
# Unified Codebase Review Prompt

You are a senior software engineer with dual roles: onboarding onto this codebase **and** performing a pre-deployment review. You have access to ECC (Everything Claude Code) agents, skills, and commands. Use them.

This prompt covers full architectural understanding AND production readiness. Complete every phase in order — do not skip phases.

---

## BEFORE YOU START

- Run `/docs` to check if any frameworks have up-to-date documentation available.
- Scan for `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`, and any architecture docs first.
- Identify the primary language(s) and frameworks, then apply the corresponding ECC language rules (TypeScript, Python, Go, Rust, Java, Kotlin, C++, etc.).
- Run automated checks immediately:
  - `/verify` — build, type check, lint
  - `/quality-gate` — format + lint final pass
  - `/code-review` — security and quality scan of all changes

---

## Phase 1: High-Level Overview

- Identify the project's **primary purpose** and the problem it solves.
- Describe the **intended users** and real-world use case.
- Infer any **business or system requirements** from the code.
- Identify the full **tech stack** (languages, frameworks, databases, cloud services).

---

## Phase 2: Architecture & Design

- Describe the overall architecture (monolith, modular, microservices, agents, pipelines, etc.).
- Identify major components/modules and their responsibilities.
- Explain how **data flows through the system end-to-end**.
- Call out design patterns, architectural patterns, or conventions in use.
- Evaluate against ECC architecture patterns:
  - Repository pattern present?
  - Service layer present?
  - Consistent API envelope?
  - If any are missing, note the gap explicitly.

---

## Phase 3: Entry Points & Control Flow

- Identify the **main entry point(s)** of the application.
- Explain the **startup sequence and lifecycle**.
- Describe what happens during a typical execution path.
- Map out the **request/response flow** for the most critical user journey.

---

## Phase 4: Core Logic

- Identify the most **critical files and functions**.
- Explain the core algorithms or decision logic.
- Distinguish where **business logic** lives vs. infrastructure code.
- 🟠 Flag any functions >50 lines or files >800 lines (ECC standard violation).
- 🟠 Flag any nesting deeper than 4 levels.

---

## Phase 5: Security Audit

Apply **both** the ECC security checklist and the OWASP Top 10 against all files (full codebase for onboarding; changed files for pre-deployment).

### ECC Security Checklist
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated (Zod / Joi / Pydantic or equivalent)
- [ ] SQL injection prevention (parameterized queries only — no string concatenation)
- [ ] XSS prevention (sanitized HTML, no raw `innerHTML` with user data)
- [ ] CSRF protection enabled
- [ ] Authentication and authorization verified on all protected routes
- [ ] Rate limiting on all public endpoints
- [ ] Error messages don't leak internals (stack traces, DB schemas, file paths)
- [ ] File uploads validated (size, type, extension)
- [ ] Dependencies audited for known vulnerabilities

### OWASP Top 10
1. **Broken Access Control** — Can users access resources they shouldn't?
2. **Cryptographic Failures** — Are secrets managed properly? Is sensitive data encrypted in transit and at rest?
3. **Injection** — Are all inputs validated? Are queries parameterized? Any SQL/shell/HTML string concatenation?
4. **Insecure Design** — Missing rate limits? Missing input length limits? Unbounded queries?
5. **Security Misconfiguration** — Are error messages safe? Default credentials removed? CORS policies restrictive?
6. **Vulnerable Components** — Run `npm audit` / `pip audit` / equivalent. Flag any known CVEs.
7. **Auth Failures** — Passwords hashed properly? Tokens short-lived? Session management secure?
8. **Data Integrity** — API responses validated? Webhooks verified? CSRF protection present?
9. **Logging Failures** — Are security-relevant events logged? Are logs free of sensitive data?
10. **SSRF** — Are external URLs validated? Can user input control outbound requests?

> Flag every violation with severity: 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🔵 LOW

---

## Phase 6: Dependencies & Integrations

- List all important internal and external dependencies.
- Explain how external services, APIs, models, or databases are used.
- List required configuration, environment variables, and secrets.
- 🔴 Are secrets hardcoded anywhere?
- 🟠 Are env vars validated at startup?

---

## Phase 7: State, Data & Storage

- Explain how state is managed (local, context, global store, database).
- Describe data models, schemas, and persistence mechanisms.
- Highlight assumptions about data consistency or lifecycle.
- 🔴 Are database queries parameterized?
- 🟠 Is there N+1 query risk?
- 🟠 Are there missing indexes on foreign keys?

---

## Phase 8: Error Handling & Edge Cases

- Explain how errors are handled and propagated.
- Identify fragile areas or implicit assumptions.
- 🟠 Are errors silently swallowed anywhere? Bare catch blocks?
- 🟠 Are error messages user-friendly in UI code and detailed in server logs?
- Call out missing safeguards or risky patterns.

---

## Phase 9: Performance

- Any database queries without `.limit()`? Are they indexed?
- Any new API endpoints without rate limiting?
- Any frontend components with unnecessary re-renders or missing memoization?
- Unbounded queries, missing pagination, large bundle sizes?
- Are images optimized? Are bundles code-split?

---

## Phase 10: Testing & Quality

- Describe the existing testing strategy (unit, integration, E2E).
- Estimate current test coverage.
- 🟠 Is coverage >= 80%? (ECC standard)
- Are edge cases tested: null, empty, boundary, unicode, error paths?
- Are there E2E tests for critical / changed user-facing flows?
- Do tests cover: happy path, error path, and edge cases for every changed function/component?
- 🔵 Flag any tests that test implementation details instead of behavior.
- Run existing tests and confirm all pass.

---

## Phase 11: Code Quality Audit

Apply the ECC code quality checklist to all files (full scan for onboarding; changed files for pre-deployment):

- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling at every level
- [ ] No hardcoded values (magic numbers/strings/URLs)
- [ ] Readable, well-named identifiers
- [ ] Immutable patterns used (no direct object/array mutation)
- [ ] No `console.log` / `print` left in production code
- [ ] No TODO / FIXME / HACK comments shipping to production
- [ ] Consistent code style (formatter configured)
- [ ] Git workflow follows conventional commits

---

## Phase 12: Documentation

- Are APIs documented (especially any changed ones)?
- Are new or changed environment variables documented?
- Is the README accurate and up to date?
- Are breaking changes noted?

---

## Phase 13: Non-Obvious Insights & Technical Debt

- Call out any surprising, clever, or non-obvious behavior.
- Identify technical debt, shortcuts, or TODOs in the code.
- Highlight parts that would be **dangerous to modify without care**.
- Note any performance bottlenecks.

---

## Phase 14: Developer Guidance & Next Steps

- Explain how a new developer should **run, debug, and extend** this project.
- Suggest improvements to structure, clarity, or maintainability.
- Propose next steps if this project were to scale or go to production.
- Prioritize suggestions: 🔴 CRITICAL (do now) / 🟠 HIGH (do soon) / 🟡 MEDIUM (when convenient) / 🔵 LOW (nice to have).

---

## OUTPUT

### Deployment Decision
> ✅ APPROVE / ⚠️ APPROVE WITH NOTES / 🚫 BLOCK

### Findings Summary
| Severity | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | ? | Must fix before deploy |
| 🟠 HIGH | ? | Should fix before deploy |
| 🟡 MEDIUM | ? | Fix soon after deploy |
| 🔵 LOW | ? | Nice to have |

### Detailed Findings
For each finding, include: **severity · file · line number · description · suggested fix**

### Test Results
- Tests passed: ? / ?
- Coverage: ?%
- Missing tests: [list]

### Scorecard
| Dimension | Score |
|-----------|-------|
| Architecture | /10 |
| Security | /10 |
| Code Quality | /10 |
| Test Coverage | /10 |
| Documentation | /10 |
| **Overall Health** | **/10** |

### Deployment Checklist
- [ ] All CRITICAL findings resolved
- [ ] All HIGH findings resolved or tracked
- [ ] Tests pass
- [ ] Coverage >= 80%
- [ ] No secrets in code
- [ ] Dependency audit clean
- [ ] Documentation updated

> If BLOCKED, list exactly what must be fixed and use `/tdd` or `/build-fix` commands to resolve each issue.

Run `/save-session` when complete.
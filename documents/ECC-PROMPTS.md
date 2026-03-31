# ECC-Enhanced Prompts for Claude Code

Two battle-tested prompts that leverage ECC's agents, skills, and commands for rigorous codebase analysis.

---

## Prompt 1: Deep Codebase Onboarding

Use this when you first open a project or join a new codebase. Paste into Claude Code.

```
You are a senior software engineer onboarding onto this codebase. You have access to ECC (Everything Claude Code) agents, skills, and commands. Use them.

Your task is to deeply investigate and understand the CURRENTLY OPEN project with the rigor of a security audit and the thoroughness of an architecture review.

BEFORE YOU START:
- Run `/docs` to check if any frameworks in this project have up-to-date documentation available.
- Scan for CLAUDE.md, README.md, CONTRIBUTING.md, and any architecture docs first.
- Identify the primary language(s) and frameworks, then apply the corresponding ECC language rules (TypeScript, Python, Go, Rust, Java, Kotlin, C++, etc.).

Please do the following in order:

1. HIGH-LEVEL OVERVIEW
   - Identify the project's primary purpose and problem it solves.
   - Describe the intended users and real-world use case.
   - Infer any business or system requirements from the code.
   - Identify the tech stack (languages, frameworks, databases, cloud services).

2. ARCHITECTURE & DESIGN
   - Describe the overall architecture (monolith, modular, microservices, agents, pipelines, etc.).
   - Identify major components/modules and their responsibilities.
   - Explain how data flows through the system end-to-end.
   - Call out design patterns, architectural patterns, or conventions being used.
   - Evaluate against ECC's architecture patterns: Does it use repository pattern? Service layer? Consistent API envelope? If not, note what's missing.

3. ENTRY POINTS & CONTROL FLOW
   - Identify the main entry point(s) of the application.
   - Explain the startup sequence and lifecycle.
   - Describe what happens during a typical execution path.
   - Map out the request/response flow for the most critical user journey.

4. CORE LOGIC
   - Identify the most critical files and functions.
   - Explain the core algorithms or decision logic.
   - Highlight where the "business logic" lives vs infrastructure code.
   - Flag any functions >50 lines or files >800 lines (per ECC coding standards).
   - Flag any nesting deeper than 4 levels.

5. DEPENDENCIES & INTEGRATIONS
   - List important internal and external dependencies.
   - Explain how external services, APIs, models, or databases are used.
   - Note any configuration, environment variables, or secrets that are required.
   - Check: Are secrets hardcoded anywhere? Are env vars validated at startup?
   - Run `npm audit` / `pip audit` / equivalent to check for vulnerable dependencies.

6. STATE, DATA & STORAGE
   - Explain how state is managed (local, context, global store, database).
   - Describe data models, schemas, and persistence mechanisms.
   - Highlight any assumptions about data consistency or lifecycle.
   - Check: Are database queries parameterized? Is there N+1 query risk? Are there missing indexes on foreign keys?

7. SECURITY REVIEW (ECC Security Standards)
   Apply the ECC security checklist:
   - [ ] No hardcoded secrets (API keys, passwords, tokens)
   - [ ] All user inputs validated (schema-based with Zod/Joi/Pydantic or equivalent)
   - [ ] SQL injection prevention (parameterized queries only)
   - [ ] XSS prevention (sanitized HTML, no raw innerHTML with user data)
   - [ ] CSRF protection enabled
   - [ ] Authentication and authorization verified on all protected routes
   - [ ] Rate limiting on public endpoints
   - [ ] Error messages don't leak internal details (stack traces, DB schemas, file paths)
   - [ ] File uploads validated (size, type, extension)
   - [ ] Dependencies checked for known vulnerabilities
   Flag every violation found with severity: CRITICAL / HIGH / MEDIUM / LOW.

8. ERROR HANDLING & EDGE CASES
   - Explain how errors are handled and propagated.
   - Identify fragile areas or implicit assumptions.
   - Call out missing safeguards or risky patterns.
   - Check: Are errors silently swallowed anywhere? Are there bare catch blocks? Are error messages user-friendly in UI code and detailed in server logs?

9. TESTING & QUALITY
   - Describe the existing testing strategy (unit, integration, E2E).
   - Calculate or estimate current test coverage.
   - Identify gaps in test coverage or reliability risks.
   - Check against ECC standard: Is coverage >= 80%? Are edge cases tested (null, empty, boundary, unicode, error paths)?
   - Are there E2E tests for critical user flows?
   - Flag any tests that test implementation details instead of behavior.

10. CODE QUALITY AUDIT (ECC Coding Standards)
    Apply the ECC code quality checklist:
    - [ ] Functions are small (<50 lines)
    - [ ] Files are focused (<800 lines)
    - [ ] No deep nesting (>4 levels)
    - [ ] Proper error handling at every level
    - [ ] No hardcoded values (magic numbers/strings)
    - [ ] Readable, well-named identifiers
    - [ ] Immutable patterns used (no direct mutation of objects/arrays)
    - [ ] No console.log left in production code
    - [ ] Consistent code style (formatter configured)
    - [ ] Git workflow follows conventional commits

11. NON-OBVIOUS INSIGHTS
    - Call out any surprising, clever, or non-obvious behavior.
    - Identify technical debt, shortcuts, or TODOs in the code.
    - Highlight parts that would be dangerous to modify without care.
    - Note any performance bottlenecks (unbounded queries, missing pagination, large bundle sizes, unnecessary re-renders).

12. DEVELOPER GUIDANCE
    - Explain how a new developer should run, debug, and extend this project.
    - Suggest improvements to structure, clarity, or maintainability.
    - Propose next steps if this project were to scale or go to production.
    - Prioritize suggestions as: CRITICAL (do now) / HIGH (do soon) / MEDIUM (when convenient) / LOW (nice to have).

OUTPUT FORMAT:
- Use severity tags: 🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🔵 LOW
- Reference specific files, functions, and line numbers in your explanations.
- Include code snippets for any violations found.
- End with a summary scorecard:
  - Architecture: [score/10]
  - Security: [score/10]
  - Code Quality: [score/10]
  - Test Coverage: [score/10]
  - Documentation: [score/10]
  - Overall Health: [score/10]

IMPORTANT:
- If something is unclear or missing, explicitly say so and infer carefully.
- Do NOT speculate beyond what the code reasonably implies.
- Prioritize correctness over completeness.
- Save your findings with /save-session when done.
```

---

## Prompt 2: Pre-Deployment Review

Use this before merging a PR or deploying to production. Paste into Claude Code.

```
You are a senior software engineer performing a pre-deployment review. You have access to ECC agents, skills, and commands. This review must pass before code ships to production.

REVIEW SCOPE: All uncommitted changes, or the current branch vs main.

Execute the following review pipeline in order:

## Phase 1: Automated Checks
Run these commands and report results:
- /verify — build, type check, lint
- /quality-gate — format + lint final pass
- /code-review — security and quality scan of all changes

## Phase 2: Security Audit
Apply the OWASP Top 10 checklist against all changed files:

1. **Broken Access Control** — Are all endpoints properly authenticated and authorized? Can users access resources they shouldn't?
2. **Cryptographic Failures** — Are secrets properly managed? Is sensitive data encrypted in transit and at rest?
3. **Injection** — Are all inputs validated? Are queries parameterized? Is there any string concatenation in SQL/shell/HTML?
4. **Insecure Design** — Are there missing rate limits? Missing input length limits? Unbounded queries?
5. **Security Misconfiguration** — Are error messages safe? Are default credentials removed? Are CORS policies restrictive?
6. **Vulnerable Components** — Run dependency audit. Flag any known CVEs.
7. **Auth Failures** — Are passwords hashed properly? Are tokens short-lived? Is session management secure?
8. **Data Integrity** — Are API responses validated? Are webhooks verified? Is there CSRF protection?
9. **Logging Failures** — Are security-relevant events logged? Are logs free of sensitive data?
10. **SSRF** — Are external URLs validated? Can user input control outbound requests?

## Phase 3: Code Quality
For every changed file, check:
- [ ] No functions >50 lines
- [ ] No files >800 lines
- [ ] No nesting >4 levels deep
- [ ] No hardcoded secrets, URLs, or magic numbers
- [ ] No console.log / print statements left in
- [ ] No TODO/FIXME/HACK comments shipping to production
- [ ] Error handling is comprehensive (no bare catches, no swallowed errors)
- [ ] No direct object mutation (use spread/copy patterns)

## Phase 4: Test Validation
- Are there tests for every changed function/component?
- Do tests cover: happy path, error path, edge cases (null, empty, boundary)?
- Is test coverage >= 80% for changed files?
- Are there E2E tests for any changed user-facing flows?
- Run existing tests and confirm all pass.

## Phase 5: Performance Check
- Any new database queries? Are they indexed? Do they have .limit()?
- Any new API endpoints? Do they have rate limiting?
- Any new frontend components? Check for unnecessary re-renders, missing memoization.
- Are images optimized? Are bundles code-split?

## Phase 6: Documentation
- Are changed APIs documented?
- Are new environment variables documented?
- Is the README up to date?
- Are breaking changes noted?

## OUTPUT

### Deployment Decision: ✅ APPROVE / ⚠️ APPROVE WITH NOTES / 🚫 BLOCK

### Findings Summary
| Severity | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | ? | Must fix before deploy |
| 🟠 HIGH | ? | Should fix before deploy |
| 🟡 MEDIUM | ? | Fix soon after deploy |
| 🔵 LOW | ? | Nice to have |

### Detailed Findings
[List each finding with: severity, file, line, description, suggested fix]

### Test Results
- Tests passed: ?/?
- Coverage: ?%
- Missing tests: [list]

### Deployment Checklist
- [ ] All CRITICAL findings resolved
- [ ] All HIGH findings resolved or tracked
- [ ] Tests pass
- [ ] Coverage >= 80%
- [ ] No secrets in code
- [ ] Dependency audit clean
- [ ] Documentation updated

If BLOCKED, list exactly what must be fixed with /tdd or /build-fix commands to resolve each issue.
Save findings with /save-session when complete.
```

---

## Tips for Using These Prompts

1. **Onboarding prompt**: Use it the first time you open any project. The scorecard at the end gives you a quick health snapshot.

2. **Pre-deployment prompt**: Use it before every PR merge or deployment. Copy the deployment decision into your PR description.

3. **Pair with ECC commands**: After either prompt runs, you can immediately act on findings:
   - Security issues → `/code-review` for deeper analysis
   - Missing tests → `/tdd` to generate them
   - Build errors → `/build-fix` to resolve
   - Architecture questions → `/plan` for restructuring

4. **Session continuity**: Both prompts end with `/save-session`. Next time you open the project, `/resume-session` loads the previous analysis.

5. **Customize**: Add project-specific checks (e.g., "Check that all Supabase queries use RLS" or "Verify all API routes go through the auth middleware").
# Residual Review Findings — cross-gem CSS authoring policy (AVO-1483)

Branch `avo-1483/refactor/cross-gem-css-policy` (workspace + external/avo).
Source: `ce-code-review` run `20260723-172008-d02583fa`, 8 reviewers.
Plan: `docs/plans/2026-07-23-001-refactor-cross-gem-css-policy-plan.md`.

Everything below was **reviewed and deliberately not applied** in that run.
Findings that were applied are in commit `eadba43`.

## Not applied — needs its own work

- **P1 · `gems/avo-kanban` · no cascade-survival coverage** (testing, project-standards,
  maintainability). The migrated hover/focus-within reveal of `.kanban-column__add`, the
  `.column-drag-handle` cursor, and `.kanban-destroy-link` hover colours have no test.
  `.claude/rules/gem-css.md` step 6 requires a computed-style spec per migrated gem, and
  only avo-dashboards has one. Suggested: mirror
  `gems/avo-dashboards/spec/system/avo/cascade_survival_spec.rb`.

- **P1 · `gems/avo-forms` · no cascade-survival coverage** (testing, project-standards).
  `.form-page` / `.form-page__nav` responsive shell is untested. avo-forms is Minitest with
  no dummy app of its own, so this needs a harness decision, not just a test.

- **P2 · `gems/avo-dashboards` · row chrome untested** (testing). `cascade_survival_spec.rb`
  proves grid geometry only. Row hover background, table/list first-and-last-child rounding,
  and the RTL date-link flip are unasserted — the list-row border regression fixed in
  `eadba43` lived exactly in that blind spot.

- **P2 · `lib/workspace/cli/commands/audit_css.rb` · CLI class has no direct test**
  (testing). The `halt` → `exit 1` wiring CI depends on is never executed by a test; all 18
  cases call `Workspace::CssAudit.scan` directly.

- **P2 · baseline can grow silently** (maintainability, adversarial). `--update-baseline`
  re-derives the file with no floor, and CI only runs the check mode. Suggested: a
  no-growth check comparing entry count against the base branch, with an explicit override.

- **P2 · three dead `empty:kanban-dragging:*` classes retained** (maintainability,
  adversarial). Proven never to have rendered: the `@custom-variant` is registered in avo
  core, not kanban, so kanban's own build cannot resolve it, and this branch removes the
  gem-scan that was core's only path to kanban markup. Kept rather than deleted because
  implementing the drag affordance locally vs. dropping the intent is a product decision.
  Now caught by the audit and baselined.

## Pre-existing — surfaced, not caused by this branch

- **P1 · `gems/avo-api/config/initializers/avo.rb` ships to customers** (security).
  The gemspec's `config/**/*` glob packages a dummy-app initializer. The other four gems
  keep the identical block under `test/dummy/config/initializers/`. Traced to `37b5648`
  (2026-07-03). Fix: move it under `test/dummy/`.

- **P2 · monorepo lockfiles pinned to stale avo 4.0.13** (project-standards, filed P0).
  Demoted on verification: avo core is 4.0.17 and *every* gem lock on `main` says 4.0.13,
  so the drift is pre-existing and universal. This branch moves 6 locks to match core and
  takes none the other way. Remedy is a standalone `ws bundle-all` pass.

- **`avo-dynamic_filters` uses `index-missing-resources:`**, a core-only custom variant.
  Surfaced by the widened scanner in `eadba43`; baselined, not migrated.

### From the audit_logging CI-hang investigation (2026-07-23)

The `avo-audit_logging:dummy` flake (`Net::ReadTimeout` + "Requests did not finish in 60
seconds") was root-caused to Avo's license check running inline in the first page render on
a cold cache; fixed for CI by a suite-boot warmup (`d4c2fb4`). The investigation surfaced
these pre-existing defects, all reproduced on `main`:

- **P1 · every Avo page in `avo-audit_logging/spec/dummy` responds 500.** The legacy
  routes file mounts `Avo::Engine` directly and never mounts `Avo::AdvancedSearch::Engine`,
  so the navbar's global-search component raises `NoMethodError: avo_advanced_search`.
  Specs pass anyway because they assert only `Activity` counts (written before the render
  fails). Fix: switch `spec/dummy/config/routes.rb` to `mount_avo` like
  `spec/paper_trail_dummy`.

- **P1 · `avo-licensing` re-attempts Clerk HTTP on every render when the cache is empty**
  (production-relevant). `HQ#handle_expired_response` throttles retries to one per 5
  minutes, but the cache-*miss* path (`process_request`) has no throttle — and
  `REQUEST_MUTEX` serializes the calls globally, so a Clerk outage with a cold cache turns
  every page render into a 10–20s serialized wait (unbounded if DNS stalls; the 5s
  timeouts don't cover `getaddrinfo`). Fix: extend the `last_attempt` throttle to the miss
  path. Touches all paid gems — own PR.

- **P2 · the JS error detector in `avo-audit_logging` specs is inert.** Selenium's W3C
  driver returns no browser logs without the `goog:loggingPrefs` capability, so
  `logs.get(:browser)` is always empty and the SEVERE-console-error assertion never fires
  (which is how the 500s above went unnoticed).

- **P3 · paper_trail dummy "show" example fails locally, passes CI.** `visit` on a product
  show page renders 200 but records no `Activity` (local-only; reproduced on `main`).

## Advisory

- `DataCard#classes_for_rows` (`gems/avo-dashboards/lib/avo/cards/data_card.rb`) still uses
  the retired Tailwind-string idiom. Not broken — plain utilities, no variant, no collision —
  but it leaves two idioms in one gem. Out of the plan's settled scope (KTD2: variant-carrying
  elements only), so deliberately not widened.
- Kanban's component rules are unlayered while dashboards and forms use `@layer components`.
  Both outrank `@layer utilities`, so this is safe today, but it depends on core continuing to
  declare the same four layers in the same order — pinned by no test.
- The bare-utility-name-in-comment trap (a Tailwind token in prose emits that CSS rule) is
  documented in `gem-css.md` and inline, but nothing enforces it.
- Scanner covers `.erb`/`.rb` under `app/` and `lib/` only. Class strings built in gem
  JavaScript (kanban's Stimulus drag controllers) are outside the guard. Nothing there today.
- Baseline key is `(file, variant)`: a variant reintroduced at a *different* call site in an
  already-baselined file passes silently. Renames and moves fail closed.

## Coverage note

The cross-model adversarial pass did not run — the codex route returned 401 at preflight, an
execution-context authentication failure in this sandbox. The in-process `adversarial-reviewer`
covered the lens instead and produced the P1 that two reviewers converged on.

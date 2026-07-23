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

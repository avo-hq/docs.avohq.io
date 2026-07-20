---
title: "feat: Dashboard Table Card"
type: feat
status: active
date: 2026-07-20
origin: docs/brainstorms/2026-07-20-dashboard-table-card-requirements.md
---

# feat: Dashboard Table Card

## Overview

Add `Avo::Cards::TableCard` to the avo-dashboards gem: a declarative data-in/table-out dashboard card styled like the resource index table but not tied to a resource. Users declare optional `headers`, return rows of cells from `query`/`result(data)`, and cells render as text, links, images, badges, record links, or arbitrary partials. All work lands in `gems/avo-dashboards`; avo core is only consumed (CSS classes, `Avo::UI::BadgeComponent`, resource helpers, existing i18n keys), not modified.

## Problem Frame

Dashboards offer metric, chartkick, and partial cards — there is no declarative way to show tabular or list data ("latest signups", "failed jobs") without hand-writing ERB. A single TableCard covers tables and lists (a one-column, header-less table is a list). See origin: `docs/brainstorms/2026-07-20-dashboard-table-card-requirements.md`.

## Requirements Trace

Carried from the origin doc (stable IDs):

- R1 `Avo::Cards::TableCard < BaseCard`, registered like existing cards → Unit 1
- R2 optional `headers`, ExecutionContext-resolved (array or block) → Units 1, 2
- R3 `query`/`result(data)`, data = array of row arrays → Units 1, 2
- R4 BaseCard behavior inherited; `#type` + `CardComponent` dispatch extended with `:table` → Unit 1
- R5–R10, R16 cell vocabulary (text, link, image, badge, partial, record) with escaping → Unit 2
- R11 renders via `CardComponent` → `Avo::UI::CardComponent`; header + thead independently optional → Units 1, 2
- R12 `rows` acts as height cap with focusable vertical scroll; horizontal scroll like index table → Unit 3
- R13 translated empty state → Unit 2
- R17 `card__header` renders when `ranges` present even without label/description → Unit 1
- R18 accessibility (accessible name from label, keyboard-focusable scroll region) → Units 2, 3
- R14 dummy-app examples (full table + header-less list) → Unit 4
- R15 docs page section incl. top-N/`limit` guidance → Unit 5

## Scope Boundaries

- Not a resource table: no sorting, pagination, row selection, row controls, or per-row policies.
- No separate ListCard; no column DSL.
- No bespoke in-card error state: a failing `query` behaves like existing card types.
- No avo core code changes (CSS, components, helpers, locale keys are reused as-is).
- Trust model: `query` output is developer-curated data — same trust level as PartialCard. No per-row authorization checks; URL scheme guarding (below) is the only hardening.

## Context & Research

### Relevant Code and Patterns

- Render path: `dashboards_controller#show` → `Avo::CardsComponent` (lazy `turbo_frame_tag` per card) → `Avo::Dashboards::CardsController#show` → `app/views/avo/dashboards/cards/show.html.erb` → `Avo::Cards::CardComponent`. `result_data` is populated by `CardComponent#init_card` calling `card.query` (`gems/avo-dashboards/app/components/avo/cards/card_component.rb`).
- Change surfaces (verified): `BaseCard#type` (`gems/avo-dashboards/lib/avo/cards/base_card.rb:124-128`) hardcodes three types; `card_component.html.erb` branches its body on `card.type` (lines 44-52) and gates the range select on `card.type.in?([:metric, :chartkick, :partial])` (line 24); `display_header?` keys off label/description only.
- Card class pattern: `lib/avo/cards/metric_card.rb` — `class_attribute`s + presenter methods resolved through `handle_execution_context` (base_card.rb:244-252). `headers`/`empty_message` follow the `label` pattern exactly (instance override or class attribute, procs handled, plain values passed through).
- Index table visuals (avo core, reused not modified): `table.w-full.border-separate.border-spacing-0`; th classes `relative text-start px-2 py-2 whitespace-nowrap` + label `text-content-secondary tracking-tight leading-tight text-xs font-semibold` (`external/avo/app/views/avo/partials/_table_header.html.erb`); `tbody.card__body.table-row-group.rounded-lg`; `tr.table-row` (row borders/radii/hover CSS in `external/avo/app/assets/stylesheets/css/table.css` — pure CSS keyed on `.table-row`, no resource coupling); td classes `px-2 py-4 leading-none whitespace-nowrap text-content text-sm` (`external/avo/app/components/avo/index/field_wrapper_component.html.erb`); horizontal scroll via `card__wrapper mac-styled-scrollbar overflow-auto` (`external/avo/app/components/avo/view_types/table_component.html.erb`).
- Badge: `Avo::UI::BadgeComponent` (`external/avo/app/components/avo/u_i/badge_component.rb`) — props `label`, `color` (22 valid colors, invalid falls back to `:neutral`), `style` (`:solid`/`:subtle`, default subtle), `icon`.
- Record resolution: `helpers.record_title(record)` / `helpers.record_path(record)` (`external/avo/app/helpers/avo/resources_helper.rb:52-63`), backed by `Avo.resource_manager.get_resource_by_model_class`.
- Empty state i18n: `avo.no_item_found` ("No record found") already exists in avo core locales (~20 languages); avo-dashboards ships no locale files of its own.
- Height precedent: `BaseCard#card_classes` maps `rows` → literal `min-h-[Nrem] row-span-N` classes (written out so Tailwind doesn't purge them); ChartkickCard computes inner height as `rows * 144 - 40` px.
- Dummy/spec conventions: examples at `gems/avo-dashboards/spec/dummy/app/avo/cards/example_*.rb` (`Avo::Cards::Example*`), registered in `spec/dummy/app/avo/dashboards/dashy.rb`; system specs at `spec/system/avo/*_spec.rb` (Capybara/Cuprite, `visit "/admin/..."`); run via `ws test avo-dashboards`.
- Tailwind: avo-dashboards compiles its own utilities (`tailwind.config.js` content paths cover the gem's components/views); avo-core BEM classes (`.table-row`, `.card__body`) arrive via avo core's stylesheet at runtime.

### Institutional Learnings

- `docs/solutions/` contains a single, unrelated document (hotkeys). Transferable bits: use `around`-block config save/restore in specs if any global config is touched; follow the frozen-DEFAULTS config pattern if TableCard ever grows global config (it doesn't in v1).
- Prior plan `docs/plans/2026-04-02-001-feat-hotkey-configuration-plan.md` establishes the plan format and R-number tracing used here.
- Docs convention (affects Unit 5): the docs repo's own `AGENTS.md` (inside `docs/`) is the newer authority — guide + `<Option>`-style reference pages — and wins over the older workspace rule that says plain code blocks.

### External References

None needed — all patterns are local and verified.

## Key Technical Decisions

- **ViewComponent, not an ERB partial, for the table body**: cell dispatch is logic-heavy (type detection, escaping, fallbacks). Create `Avo::Cards::TableCardComponent` in avo-dashboards, rendered from the new `:table` branch. Metric/chartkick keep their partial style; this component follows the repo's component-development conventions. **No lookbook preview**: avo-dashboards has zero lookbook infrastructure (it exists only in avo core's dummy); the gem's dummy dashboard (port 3030) is the live preview. This is a deliberate, documented exception to the "always lookbook" rule.
- **Cell dispatch precedence** (fixed, documented): for a `Hash` cell after `symbolize_keys` — `:partial` > `:record` > `:badge` > `:image` > `:url`/`:text` > fallback. `{text:}` without `url:` renders as plain text. An unrecognized hash renders as escaped `to_s`. Never raise in the production render path.
- **Ergonomic coercions**: an ActiveRecord object as a cell is treated as `{record:}`; a non-array row is promoted to a one-cell row (so `result users` "just works" as a list); `result_data` is normalized with `Array(...)`+`to_a` (Relations work); `nil`/never-called `result` → empty state, matching MetricCard's "user must call result" contract.
- **Record cell fallbacks**: `record: nil` renders an em-dash; a model with no registered Avo resource renders the escaped `to_s` title without a link (and raises a descriptive error in development only).
- **URL scheme guard**: `url:` and `image:` values are rendered only with http/https/mailto/relative schemes (`javascript:` etc. render as plain text). Cell text is always escaped (R10); raw HTML only via the partial cell. Partial cell contract: standard ActionView lookup (host app first), locals = explicit `locals:` plus `card:` — never derive the partial path from row data.
- **Range-select gate inverted**: change the gate in `card_component.html.erb` from the type allowlist to `card.ranges.present?` — fixes the class of bug for every future card type instead of growing the list.
- **Header gate**: `display_header?` becomes `label || description || ranges.present?` (R17). Side effect (accepted, an improvement): existing label-less cards with `ranges` gain a header with the range select — previously the select was silently lost.
- **Height cap**: a literal `rows` → `max-h` class map (mirroring `classes_for_rows`' anti-purge pattern) applied to the scroll region *inside* the card body (below the optional header), with `overflow-y-auto`, `mac-styled-scrollbar`, `tabindex="0"`, `aria-label` from the card label, and a `focus-visible` ring. The card-level `min-h` grid classes stay untouched.
- **Full-bleed table**: the `:table` branch must NOT reuse the metric branch's `px-4 pb-4` wrapper — rows run edge to edge like the index table; horizontal overflow scrolls via the same `overflow-auto` treatment.
- **Empty state**: default `t("avo.no_item_found")` (reuses existing translations in ~20 languages, zero core locale changes); per-card override via `self.empty_message` class attribute, ExecutionContext-resolved (resolves the deferred R13 question).
- **Headers semantics**: `nil` and `[]` are equivalent (no thead); resolved per render (so block form gives per-locale translation); plain strings for v1 — no `{label:, align:, width:}` hash form (resolves the deferred R2 question; revisit on demand).
- **`refresh_every` scroll reset accepted**: a frame reload snaps the scrolled body to top; documented ("avoid `refresh_every` on tall tables") rather than engineered around in v1.

## Open Questions

### Resolved During Planning

- Header hash form (align/width)? → No; plain strings/block for v1.
- CSS reuse vs new BEM block? → Reuse avo core's `.table-row`, `card__body`, th/td utility classes directly; they are resource-agnostic. Only the height-cap classes are new, in avo-dashboards' own stylesheet/build.
- Which badge component? → `Avo::UI::BadgeComponent`; cell exposes optional `style:`; invalid colors fall back to `:neutral` by component design.
- Cell-hash detection rules, ragged rows? → Precedence table above; short rows pad with empty `td`s to header count, long rows render all cells.
- Image cell defaults? → `size-8 rounded-full object-cover` avatar default; `size:` accepts `:xs`/`:sm`/`:md` enum.
- Partial lookup context? → Standard ActionView resolution, explicit locals + `card:`.
- Height-cap mechanism? → Literal `max-h` map on the inner scroll region (see decisions).
- Empty state customizable? → Yes, `self.empty_message` per card; global default `avo.no_item_found`.

### Deferred to Implementation

- Exact `max-h` rem values per `rows` step: tune visually in the dummy app against the `min-h` grid values (8rem per row minus header/chrome).
- Whether `.table-row` CSS renders pixel-perfect inside the dashboard card's `card__body` context or needs 1-2 local overrides: verify in browser, adjust in avo-dashboards' stylesheet only.
- `em-dash` vs empty cell for nil record: pick whichever reads better in the dummy app.

## Implementation Units

- [ ] **Unit 1: TableCard class + pipeline dispatch**

**Goal:** `Avo::Cards::TableCard` exists, is recognized by the card pipeline, and header/range gating works per R17.

**Requirements:** R1, R2, R3, R4, R11, R17

**Dependencies:** None

**Files:**
- Create: `gems/avo-dashboards/lib/avo/cards/table_card.rb`
- Modify: `gems/avo-dashboards/lib/avo/cards/base_card.rb` (`#type` returns `:table`)
- Modify: `gems/avo-dashboards/app/components/avo/cards/card_component.rb` + `.html.erb` (`:table` body branch; range gate → `card.ranges.present?`; `display_header?` → label/description/ranges)
- Test: `gems/avo-dashboards/spec/system/avo/table_card_spec.rb` (created here, grows in later units)

**Approach:**
- TableCard mirrors `metric_card.rb`: `class_attribute :headers`, `class_attribute :empty_message`; reader methods resolving through `handle_execution_context` (accept instance override like `label` does).
- The `:table` branch renders `Avo::Cards::TableCardComponent.new(card:)` (stub in this unit, built in Unit 2) with no padding wrapper.

**Patterns to follow:** `lib/avo/cards/metric_card.rb`, `BaseCard#label` ExecutionContext pattern.

**Test scenarios:**
- Happy path: a registered TableCard on a dashboard renders a card frame with its label in `card__header`.
- Happy path: `headers` as a block returns per-request values (e.g. interpolating an argument).
- Edge case: card with `ranges` and no label/description still renders `card__header` containing the range select (R17).
- Edge case: existing metric/chartkick/partial example cards still render and show their range selects (gate inversion regression check).

**Verification:** dummy dashboard renders a stub table card without breaking any existing card type.

- [ ] **Unit 2: TableCardComponent — cell dispatch and table markup**

**Goal:** The full table renders: thead from headers, tbody rows from `result_data`, all six cell types, escaping, coercions, empty state, accessible name.

**Requirements:** R2, R3, R5–R10, R13, R16, R18

**Dependencies:** Unit 1

**Files:**
- Create: `gems/avo-dashboards/app/components/avo/cards/table_card_component.rb` + `.html.erb`
- Test: `gems/avo-dashboards/spec/system/avo/table_card_spec.rb`

**Approach:**
- Markup mirrors the index table: `table.w-full.border-separate.border-spacing-0`, thead th classes from `_table_header.html.erb`, `tbody.card__body.table-row-group.rounded-lg`, `tr.table-row`, td classes from `field_wrapper_component`. `<caption class="sr-only">` from the card label when present.
- Cell normalization in the component (not the card class): `Array(result_data)`, row promotion, AR-object coercion, `symbolize_keys`, precedence dispatch, ragged-row padding, URL scheme guard.
- Badge cells render `Avo::UI::BadgeComponent`; record cells use `helpers.record_title`/`helpers.record_path`; image cells default `size-8 rounded-full object-cover`.
- Empty/absent data renders the empty-state message (`empty_message` or `t("avo.no_item_found")`) centered in the body; thead still renders if headers are declared.

**Test scenarios:**
- Happy path: headers + rows of [record cell, plain text, badge cell] render a linked title, escaped text, and a badge with the right color class.
- Happy path: header-less single-column card (`result users` — bare AR objects, non-array rows) renders a linked list with no thead.
- Happy path: link cell renders anchor with text/url/target; image cell renders img with default avatar classes; partial cell renders a host-app partial receiving `locals` and `card`.
- Edge case: `{text: "just text"}` (no url) renders plain text; unrecognized hash renders escaped `to_s`; ragged short row pads `td`s to header count.
- Edge case: `query` never calls `result`, or `result(nil)` → empty state, no exception; `result(User.limit(3))` (Relation) works.
- Edge case: `{record: nil}` renders placeholder; record of an unregistered model renders unlinked title (and raises in development).
- Error path/security: cell text containing `<script>` is escaped; `url: "javascript:alert(1)"` renders as plain text, not an anchor.
- Integration: changing the range select reloads the frame and re-runs `query` with the new range (rows change).

**Verification:** all cell types visible and correct in the dummy dashboard; system spec green.

- [ ] **Unit 3: Height cap, scrolling, and styling polish**

**Goal:** Tall tables cap at the card's `rows` height and scroll; wide tables scroll horizontally; scroll region is keyboard-accessible.

**Requirements:** R12, R18

**Dependencies:** Unit 2

**Files:**
- Modify: `gems/avo-dashboards/app/components/avo/cards/table_card_component.rb` + `.html.erb` (scroll wrapper)
- Modify: `gems/avo-dashboards/app/assets/stylesheets/avo-dashboards/application.css` (only if `.table-row` needs local overrides or the focus ring needs a rule)
- Test: `gems/avo-dashboards/spec/system/avo/table_card_spec.rb`

**Approach:**
- Literal `rows` → `max-h-[...]` class map (same anti-purge pattern as `card_classes`), on a wrapper div inside `card__body` with `overflow-auto mac-styled-scrollbar`, `tabindex="0"`, `aria-label` = card label, `focus-visible` ring. Values tuned to the `min-h` grid steps (deferred detail).
- Confirm full-bleed layout (no metric padding) and that `discreet_description`'s corner icon doesn't overlap the scrollbar (add end padding if it does).

**Test scenarios:**
- Happy path: a 50-row card with `rows = 2` renders capped with a scrollable body (element has `overflow-auto` and bounded height); the dashboard grid row is not stretched.
- Edge case: a 2-row card shows no scrollbar and does not reserve extra height.
- Edge case: a very wide table scrolls horizontally inside the card without widening the page.

**Verification:** visual check in dummy app at multiple `cols`/`rows` combos; keyboard focus reaches the scroll region.

- [ ] **Unit 4: Dummy-app examples + full system coverage**

**Goal:** Living examples that double as the feature's preview and regression net (R14) — including the header-less list that validates the "one card covers lists" premise.

**Requirements:** R14

**Dependencies:** Units 1–3

**Files:**
- Create: `gems/avo-dashboards/spec/dummy/app/avo/cards/example_table.rb` (headers; record/link/badge/image cells; `ranges`; `rows = 2` with enough data to scroll)
- Create: `gems/avo-dashboards/spec/dummy/app/avo/cards/example_list.rb` (header-less, single-column, bare records)
- Modify: `gems/avo-dashboards/spec/dummy/app/avo/dashboards/dashy.rb` (register both)
- Test: `gems/avo-dashboards/spec/system/avo/table_card_spec.rb` (assertions target these examples)

**Test scenarios:** covered by Units 1–3's scenarios running against these example cards; add one scenario asserting both example cards render on the same dashboard without id/frame collisions.

**Verification:** `ws test avo-dashboards` green; both cards look right at `http://localhost:3030`.

- [ ] **Unit 5: Documentation**

**Goal:** Customers can discover and use TableCard from the docs (R15).

**Requirements:** R15

**Dependencies:** Units 1–4 (API frozen)

**Files:**
- Modify: the dashboards page under `docs/4.0/` (locate the existing cards section; add "Table card")
- Modify: `docs/.vitepress/config.js` only if a new page is created (prefer extending the existing dashboards page)

**Approach:** Follow the docs repo's own `AGENTS.md` conventions (guide + `<Option>` reference format — it supersedes the older workspace "plain code blocks" rule). Cover: defining a TableCard, headers (string + block form), every cell type with a copy-pasteable example, `empty_message`, the top-N/`limit` guidance, the `refresh_every`-on-tall-tables caveat, and the trust model note (query output is developer-curated; no per-row authorization).

**Test scenarios:** Test expectation: none — documentation-only unit. Verify with `npx vitepress build docs`.

**Verification:** docs build clean; page renders with sidebar/outline intact.

## System-Wide Impact

- **Interaction graph:** `card_component.html.erb` is shared by all card types — the gate changes (range select, `display_header?`) affect metric/chartkick/partial cards. Only visible behavior change: label-less cards with `ranges` now show a header with the range select (previously silently lost — an improvement, but note it in the release notes).
- **Error propagation:** unchanged — `query` exceptions bubble exactly as for existing cards (scope boundary). Render-path cell handling never raises in production; development gets a descriptive error only for unregistered record-cell models.
- **State lifecycle risks:** `result_data` is a `class_attribute` (pre-existing pattern shared by all cards); table payloads are bigger than metric scalars but the mechanism is unchanged. `refresh_every` reload resets scroll position — accepted and documented.
- **API surface parity:** resource-attached cards (`card` in a resource) get TableCard for free via the shared pipeline; verify once in the dummy User resource.
- **Integration coverage:** range change → frame reload → re-query is covered by a system spec (the select controller mutates `src` before `reload()`; that ordering is load-bearing).
- **Unchanged invariants:** avo core is untouched — no CSS, component, helper, or locale changes; `MetricCard`/`ChartkickCard`/`PartialCard` public APIs unchanged; the dashboard grid (`card_classes` min-heights, `cols`/`rows` spans) unchanged.
- **Tailwind builds:** new utility classes used in avo-dashboards templates must be compiled by avo-dashboards' own Tailwind build (content paths already cover `app/components`) — the literal-class-map pattern keeps the `max-h` steps purge-safe.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `.table-row` CSS renders differently inside the dashboard card's `card__body` context than on the index page | Verify visually in the dummy app early (Unit 2); add minimal local overrides in avo-dashboards' stylesheet if needed — do not touch core CSS |
| Height cap fights the grid's `min-h` classes (cap smaller than min height) | Tune `max-h` values against the `min-h` steps in Unit 3; cap applies to the inner scroll region, not the card |
| Gate inversion changes behavior of third-party custom cards with `ranges` | Behavior change is strictly additive (select now appears); call out in changelog |
| Cell-hash heuristics misfire on legitimate hash *data* | Documented precedence + escaped `to_s` fallback; users can always stringify explicitly |
| `avo.no_item_found` wording ("No record found") slightly off for arbitrary tables | Per-card `empty_message` override is first-class; acceptable default |

## Documentation / Operational Notes

- Release: avo-dashboards patch/minor via `ws release minor -g avo-dashboards` (new feature → minor). No core avo release required.
- Changelog note for the header/range-gate behavior change.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-07-20-dashboard-table-card-requirements.md](../brainstorms/2026-07-20-dashboard-table-card-requirements.md)
- Related code: `gems/avo-dashboards/lib/avo/cards/base_card.rb`, `gems/avo-dashboards/app/components/avo/cards/card_component.html.erb`, `external/avo/app/components/avo/view_types/table_component.html.erb`, `external/avo/app/views/avo/partials/_table_header.html.erb`, `external/avo/app/assets/stylesheets/css/table.css`, `external/avo/app/components/avo/u_i/badge_component.rb`, `external/avo/app/helpers/avo/resources_helper.rb`
- Prior plan (format reference): `docs/plans/2026-04-02-001-feat-hotkey-configuration-plan.md`

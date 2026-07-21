---
date: 2026-07-20
topic: dashboard-table-card
---

# Dashboard Table Card

## Problem Frame

Avo dashboards currently offer three card types: metric, chartkick, and partial. There is no declarative way to show tabular or list data ("latest signups", "top products", "failed jobs") — today users must hand-write a partial card. A `TableCard` gives them a data-in, table-out card that looks like Avo's resource index table but is not tied to a resource.

The same card covers list use cases: a table with one column and no header row is a list. No separate ListCard.

## Requirements

**Card definition API**

- R1. New `Avo::Cards::TableCard < Avo::Cards::BaseCard`, defined the same way as existing cards (class in `app/avo/cards/`, registered via `card` in a dashboard or resource).
- R2. Column headers are declared with `self.headers = ["Name", "Email", ...]`. Headers are optional — omitting them renders no `thead` (the list look). Like other card attributes, `headers` resolves through `ExecutionContext` (accepts an array or a block), so translated or dynamic headers work per-request.
- R3. Data comes from the existing `query` / `result(data)` pattern (matching `BaseCard#result(data)`). `data` is an array of row arrays; each row array holds cells positionally matching `headers`. Named `data`, not "rows", to avoid colliding with the existing `rows` grid-height attribute.
- R4. All `BaseCard` behavior works unchanged and for free: `label`, `description`, `discreet_description`, `cols`/`rows`, `ranges`/`initial_range`, `refresh_every`, `visible`, arguments. Known change surface: `Avo::Cards::BaseCard#type` and the dispatch in `Avo::Cards::CardComponent` (body branch and the range-select type gate) hardcode `:metric`/`:chartkick`/`:partial` and must gain a `:table` branch — everything else is inherited for free.

**Cell types**

- R5. A plain value cell renders as escaped text (`u.email`, numbers, dates via `to_s`).
- R6. Link cell: `{text:, url:, target: (optional)}` renders an anchor.
- R7. Image cell: `{image:, alt: (optional), size: (optional)}` renders an image/avatar thumbnail.
- R8. Badge cell: `{badge:, color:}` reuses Avo's existing badge styling.
- R9. Cell partial escape hatch: `{partial:, locals: (optional)}` renders any ERB partial inside the cell — the path for arbitrary components/styled elements without growing the cell vocabulary.
- R10. All cell text is HTML-escaped by default; raw HTML only enters through the partial cell.
- R16. Record cell: `{record: user}` takes an ActiveRecord object, resolves its Avo resource, and renders a link with the record's title to its show page — the flagship "latest signups" case needs no manual URL building.

**Rendering**

- R11. The card renders through the existing `Avo::Cards::CardComponent` → `Avo::UI::CardComponent` pipeline: when `label`/`description` are present, the normal `card__header` renders (keeping range select, refresh, dev editor link); the table renders below it in the resource-index style (`thead` styled like the index table header, `tbody` as `card__body`). Both the card header and the `thead` are independently optional. This requires extending `BaseCard#type` and `gems/avo-dashboards/app/components/avo/cards/card_component.html.erb` with a `:table` branch; `Avo::UI::CardComponent`'s slots are reusable as-is.

```
┌─ card ────────────────────────┐
│ Latest signups        [range] │  ← card__header (optional)
│ Newest users this week        │
├───────────────────────────────┤
│ NAME      EMAIL        PLAN   │  ← thead (optional)
├───────────────────────────────┤
│ Jane      j@x.com      Pro    │  ← card__body rows
│ Omar      o@y.com      Free   │
└───────────────────────────────┘
```

- R12. Works with a single row or many. The card's `rows` grid setting acts as a height cap for the table card (today `card_classes` only emits min-heights): content past the cap scrolls vertically inside the card body, and the scroll region is keyboard-focusable (`tabindex="0"`). Wide content horizontally scrolls with the same `overflow-auto` treatment as the index table's `card__wrapper`.
- R13. Empty result renders a subtle translated empty-state message (e.g. "No records found"), not a bare empty card.
- R17. When `ranges` are declared, the `card__header` renders even without a `label`/`description`, so the range select (which lives in the header) is never silently lost.
- R18. Accessibility: the table takes its accessible name from the card label when present (caption/aria-label); header-less mode is presentational and documented as such.

**Docs & examples**

- R14. Example TableCards in the avo-dashboards dummy app: a full table (headers, link/badge/record cells) and a header-less single-column list — the latter validates the "one card covers lists" premise before the API freezes.
- R15. Dashboards docs page in `docs/4.0/` gets a Table card section (headers, cell types, escape hatch), including guidance that the card is for top-N data — cap row counts in the query (`limit`); there is no pagination.

## Success Criteria

- A linked, badged "latest signups" table is expressible in ~15 lines of card class with zero ERB.
- The card reuses the resource index table's visual treatment (header styling, row borders, radii) minus interactive affordances — no row hover background or cursor-pointer, since rows are not clickable.
- A one-column, header-less card reads as a clean list — no ListCard needed.

## Scope Boundaries

- Not a resource table: no sorting, pagination, row selection, row controls, or per-row policies.
- No separate ListCard.
- No column DSL / block-based cell formatting — the data-driven hash API plus the partial escape hatch covers it. Revisit only if real usage demands it.
- Whole-card custom rendering remains `PartialCard`'s job.
- No bespoke in-card error state: a failing `query` behaves the same as it does in existing card types.

## Key Decisions

- **One TableCard, no ListCard**: a single-column, header-less table is a list; one concept to build and document.
- **Data-driven cells over column DSL**: matches the existing MetricCard/ChartkickCard "query returns data" pattern; keeps HTML out of card classes; smaller API surface.
- **Cell vocabulary**: text, link, image, badge, plus per-cell partial as the universal escape hatch.
- **Header marriage**: stack `card__header` above the table's `thead`, each optional — `Avo::UI::CardComponent` already supports both paths, so no new layout concepts.
- **Tall tables cap and scroll**: the `rows` grid setting becomes a max-height for this card type; overflow scrolls inside the body. Chosen over letting the card grow unboundedly and distort the grid row.
- **Wide content horizontal-scrolls**: same treatment as the resource index table, keeping visual/behavioral parity with it rather than truncating.
- **`{record:}` cell included**: the motivating use cases are resource-backed records; linking to them must be zero-boilerplate.

## Outstanding Questions

### Deferred to Planning

- [Affects R2][Technical] Whether headers need a hash form (`{label:, align:, width:}`) for alignment/width control, or plain strings suffice for v1.
- [Affects R11][Technical] Exact CSS reuse: whether the index table's `thead`/`tbody` classes can be shared directly or the table card needs its own BEM block in the card stylesheet.
- [Affects R8][Technical] Which existing badge component/classes to reuse from avo core (likely `Avo::UI::BadgeComponent` — confirm its color/style vocabulary and whether the cell exposes `style:`).
- [Affects R5–R9][Technical] Cell-hash detection rules: key precedence when multiple type keys appear, behavior when a plain data value is itself a Hash, and behavior for ragged rows (cell count ≠ header count).
- [Affects R7][Technical] Image cell defaults: size, shape (circle avatar vs rounded thumbnail), and crop (`object-cover`), with `size:` as a small enum rather than arbitrary pixels.
- [Affects R9][Technical] Partial lookup context for cell partials: resolution against host app vs engine views, and which helpers/locals are available.
- [Affects R12][Technical] The exact height-cap mechanism (max-height per `rows` value alongside the existing min-heights) and the scrollbar treatment (`mac-styled-scrollbar`).
- [Affects R13][Product] Whether the empty-state message is customizable per card (e.g. "No signups this week") or global-only in v1.

## Next Steps

→ `/ce:plan` for structured implementation planning

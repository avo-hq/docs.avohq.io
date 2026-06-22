# How the screenshot process works

End-to-end reference for the docs-screenshot pipeline. This file explains the
**pipeline and the reuse model**; see `RULES.md` for the capture + framing rules and
`README.md` for install + usage.

> Committed reference. What you do with a finished image (stage, commit, PR) is your call —
> the pipeline only produces it.

---

## TL;DR

Adding a screenshot = **edit `specs.mjs`** (declare it) + **run the 4 core scripts**.
You don't write new capture code per screenshot — you add a data entry and reuse the
generic engines.

```
specs.mjs            capture.mjs                 annotate.mjs / record-gif.mjs        copy
(declare)  ───────▶  (Playwright shoots +  ───▶  (ImageMagick draws / animates)  ───▶  into
                      records mark boxes)                                                docs/
```

---

## Prerequisites

A local Avo **demo app** must be running (the harness shoots the demo, not the test
dummy — see README lesson #1):

| Thing            | Value                                   |
|------------------|-----------------------------------------|
| Base URL         | `http://localhost:3020`, Avo at `/avo`  |
| Admin login      | `avo@cado.com` / `secreto`              |
| Toolchain        | Playwright (headless Chromium) + ImageMagick (`magick`) |
| DPR              | 2 (retina)                              |

```bash
export AVO_BASE_URL=http://localhost:3020 AVO_ADMIN_EMAIL=avo@cado.com AVO_ADMIN_PASSWORD=secreto
```

---

## Stage 1 — declare the shot (`specs.mjs`)

Every screenshot is **one data object**. You edit this file; you don't write a script.

```js
{
  id: "bt-index",                                    // → out/bt-index.png
  path: "/avo/resources/comments?per_page=6",        // where to navigate
  viewport: { width: 1440, height: 1100 },           // default 1440×900
  settle: 700,                                        // ms to wait after load
  prepare: (page) => {…},                             // optional interactions
  clip: { x: 985, y: 230, width: 182, height: 122 }, // OR selector: "…" for an element
  marks: [{ selector: '…', type: "highlight" }],     // annotation targets (optional)
  out: "docs/public/assets/img/4_0/…/x.png",         // final docs destination
}
```

Three ways to frame a shot:
- **`selector` + `pad`** — the element plus real surrounding page padding (genuine
  breathing room, not a fake border).
- **`selector`** alone — just that element.
- **`clip`** (or `fullPage`) — a fixed pixel region of the viewport.

The hard-coded `clip`/`selector`/`mark` coordinates are exactly what the throwaway
`probe-*` scripts were used to discover (see Reuse model below).

## Stage 2 — capture (`capture.mjs`)

```bash
node capture.mjs [specId …]        # no args = all specs
```

For the run: **logs in once**, reuses the session, opens a retina context in the chosen
color scheme. Then per spec:

1. Navigate to `path`, set viewport, wait for `networkidle`.
2. Run optional `prepare(page)` (open a dropdown, scroll a table to reveal action icons,
   hide hotkey badges…).
3. Wait `settle` ms for transitions.
4. **Screenshot** → `out/<id>.png` (or `<id>-dark.png`).
5. **Record annotation coordinates** — for each `mark`, grab its live `boundingBox()`,
   convert to image-relative pixels (×DPR), write `out/<id>.boxes.json`. This sidecar is
   what makes annotation coordinate-exact instead of eyeballed.

## Stage 3 — annotate (`annotate.mjs`, only if the spec has marks)

```bash
node annotate.mjs <specId>
```

Reads `out/<id>.png` + `out/<id>.boxes.json` and draws in one house style (Avo blue
`#2563eb`) with ImageMagick → `out/<id>.annotated.png`:
- **highlight** → rounded-rect outline around the element
- **badge** → numbered accent circle at its corner
- **arrow** → accent arrow pointing at it from n/s/e/w

## Stage 3b — GIFs (`record-gif.mjs`)

Playwright's bundled ffmpeg has no GIF muxer, so animated docs capture **key frames as
PNGs** during a scripted interaction (holding on a state by emitting duplicate frames),
then assemble: `magick -delay 18 -loop 0 frames/*.png -layers Optimize` →
`out/keep-filters-panel-open.gif`.

## Stage 4 — dark variants

Re-run the same commands with the dark env flags. Every image ships a light + dark pair.

```bash
AVO_COLOR_SCHEME=dark node capture.mjs <id>     # → out/<id>-dark.png
ANNOTATE_DARK=1     node annotate.mjs <id>       # → out/<id>-dark.annotated.png
AVO_COLOR_SCHEME=dark node record-gif.mjs        # → out/keep-…-dark.gif
```

## Stage 5 — apply into the docs (manual)

Copy the final keepers from `out/` to their `out:` path under
`docs/public/assets/img/4_0/…`, then wire the markdown `<Image>` tags with
`src` + `dark-src` + dims. After this, **`out/` is disposable scratch** — it can be
cleared at any time; everything regenerates from `specs.mjs` + the core scripts.

---

## Reuse model — which scripts are reusable

| Script(s)          | Reusable?                | Role |
|--------------------|--------------------------|------|
| `capture.mjs`      | ✅ generic engine         | Shoots any spec; never edited to add a shot |
| `annotate.mjs`     | ✅ generic engine         | Draws marks for any id from its `.boxes.json` |
| `record-gif.mjs`   | ✅ generic-ish            | Frame→GIF assembler (one scripted interaction) |
| `specs.mjs`        | ✅ extend it              | The catalog you edit; has factories (`tmSpec(…)`) + helpers (`_hk`) to stamp out repeats |
| `probe-*.mjs` (47) | ⚠️ template only          | One-off DOM inspectors that print selectors/coords for one page |
| `shoot-*.mjs` (7)  | ⚠️ template only          | Quick standalone captures before folding into `specs.mjs` |
| `scout-*.mjs` (2)  | ⚠️ template only          | Scan the demo DB for records rich enough to screenshot |
| `verify-*.mjs` (3) | ⚠️ template only          | Sanity-check captures (e.g. dark variants) |

**The 4 core scripts are the reusable machinery.** To add a new screenshot you only
edit `specs.mjs` and re-run them.

**The scratch scripts are not reusable verbatim** — each hard-codes one page's
selectors. They're useful as **copy-paste templates**: to find coordinates for a new
page, copy the nearest `probe-*`, swap the selector, run it, read the numbers, paste
into `specs.mjs`, discard the probe.

---

## Reversibly adjusting the demo app to surface a state

Some screenshots need a UI state the demo doesn't show by default — an error screen, a
policy-gated button, a hidden association panel. The rule: **temporarily edit the demo
app to surface exactly what the docs need, capture, then return the app to its initial
state.** The screenshot reflects a real, reproducible Avo behaviour; the demo is left
untouched.

How it works:

- **Models + Avo resources hot-reload** in dev — edit one, the next request picks it up,
  no server restart. **Initializer config does NOT hot-reload**; to flip a global like
  `explicit_authorization`, set `Avo.configuration.X = …` inside a **reloadable resource
  file's** class body (e.g. `team.rb`), not the initializer.
- Make the **smallest** edit that surfaces the state, in the **right place**.
- **Revert every edit** once the captures (light + dark) are done: `git checkout -- <file>`
  for tracked files, `git clean -f <file>` for new ones.
- **Verify clean afterwards** — `git status` should show only the user's own pre-existing
  changes. Never revert those — run `git status` FIRST and treat any already-modified file as
  off-limits (it's the user's WIP).

Examples used for these docs (all applied, captured, then reverted):

| Screenshot | Temp edit | Why |
|------------|-----------|-----|
| Authentication — developer backtrace | `user.rb`: `def is_developer? = true` + `course.rb`: `before_save { raise … }` | Avo only renders the backtrace panel for a developer user when a non-validation error is raised on save. |
| Authorization — policy buttons | `team.rb`: `Avo.configuration.explicit_authorization = false` | With `explicit_authorization = true`, policy-gated buttons (and association panels whose `view_{association}?` isn't allowed, e.g. the `team_members` panel) are hidden. Disabling it reveals every button so each can be highlighted. |

Note the second case is a real authorization behaviour: the captured panel is normally
**hidden** in the demo, so a reader can't reproduce it without the same toggle — worth
keeping in mind when choosing which panel to shoot.

---

## Surfacing specific field / component states — patterns & gotchas

`RULES.md` covers how to *frame* a shot; this is how to get Avo to *render* the thing in the
first place. Two situations, plus the non-obvious tricks for each (all hard-won — they save
the resolver from rediscovering them by trial and error).

### A field type the demo doesn't show — the "virtual field" method

To document a field type (boolean, progress_bar, date_time, code, status…) you rarely need a
real DB column. Temp-add a **virtual field** of that type to a clean resource (the resource
file +, for form inputs, the model), capture index / show / new, then `git checkout` both.

- **Display (index / show)** — a computed field renders with no column:
  `field :demo, as: :progress_bar do; 73; end`. The `do` block runs in Avo's
  **ExecutionContext**, so reference the record as **`record.id`, not `id`**.
- **Form inputs (new / edit)** — a `do`-block field is read-only on forms. For an input that
  **pre-fills**, back it with a real accessor on the model: **`attr_accessor :demo`** +
  **`after_initialize { self.demo ||= <default> }`** so the New form isn't blank.
- One temp edit can add several virtual fields at once; revert every touched file when done.

### A state that exists but is hidden / closed — trigger it in `prepare`

Many components are present but not visible until interacted with. Open them in the spec's
`prepare(page)` (compose from `prepare.mjs`) before the shot:

| To shoot… | Default state | Trick |
|-----------|---------------|-------|
| date_time calendar | input shown, calendar closed (real input is `!hidden`) | `await page.$eval(sel, i => i._flatpickr.open())` |
| boolean_group "View" popover | hidden until hover (it's a tippy) | hover `[data-tippy-target="source"]` |
| progress_bar value label (e.g. "73%") | not rendered until the value changes | dispatch an `input` event on the range input; the field needs `display_value` / `value_suffix` |
| actions_list / "Runnables" on show/edit | hidden when the only action is `visible: -> { view.index? }` | temp-set that action's `visible: -> { true }` |

### DSL gotchas (so the temp edit actually renders)

- `heading` is **`field :x, as: :heading, label: "…"`** — a bare `heading "…"` silently does nothing.
- Make any visible label/value **match the doc's code example** (RULES.md lesson 13) — rename the
  temp field / its options to the doc's names *before* shooting, not after.

### Known limitations — flag these, don't fake them

Some states can't be surfaced from a clean checkout. When you hit one, leave the placeholder
**unresolved with the reason** — never invent, composite, or approximate the image:

- **Maps** (`map-view`, `fields/location`) need a valid `MAPBOX_ACCESS_TOKEN` in the demo env;
  without it the map area renders an API-key error instead of a map.
  → *unresolvable: needs `MAPBOX_ACCESS_TOKEN` in the demo env.*
- **File fields** (download / delete controls) need a record with a **seeded ActiveStorage
  attachment**; with none, only the empty upload input renders. Attaching one mutates demo data,
  so it's the user's call. → *unresolvable: needs a record with a seeded attachment.*

---

## Recipe — add one new screenshot

1. (If you need coordinates) run `node probe.mjs <path> [selector]` and read the box/clip values.
2. Add a spec object to the `SPECS` array in `specs.mjs` (reuse a factory / the `EXAMPLES` shapes).
3. `node capture.mjs <id>` → check `out/<id>.png`.
4. If it has marks: `node annotate.mjs <id>`.
5. Dark: re-run both with `AVO_COLOR_SCHEME=dark` / `ANNOTATE_DARK=1`.
6. `node apply.mjs <id>` — copies the PNGs into `docs/public/assets/img/4_0/…` and rewrites the tag.
7. Review the unstaged changes and decide what to do with them — the pipeline never commits/pushes/PRs.

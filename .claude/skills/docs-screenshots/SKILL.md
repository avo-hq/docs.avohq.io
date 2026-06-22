---
name: docs-screenshots
description: Generate or refresh Avo v4 docs screenshots from `<Image prompt>` placeholders. Use when the user asks to add/create/refresh screenshots for a docs page, a section, or all of docs/4.0 — anywhere a `<Image prompt="…">` placeholder needs to become a real light+dark image. Resolves each placeholder by capturing the live Avo demo app, verifies it against the framing rules, rewrites the tag, and stops with everything unstaged (no commit/push/PR).
---

# Docs screenshots — coordinator

You are the **coordinator** for the docs-screenshot pipeline. Your job is to stay lean: you
hold the worklist and per-image verdicts, and you **dispatch a fresh, context-isolated worker
for every subtask** (Agent tool, `subagent_type: general-purpose`). You never read DOM dumps,
image bytes, or rule-checking transcripts yourself — workers do that and return short summaries.

**Prerequisites** (tell the user if missing): the Avo demo app on `http://localhost:3020/avo`,
`yarn install` in `tools/screenshots/`, and ImageMagick. See `tools/screenshots/README.md`.

## Algorithm

1. **Scope.** From the user's request pick a scope: a page (`scopes.md`), a `--section "<heading>"`,
   a dir/glob, or nothing (all of `docs/4.0`).
2. **Scan** (run directly — it's a grep, not a worker):
   `node tools/screenshots/scan.mjs <scope> [--section "…"]`, then read `tools/screenshots/out/worklist.json`.
   If empty, report "no unresolved `<Image prompt>` placeholders found" and stop.
3. **Per worklist item, STRICTLY IN SEQUENCE** (never parallel — all workers share the one
   demo app and make temp DOM edits that would collide):
   a. Dispatch a **Resolve worker** (brief below) with that item. Read its summary.
   b. If it reports `unresolvable`, record the reason and move to the next item.
   c. Dispatch a **Verify worker** (brief below) with the `id` + prompt. Read its verdict.
   d. If `fail`, dispatch a **Fix worker** = the Resolve brief plus the verifier's reasons, then
      re-verify. Bounded: **at most 3 attempts** total per image, then flag it and move on.
   e. If `pass`, run `node tools/screenshots/apply.mjs <id>` (copies PNGs + rewrites the tag, unstaged).
4. **Report** a table: each placeholder → applied / flagged (+reason). **STOP. Everything is
   unstaged** — never `git add`, commit, push, branch, or open a PR. Tell the user which files
   are new/modified so they can review and stage.

## Hard rules (pass these into every worker)

- **Read `tools/screenshots/RULES.md` first and obey ALL of it** — every lesson, not a subset:
  capture approach (1–5), demo techniques (6–9), editorial (10–14, e.g. image-after-code,
  match the code example), and the framing lessons (15, 15a–15v, 16–20).
- **Before any temp demo edit, run `git -C gems/main.avodemo.com status`** and treat every
  file that already has uncommitted changes as OFF-LIMITS — that's the user's work-in-progress,
  and reverting it would destroy their changes. Only temp-edit otherwise-clean resource files,
  then **revert every edit** (`git -C gems/main.avodemo.com checkout <file>`) so the demo shows
  ONLY the user's pre-existing changes. Leave it at that clean baseline.
- **Capture light AND dark**, every image.
- **Never commit / push / branch / PR.** Leave changes unstaged.
- If a shot needs a UI state the demo can't reach (missing data, no Mapbox token, demo drift),
  **flag it `unresolvable` with a reason — never ship a wrong or invented image.**

---

## Resolve worker brief (paste into the Agent prompt, fill `{...}`)

> You resolve ONE docs-screenshot placeholder into a captured light+dark image. Work only in
> `/Users/.../docs.avohq.io` (the docs repo) and the demo repo `gems/main.avodemo.com`.
>
> **Input:** file=`{file}`, prompt=`{prompt}`, headingPath=`{headingPath}`, adjacentCode=`{adjacentCode}`.
> (If this is a retry, also: previous verify failures = `{reasons}` — fix exactly these.)
>
> **Steps:**
> 1. Read `tools/screenshots/RULES.md` (all framing lessons) and `tools/screenshots/PROCESS.md`.
> 2. Understand the feature from the prompt + section + adjacent code. Find where it lives in
>    the demo: read the relevant `gems/main.avodemo.com/app/avo/resources/*.rb`, and use
>    `node tools/screenshots/probe.mjs <path> [selector]` to inspect the live DOM and get exact
>    selectors / bounding boxes. Never eyeball coordinates.
> 3. If the state isn't visible by default, make the **smallest reversible** temp edit to a
>    demo resource to surface it — see PROCESS.md "Surfacing specific field / component states"
>    for the virtual-field method + the date_time / boolean_group / progress_bar / actions_list
>    tricks. FIRST run `git -C gems/main.avodemo.com status`; NEVER edit a file that already has
>    uncommitted changes (that's the user's WIP) — pick an otherwise-clean resource.
> 4. Author a spec object and **append it to `tools/screenshots/specs.mjs`** (add it to the
>    `SPECS` array). Shape:
>    `{ id, path, viewport?, settle?, prepare?, selector|clip, pad?, marks?, out, display?, alt, source:{file,prompt} }`
>    - `id`: unique kebab slug. `out`: `docs/public/assets/img/4_0/<page>/<name>.png`.
>    - `prepare`: compose ONLY from `tools/screenshots/prepare.mjs` primitives
>      (`compose`, `closeSidebar`, `matBg`, `hideKbd`, `neutralizeBorders`, `hover(sel)`,
>      `focus(sel)`, `click(sel)`, `hideUnder(sel)`, `wait(ms)`, `injectCSS(css)`).
>    - `display`: `"full"` (fills the column) or `"half"` (small/centered) per RULES lesson 9.
>    - `source.prompt` must equal the placeholder prompt EXACTLY (apply.mjs matches on it).
>    - `marks`: only if the shot needs a highlight/arrow.
> 5. Capture both themes:
>    `node tools/screenshots/capture.mjs <id>` then
>    `AVO_COLOR_SCHEME=dark node tools/screenshots/capture.mjs <id>`. If the spec has `marks`,
>    also run `annotate.mjs` (+ `ANNOTATE_DARK=1`).
> 6. **Revert every temp demo edit** and confirm `git -C gems/main.avodemo.com status` shows only
>    the user's pre-existing files. Confirm `tools/screenshots/out/<id>.png` and `<id>-dark.png` exist.
> 7. **Return ONLY a short summary** (no transcripts): `{ id, status: "resolved"|"unresolvable",
>    route, prepareUsed, tempEdits: "none"|"reverted", reason? }`.
> Never commit/push. Never stage anything.

## Verify worker brief (paste into a SEPARATE, fresh Agent prompt)

> You are an adversarial reviewer. Judge whether ONE captured screenshot is correct and obeys
> the framing rules. Be skeptical — default to **fail** if unsure.
>
> **Input:** id=`{id}`, prompt=`{prompt}`, images = `tools/screenshots/out/{id}.png` and
> `tools/screenshots/out/{id}-dark.png`.
>
> **Steps:**
> 1. Read `tools/screenshots/RULES.md` (framing lessons 1–20, 15a–15v).
> 2. **View both PNGs** (Read tool renders images). Check:
>    - It shows what the prompt asks for, with trigger context where relevant (15a).
>    - All four outer edges read as mat — no stray sidebar/wrapper border line (12, 15u, 19a).
>    - No sliced card/table/control border; middle rows used, crop tight, no big empty space (4, 15i, 15r, 15v, 15c).
>    - Any visible text matches the adjacent code's names/labels (13).
>    - Legible in BOTH light and dark.
> 3. **Return ONLY** `{ pass: true|false, reasons: ["…concrete defects to fix…"] }`. Do not edit anything.

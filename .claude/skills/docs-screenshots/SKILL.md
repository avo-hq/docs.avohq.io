---
name: docs-screenshots
description: Generate or refresh Avo v4 docs screenshots (and animated GIFs) from `<Image prompt>` placeholders. Use when the user asks to add/create/refresh screenshots or GIFs for a docs page, a section, or all of docs/4.0 — anywhere a `<Image prompt="…">` placeholder needs to become a real light+dark asset. A placeholder with `kind="gif"` becomes an animated GIF; otherwise a static PNG. Resolves each placeholder by capturing the live Avo demo app, verifies it against the framing rules, rewrites the tag, and stops with everything unstaged (no commit/push/PR).
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
   If empty, report "no unresolved `<Image prompt>` placeholders found" and stop. Each item carries
   `kind: "image" | "gif"` — a placeholder tagged `kind="gif"` wants an **animated GIF** (the
   "GIF route" below) instead of a static PNG. Route each item by its `kind`.
3. **Phased flow.** Only **capture touches the shared demo**, so only capture is serial.
   Verify (reads PNGs) and apply (edits the docs repo) touch no shared state — fan them out.
   a. **Capture — STRICTLY IN SEQUENCE** (never parallel: all Resolve workers share the one
      demo app and make temp DOM edits that would collide). For each worklist item, dispatch a
      **Resolve worker** (brief below) — pass the GIF addendum when `kind === "gif"` — and read
      its summary. If it reports `unresolvable`, record the reason and drop it from the batch.
   b. **Verify — IN PARALLEL.** Once every capture is done, dispatch all **Verify workers**
      (brief below) in one batch (multiple Agent calls in a single message), each with an
      `id` + prompt (+ `kind`). Collect their verdicts. **GIF caveat:** a verifier can only see
      ONE static frame (the Read tool doesn't animate), so it judges framing only — it cannot
      confirm the motion is right. Always flag passed GIFs in the final report as
      "frame-verified, motion needs a human eye."
   c. **Fix — back to serial.** For each `fail`, dispatch a **Fix worker** = the Resolve brief
      plus the verifier's reasons (serial — it re-captures and touches the demo), then re-verify
      that one image. Bounded: **at most 3 attempts** total per image, then flag it and move on.
   d. **Apply — batch.** For every asset that passed, run `node tools/screenshots/apply.mjs <id>`
      (copies the PNG **or GIF** pair + rewrites the tag, unstaged — apply.mjs reads the extension
      from the spec's `out:` path, so it handles both).
4. **Report** a table: each placeholder → applied / flagged (+reason). **STOP. Everything is
   unstaged** — never `git add`, commit, push, branch, or open a PR. Tell the user which files
   are new/modified so they can review and stage.

## Hard rules (pass these into every worker)

- **Read `tools/screenshots/CHECKLIST.md` first and obey ALL of it** — the compact rulebook
  covering every rule for the common case (setup, context, single-field, framing/sizing,
  marking, border hygiene, editorial, apply, GIFs). Each line is tagged with the source `#ref`
  in `RULES.md`; **open the full lesson in `RULES.md` only for an unusual shot or when a `#ref`
  line doesn't fully answer your case** (developer overlays, canvas charts, native `<select>`
  popups, odd width/border edge cases). Obeying the checklist = obeying the rules — it loses no
  enforceable rule, just the long-form prose. Don't skip a line because it seems minor.
- **The `main.avodemo.com` demo is disposable scratch space — don't track its state, move fast.**
  Edit whatever you need (resource files, controllers, models, initializer, seeds), reuse whatever
  already fits, and create resources/controllers/models from scratch when nothing does. You do NOT
  need to preserve or restore the demo: no `git status` pre-check, no treating modified files as
  off-limits, no reverting. Do what the shot needs and leave the demo as-is. (This freedom is ONLY
  for the demo project — still never commit/push there, and never touch the docs repo beyond the
  intended doc + asset changes.) Note: the initializer does not hot-reload, so restart the overmind
  `web` process after editing it; resource/controller files hot-reload on their own.
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
> 1. Read `tools/screenshots/CHECKLIST.md` (the compact rulebook — obey every line) and
>    `tools/screenshots/PROCESS.md`. Open the matching lesson in `RULES.md` by its `#ref` only
>    when a shot is unusual or a checklist line doesn't fully answer your case.
> 2. Understand the feature from the prompt + section + adjacent code. Find where it lives in
>    the demo: read the relevant `gems/main.avodemo.com/app/avo/resources/*.rb`, and use
>    `node tools/screenshots/probe.mjs <path> [selector]` to inspect the live DOM and get exact
>    selectors / bounding boxes. Never eyeball coordinates.
> 3. If the state isn't visible by default, edit the demo to surface it — see PROCESS.md "Surfacing
>    specific field / component states" for the virtual-field method + the date_time / boolean_group
>    / progress_bar / actions_list tricks. The demo is disposable scratch space: edit any file, reuse
>    what fits, or create a resource/controller/model from scratch — no `git status` check, no
>    off-limits files. (Initializer edits need an overmind `web` restart; resource/controller files
>    hot-reload.)
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
> 6. Leave the demo as-is — no need to revert your edits. Confirm `tools/screenshots/out/<id>.png`
>    and `<id>-dark.png` exist.
> 7. **Return ONLY a short summary** (no transcripts): `{ id, status: "resolved"|"unresolvable",
>    route, prepareUsed, demoEdits?: "<what you changed>", reason? }`.
> Never commit/push. Never stage anything.

### GIF route addendum (paste this INSTEAD of steps 4–5 when `kind === "gif"`)

> The placeholder wants an **animated GIF**, not a still. The interaction is what matters, so the
> prompt describes a sequence ("open the filter, pick a value, the table refilters"). Everything
> else (login, frames, dark variant, ImageMagick assembly) is handled by `record-gif.mjs`.
>
> 4. Read `tools/screenshots/record-gif.mjs` (the spec shape + how `snap(hold)` emits frames) and
>    study `GIF_EXAMPLE` + the existing entries in `GIF_SPECS` in `specs.mjs` as templates.
>    Author a **GIF spec** and append it to the **`GIF_SPECS`** array (NOT `SPECS`). Shape:
>    `{ id, path, viewport?, settle?, clip, width?, delay?, steps, out, alt, source:{file,prompt} }`
>    - `id`: unique kebab slug. `out`: `docs/public/assets/img/4_0/<page>/<name>.gif` (`.gif`, not `.png`).
>    - `clip`: the fixed `{x,y,width,height}` crop EVERY frame uses — probe it; never eyeball (RULES).
>    - `steps: async (page, snap) => {…}`: drive the UI with Playwright; call `snap(hold)` at each
>      state you want to show (`hold` = number of identical frames = how long to pause there).
>      Do the same framing prep the still route does (`closeSidebar`, `matBg`, `hideKbd`) at the top
>      of `steps` so all four edges read as mat and the component is shown whole.
>    - `source.prompt` must equal the placeholder prompt EXACTLY (apply.mjs matches on it).
> 5. Capture both themes:
>    `node tools/screenshots/record-gif.mjs <id>` then
>    `AVO_COLOR_SCHEME=dark node tools/screenshots/record-gif.mjs <id>`.
>    Confirm `tools/screenshots/out/<id>.gif` and `<id>-dark.gif` exist. (Then steps 6–7 as above —
>    leave the demo as-is, return the short summary; set `route: "gif"`.)
> If the interaction can't be driven reliably (state unreachable, element never appears), flag it
> `unresolvable` with a reason — never ship a misleading animation.

## Verify worker brief (paste into a SEPARATE, fresh Agent prompt)

> You are an adversarial reviewer. Judge whether ONE captured screenshot is correct and obeys
> the framing rules. Be skeptical — default to **fail** if unsure.
>
> **Input:** id=`{id}`, prompt=`{prompt}`, kind=`{kind}` ("image" | "gif"),
> assets = `tools/screenshots/out/{id}.png` + `{id}-dark.png` (or `.gif` when kind=="gif").
>
> **GIF note:** when kind=="gif" the Read tool renders only ONE frame of the animation. Judge the
> framing of that frame against all the rules below, but you CANNOT verify the motion/sequence —
> say so in `reasons` and pass on framing alone unless the frame itself violates a rule.
>
> **Steps:**
> 1. Read `tools/screenshots/CHECKLIST.md` (the compact rulebook — judge against every line).
>    Open a lesson in `RULES.md` by its `#ref` only if a checklist line is ambiguous for this shot.
> 2. **View both PNGs** (Read tool renders images). Check:
>    - It shows what the prompt asks for, with trigger context where relevant (15a).
>    - The component is shown WHOLE — none of its real controls/affordances are missing (15y). A
>      read-only Show projection that drops a field's add/delete/drag (or other) controls is a
>      fragment; prefer the Form view that renders it complete unless the doc is about read-only display.
>    - All four outer edges read as mat — no stray sidebar/wrapper border line (12, 15u, 19a).
>    - No sliced card/table/control border; middle rows used, crop tight, no big empty space (4, 15i, 15r, 15v, 15c).
>      **Judge "is any border sliced?" on the DARK PNG — a near-white card border is invisible on the
>      light image, so a cut top/edge passes in light and only shows in dark (15r′). Sample all four
>      edges of the dark image, not light.**
>    - Any visible text matches the adjacent code's names/labels (13).
>    - Legible in BOTH light and dark.
> 3. **Return ONLY** `{ pass: true|false, reasons: ["…concrete defects to fix…"] }`. Do not edit anything.

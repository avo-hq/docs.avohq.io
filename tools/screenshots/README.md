# Docs screenshots — automated capture from `<Image prompt>` placeholders

Turn a one-line intent in a docs page into a finished, light **+** dark screenshot — wired
into the page for you. You write what the picture should show; the pipeline figures out
*where* in the app it lives, captures it to the framing rules, verifies it, and rewrites the
tag. It stops with everything **unstaged** so you review before committing.

```html
<!-- you write this in a docs/4.0 page -->
<Image prompt="the preview popover open over the Team index, trigger row highlighted" />

<!-- the pipeline rewrites it to this (and drops the PNGs into docs/public/...) -->
<Image src="/assets/img/4_0/record-previews/preview.png"
       dark-src="/assets/img/4_0/record-previews/preview-dark.png"
       width="1180" height="360" alt="Preview popover over the Team index"
       prompt="the preview popover open over the Team index, trigger row highlighted" />
```

`prompt` stays on the tag as provenance and the refresh signal: **`prompt` + `src` = done.**
To re-shoot, delete the `src`/`dark-src` and run again.

---

## Prerequisites (one-time)

| Need | Why | Get it |
|------|-----|--------|
| **The Avo demo app running on `http://localhost:3020/avo`** | screenshots are taken from the real demo (login `avo@cado.com` / `secreto`) | clone & boot `gems/main.avodemo.com` |
| **Node + this folder's deps** | Playwright drives a headless browser | `cd tools/screenshots && yarn install` (installs Playwright) |
| **ImageMagick** (`magick`) | crops / annotates / assembles GIFs | `brew install imagemagick` |
| **Claude Code** | runs the agent pipeline (the Skill) | optional — the scripts also run standalone |

The docs site itself previews on `http://localhost:3011/` (`yarn dev` at the repo root).

---

## Install & enable the skill

The skill ships **inside this repo** at `.claude/skills/docs-screenshots/` — there's nothing
to install or register. Any colleague who opens this repo in **Claude Code** picks it up
automatically. Just do the three one-time prerequisites above (demo app on `:3020`,
`yarn install` in `tools/screenshots/`, ImageMagick).

**What it's called:** `docs-screenshots`. It's a natural-language skill (no slash command) —
you invoke it by simply asking Claude Code to add/create/refresh docs screenshots, and it
triggers automatically on requests like:

- "use the **docs-screenshots** skill on `scopes.md`"
- "add the screenshots for the Record previews page"
- "refresh the images in the Filters section of `basic-filters.md`"
- "generate screenshots for all of docs/4.0"

To confirm it's loaded, ask Claude Code *"what skills are available?"* — you should see
`docs-screenshots` listed.

---

## How to use it

### The easy way — the Skill (Claude Code)

1. Add `<Image prompt="…describe the shot…" />` wherever you want an image in a `docs/4.0` page.
2. Make sure the demo app is up on `:3020`.
3. Ask Claude Code to run the **docs-screenshots** skill, optionally with a scope:
   - *"generate the docs screenshots for `scopes.md`"*
   - *"…for the Filters section of `basic-filters.md`"*
   - *"…for all of docs/4.0"* (default)
4. Review the unstaged changes (new PNGs + rewritten tags), then commit yourself.

The skill is a **coordinator**: it dispatches a fresh, context-isolated worker per image
(resolve → verify → apply), in sequence, so it can process the whole docs set without
blowing up context. It **never commits, pushes, or opens a PR** — that's yours.

### The manual way — the scripts

```bash
cd tools/screenshots
export AVO_BASE_URL=http://localhost:3020 AVO_ADMIN_EMAIL=avo@cado.com AVO_ADMIN_PASSWORD=secreto

node scan.mjs [scope] [--section "<heading>"]   # 1. find placeholders → out/worklist.json
node probe.mjs <path> [selector]                # 2. inspect the live DOM to author a spec
# …add a spec object to specs.mjs (see RULES.md / PROCESS.md)…
node capture.mjs <id>                            # 3. shoot light
AVO_COLOR_SCHEME=dark node capture.mjs <id>      #    shoot dark
node annotate.mjs <id>                           # 4. (optional) draw highlights/arrows
node apply.mjs <id>                              # 5. copy PNGs + rewrite the tag (unstaged)
```

**Scope** (the `scan.mjs` argument) can be: omitted (all of `docs/4.0`), a page (`scopes.md`),
a directory, a glob, or `--section "<heading>"` to target one section of a page.

---

## What it does / doesn't do

- ✅ Resolves `<Image prompt>` placeholders → finished light+dark `<Image>` tags + assets.
- ✅ Follows the framing rules in **`RULES.md`** (mat backgrounds, tight crops, no sliced
  borders, text matches the adjacent code, legible in both themes) and verifies each shot.
- ✅ Leaves all changes **unstaged** for your review.
- ❌ Does **not** commit, push, branch, or open a PR.
- ❌ Does **not** invent UI states it can't reach — if a shot needs data/state the demo
  doesn't have, it flags the image and moves on rather than shipping something wrong.

---

## Files in this folder

| File | Role |
|------|------|
| `scan.mjs` | find `<Image prompt>` placeholders in a scope → worklist JSON |
| `probe.mjs` | inspect the live demo DOM (selectors, boxes) to author a spec |
| `specs.mjs` | the spec catalog — one entry per screenshot (the resolve agent appends here) |
| `prepare.mjs` | composable `prepare()` framing primitives (close sidebar, mat bg, hover…) |
| `capture.mjs` | spec → PNG (+ `.boxes.json`), light or dark |
| `annotate.mjs` | draw highlights / arrows / badges from a spec's `marks` |
| `record-gif.mjs` | assemble a GIF from captured frames |
| `apply.mjs` | copy PNGs to `out:` + rewrite the placeholder tag (unstaged) |
| `RULES.md` | **the authoritative capture & framing rules** — workers must obey these |
| `PROCESS.md` | the pipeline / reuse model in depth |
| `out/` | capture scratch (gitignored — regenerates from `specs.mjs` + scripts) |

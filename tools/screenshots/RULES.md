# Capture & framing rules (the print-screen rulebook)

Hard-won rules for capturing Avo v4 docs screenshots programmatically (Playwright +
ImageMagick), light + dark. **Every resolve/verify worker MUST read and obey these** — they
are what make a generated shot look hand-made. Committed; reusable across any docs work.

> Scope note: this rulebook is ONLY about producing a correct image. What happens to it after
> (staging, committing, a branch, a PR) is the user's decision — the pipeline stops once the
> image is captured and the tag rewritten, leaving everything unstaged.

## What it is

Capture Avo UI screenshots with **Playwright** (headless Chromium) and annotate /
frame them with **ImageMagick** — fully automated, reproducible, high-resolution.
No CleanShot, no manual dragging.

- `capture.mjs` — logs in once, drives each spec (goto → interact → screenshot),
  records mark boundingBoxes to a `.boxes.json` sidecar.
- `specs.mjs` — one entry per screenshot (path, viewport, clip, marks, pad, out).
- `annotate.mjs` — draws arrows / highlights / badges from the recorded boxes.
- `record-gif.mjs` — builds GIFs from frame PNGs (see lesson #3).

```bash
export AVO_BASE_URL=http://localhost:3020 AVO_ADMIN_EMAIL=avo@cado.com AVO_ADMIN_PASSWORD=secreto
node capture.mjs [specId ...]      # → out/<id>.png (+ .boxes.json)
node annotate.mjs <specId>         # → out/<id>.annotated.png
node record-gif.mjs                # → out/keep-filters-panel-open.gif

# Dark variants (Avo follows prefers-color-scheme): same commands, AVO_COLOR_SCHEME=dark
AVO_COLOR_SCHEME=dark node capture.mjs <id>        # → out/<id>-dark.png
ANNOTATE_DARK=1     node annotate.mjs <id>          # → out/<id>-dark.annotated.png
AVO_COLOR_SCHEME=dark node record-gif.mjs           # → out/keep-…-dark.gif
```

**Theme-aware images:** every image ships a light + a `-dark` variant. `Image.vue` reads
VitePress `isDark` and swaps `src`↔`dark-src` reactively (instant on theme toggle). In
markdown: `<Image src="…/x.png" dark-src="…/x-dark.png" … />`. Dark = double the captures
+ maintenance, so re-shoot both when a screen changes.

---

## Key setup facts

| Thing | Value |
|-------|-------|
| Capture from | the **demo app** `main.avodemo.com` — NOT `avo/spec/dummy` (see #1) |
| Port / mount | `localhost:3020`, Avo at `/avo` |
| Admin login | `avo@cado.com` / `secreto` |
| Assets land in | `docs/public/assets/img/4_0/<subpath>/<name>` |
| DPR | 2 (retina); display at half the pixel size for crispness (#9) |

---

## Lessons — capture approach

1. **Use the demo app, not the test dummy.** `avo/spec/dummy` resources are bare
   (a User shows only id + email); `main.avodemo.com` matches the docs (gravatars,
   names, cards, descriptions, filters). Pointing at the dummy produced screenshots
   that didn't match the prose.
2. **Programmatic beats CleanShot here.** Playwright captures at 2880px; a CleanShot
   window grab was 1740px (softer on zoom). CleanShot's only edge — padding/shadow
   framing — is reproduced in CSS at full res. Keep CleanShot for one-off manual shots.
3. **Playwright's bundled ffmpeg has no GIF muxer.** Don't record video→gif. Capture
   frame PNGs during the interaction and assemble with `magick -delay -loop -layers Optimize`.
   **Capture GIF frames at retina (DPR 2), same as `capture.mjs` — and NEVER upscale.** A GIF
   `clip` is in CSS px; at DPR 2 the frame PNG is 2× that. The killer mistake is setting the
   output `width` LARGER than the captured CSS-px width (e.g. a 434px-wide popover clip captured
   at DPR 1 = a 434px frame, then resized up to 760px): the enlargement pixelates the chart/table
   into mush. Two safeguards, both in `record-gif.mjs`: capture with `deviceScaleFactor: 2`, and
   resize with the `>` flag (`-resize ${width}x>`) so ImageMagick **only ever shrinks** — a 2×
   frame downscaled to the display width is crisp; an upscaled small frame is not. Pick `width`
   so the GIF displays near its captured CSS width (don't blow it up past it). (2026-06-22: the
   summarizable GIF shipped pixelated because a 434px DPR-1 clip was upscaled to 760px; fixed by
   DPR 2 + downscale-only.)
3a. **To animate a chart/data demo, step a hover across each datapoint.** A GIF of a chart
   (the `summarizable` distribution popover) reads best when it pauses on EACH segment in turn,
   showing that segment's tooltip — `snap(hold)` per datapoint so each holds ~0.9–1.1s. Chart.js
   renders to a `<canvas>`, so the slices are NOT DOM-selectable — you can't `.hover()` them.
   Hover them **geometrically**: read the canvas `boundingBox()`, take the center, and for each
   value move the mouse to a point at the slice's **mid-angle** on the ring
   (`ang = (cumulative + v/2)/total * 2π − π/2` for a pie that starts at top and sweeps
   clockwise; `r ≈ 0.3 × min(w,h)` lands inside the slice). Same idea for other canvas charts —
   compute the on-canvas point, don't look for an element. (summarizable GIF, 2026-06-22.)
4. **Capture real page padding, don't bake a border.** For breathing room, expand the
   clip into the actual page area (asymmetric top/bottom to dodge a table row above or
   the footer below) — a flat ImageMagick border looks stretched/fake. **Left/right
   breathing room must be SYMMETRIC** (≤10px, equal on both sides) — never tight on one
   side with a big empty gap on the other. And **don't crop a panel/table mid-element**:
   a half-cut table reads as "cut off" and its sliced edge looks like a stray border.
   Show the table FULLY (full width + pagination, clipped to the wrapping panel bottom —
   lesson #20) or leave it out; don't slice through it.
5. **Annotations are coordinate-exact.** Drive arrows/highlights from Playwright
   `boundingBox()`, never eyeball. For a highlight on *text*, measure the text extent
   with a DOM `Range` (the element container box is much wider than the text).

## Lessons — demo app techniques (all reversible)

6. **Resource files + controllers hot-reload** in dev → just edit a resource and capture (no
   restart, no revert — see #18). New resource? add `Avo::XController < Avo::ResourcesController`
   (routing is dynamic, controller hot-loads).
7. **Initializer config does NOT hot-reload.** Two options for a global like
   `config.buttons_on_form_footers`: set it in the initializer and restart the overmind `web`
   process, OR set `Avo.configuration.buttons_on_form_footers = true` inside a **reloadable resource
   file's** class body at capture time (no restart).
8. **`?per_page=6` (or 5)** keeps a table short so the full table + pagination fit a
   compact capture. It's a URL param — no config change needed.
9. **Display width = full vs half pixel dims.** `Image.vue` compares `width` to the content
   column (~688px): **width ≥ column** → responsive path, image **fills the content width**
   (ratio preserved, crisp because the source PNG is larger); **width < column** → fixed
   `Npx`, image renders **small + centered**. So:
   - **Fill the content width (the default — match other content):** set `width`/`height` to
     the **FULL pixel dims** (e.g. a 1200×720 capture → `width="1200" height="720"`).
   - **Small/centered:** set them to **HALF** the pixel size (logical/CSS size). Crisp at 2×,
     `margin:auto` centers it.
9a. **Legibility = captured width ÷ column, NOT PNG sharpness.** A `display:"full"` image is
    always shown at the ~688px content column regardless of its pixel size, so apparent
    on-screen text size ≈ `688 ÷ (captured CSS width)`. A full-width index table is ~1125px
    CSS at the default 1440 viewport (measured) → its text renders at ~0.6× — *crisp but too
    small to read*. #9's "crisp because the source is larger" is about **sharpness**, not
    legibility; the two are different. When the shot's value is *reading inline text* (table
    column labels, help strings, field values, a renamed header), keep the **captured CSS width
    ≲ ~900px** so text lands near 1×. The index table is responsive and **tracks the viewport**
    (measured: 1440→1125px, 820→777px), so the primary lever is a **narrower viewport**
    (`viewport: { width: 820–960 }`), combined with fewer columns (see #10a). Reserve full
    ~1400px-wide captures for shots where the *structure*, not the text, is the point.
    **This narrow-viewport lever does NOT apply to floating UI** (filter panels, popovers,
    dropdowns, tippy overlays) — those use #9c instead.
9b. **A single-field FORM-CARD shot must use a NARROW viewport (~720–900), never the default
    1440 — otherwise it ships zoomed-out as a slim letterbox strip.** On a New/Edit form the
    layout is label-left / input-right across the FULL form width, so at viewport 1440 one
    field's card renders ~980px CSS wide × ~100px tall (~9:1). Fit into the 688px column at
    `display:"full"` that scales DOWN to ~0.7× — tiny text, a thin band (the "zoomed-out" look).
    Narrowing the viewport fixes it two ways at once: (1) the card's CSS width drops toward the
    ~688px column so it displays at ~1× ("zoomed in", legible per #9a), and (2) at a narrow
    width Avo **stacks the label above the input**, so the card becomes a natural ~4:1–5:1 shape
    instead of a strip. Target the cropped card's CSS width at **~640–720px** (probe it), keep
    `display:"full"`. This is the form-card counterpart of #10a (which reshapes *tables*); same
    root cause — a focused single-thing shot left at 1440. (2026-06-23: `field-options-help`
    shipped at viewport 1440 → 1960×204 (~9.6:1) slim strip at ~0.7× text; re-shot at viewport
    720 → card ~703px CSS, label stacked above input, 1440×284 (~5:1), displays ~1×.)
9c. **Floating UI (filters, popovers, dropdowns) = real app size at the standard viewport.**
    A filter panel, dynamic-filter card, flatpickr popover, tippy overlay, or similar **floating**
    element must appear in docs at the **same CSS size it has in a full-width browser** — not
    blown up by a narrow viewport or by wiring `display:"full"` on a sub-column-sized crop.
    This matches how the rest of the docs look (dynamic-filters, metric cards, control bars):
    the component is **small and centered** in the column at 1:1, not edge-to-edge and oversized.
    **Workflow:**
    1. **Viewport 1440×900–1100** (sidebar closed per #12) — the standard docs viewport; layout
       matches what users see at 100% screen width.
    2. **Crop** to trigger + open panel/popover (#15a) with ≤10px symmetric pad (#15e/15f) — still
       scope the *frame*, but do not shrink the viewport to enlarge the subject inside it.
    3. **`display: "half"`** in the spec → markdown `width`/`height` = retina PNG dims ÷ 2 = the
       component's real CSS size; `Image.vue` centers it at 1:1 (#15g). Same as dynamic-filters.
    4. **GIFs:** capture at DPR 2 with a probed `clip`, set output `width` to the clip's **CSS
       width** (not an upscaled display width) so the animation also lands at 1:1.
    **Anti-pattern (what made basic-filters look "zoomed in"):** viewport 1200 + tight panel crop
    + `display:"full"` with width ≈ the PNG pixel size but < the content column → the panel fills
    ~90% of the column at ~2× its real app size. Fix: 1440 viewport + `display:"half"`.

## Lessons — editorial rules (from review feedback)

10. **Tables must show pagination** — for table-AS-A-WHOLE shots. Single-column / single-option
    shots scope down instead (see #10a).
10a. **Scope the shot to what the prose references — RESHAPE the component, don't crop a slice.**
    If the surrounding text is about ONE column / field / option (a `name:` label, `placeholder`,
    `help`, `sortable`, a single field's formatter), the image must FOCUS on that one thing — NOT
    a full multi-column table where the reader has to hunt for it across ID / Skills / Country /
    City. Two failure modes a full-table capture causes, from one wrong choice:
    - **Unfocused** — the relevant column is one of six; the subject is lost.
    - **Unreadable** — a ~1125px+ table fit into the 688px column shrinks text to ~0.6× (#9a).
    **Fix both at once by reshaping the real component, not by clipping it:**
    1. Make a **minimal temp resource** that renders only the relevant fields (see #13) — e.g.
       `id`, `name`, and the field in question (renamed to match the code's `name:`).
    2. Set a **small `per_page`** (3–4) so the table is short with a real pager.
    3. Set a **narrower viewport** (#9a, ~820–960px) so columns are tight and text lands near 1×.
    4. Capture the **whole** table card. You get real native edges (true right border, rounded
       corners, real pagination) — a vertical clip through columns risks a sliced mid-table edge
       (#4) and an off look.
    Full-table + pagination (#10) and "show the table FULLY, don't slice" (#4) apply to features
    about the table AS A WHOLE — sorting *interaction*, pagination, index alignment,
    `link_to_record` across a row, row layout. They do NOT mean "always show every column." For a
    single-column/option feature the target is **~3 columns + a few middle rows**. Clip a slice
    only as a fallback when the source genuinely can't be reshaped; then keep edges symmetric and
    clean (#15c). (2026-06-22: `change-field-name` shipped as a 6-column 2824px table — unfocused
    on its "Availability" header and shrunk to ~0.5× text; root cause was treating a rename-one-
    column shot as a table-as-a-whole shot.)
10b. **Every shot lives IN CONTEXT — capture the element inside its real container, never as a
    lone fragment floating on bare mat.** The reader has to recognize *where in the Avo UI* this
    thing lives. A field belongs in its **card**; a column/cell belongs in its **table**; a
    control belongs in its **toolbar/panel**; a triggered overlay belongs over its **trigger**.
    So the DEFAULT for any element shot is: show the element WITH the natural container around it
    (the card border + a neighbor field, the table with a few columns + rows, the panel) so it
    reads as a real screen, not a clipping. Stripping the container — transparent card, hidden
    sibling rows, a single field on empty background — makes the subject look like it's "within
    nothing" and is the main thing reviewers reject. This is the umbrella over the specific cases:
    triggered components → keep the trigger context (15a); per-field form options → the native
    card with a neighbor (15w); per-column/option table shots → reshape to ~3 columns + rows, not
    a slice (10a). **The bare-element-on-mat fragment (15s) is a LAST RESORT** — only when the
    element has no meaningful container OR the container would add pure noise (a lone icon/swatch);
    even then, prefer keeping at least the container's own border. When in doubt, include MORE
    context, not less.
11. **Image goes *after* the code snippet** it illustrates, never before.
12. **Crop sidebar/navbar for focused feature shots** (record_selector, keep_filters,
    mapping, grid). Keep the sidebar only where context matters (Cards — explicit).
    **When you don't need the sidebar, CLOSE it — don't hide it.** Set the
    `avo.sidebar.open=0` cookie + `page.reload()` in `prepare` so the server re-renders
    the page **full-width** (the `--sidebar-offset-size` var collapses and `.main` padding
    reflows). `visibility:hidden`/`display:none` on `.avo-sidebar` only blanks the column
    — the content does NOT reflow, leaving a phantom gap. Closed is the real app state and
    lets tippy popovers/overlays sit in-bounds instead of overflowing into that gap.
    **NEVER "crop out" the sidebar by starting the `clip` at its right edge (x≈256).** That
    leaves the sidebar's 1px divider border on the image's left edge (a stray vertical line).
    Always CLOSE it (cookie + reload) AND drop the divider with `.main-content { border-left:
    0 }`, then crop the now-full-width content. Verify the left edge is clean: the top-left
    pixels should be frame-mat color (#fff / #1b1b1f), not a gray border line. (2026-06-17:
    `tv-table` clipped at x=256 with the sidebar open → visible border; fixed by closing it.)
13. **Match the docs' code example, not the live resource.** mapping-1 used a *minimal*
    temp User resource (id, gravatar, first/last) — the rich demo resource showed too much.
    **Corollary — the image's VISIBLE TEXT must match the adjacent code snippet.** The column
    header / field name must equal the code's `name:` (doc said `name: 'Published'` → the Index
    column must read "Published", not the demo's "Is admin"), and any option labels must equal
    the code's `options` hash (doc `{admin: 'Administrator', manager: 'Manager', writer:
    'Writer'}` → the widget must show exactly those, not Administrator/Editor/Viewer). A text
    mismatch with the neighbouring code is as wrong as a stale UI — rename the temp field /
    options to match the doc before shooting.
14. **Consistent spacing:** v4 image margins = paragraph rhythm (`1rem`); kill stray
    `<br><br>`. Don't let images sit further from text than text sits from text.
15. **Same filename, `4_0/` version folder, PNG** (crisp text; JPG blurs UI screenshots).
15a. **Capture a triggered component in its trigger context — don't isolate it.** When the
    thing you're documenting only exists *as part of* / *triggered by* a larger UI — a
    modal/popover opened from a table row, a dropdown off a button, a panel revealed by a
    control — the shot must show the **whole context**: the surrounding element (the table),
    the component in its open state (the popover), **and** the trigger that opened it (the
    hovered/clicked row, cell, or button) **focused/highlighted**. Isolating just the
    component loses *where it comes from* and *how to invoke it*, which is exactly what the
    reader needs. Example: the record-previews `preview-field` shot frames the Team
    **index table** with the preview popover open and the triggering `preview` link
    focused — not the bare popover on an empty background.
15b. **Prefer the app's NATIVE `:focus-visible` ring over a drawn box to mark the trigger.**
    Avo has a unified focus-ring system (`focus.css`) — a tight 2px ring. To use it: open
    the overlay first (e.g. `.hover()` the trigger for a tippy popover), then `.focus()`
    the trigger element (a focusable `<a>`/`<button>`); both states hold together and the
    real ring renders. No `marks`/annotate, no chunky hand-drawn rectangle. Only fall back
    to a drawn mark when the element has no focus-visible style — and then keep it small and
    ring-like (tight pad), not a big box.
15b′. **MANDATORY — if the subject is ONE small control / icon / indicator, the shot MUST mark
    it. Framing, contrast, or "it's visually distinct" is NOT sufficient.** When the feature is a
    single small element the reader would otherwise have to hunt for — a sort caret in a column
    header, a toggle, a single icon-button, a state badge, the trigger that opens an overlay —
    the image is NOT done until that element is explicitly marked. Required marker, in order:
    1. **Native `:focus-visible` ring (preferred, 15b)** — if the element is focusable (an
       `<a>`/`<button>`, e.g. a sortable column header link), `.focus()` it in `prepare` so Avo's
       real ring frames it. No `marks` needed.
    2. **Drawn highlight (15d, fallback)** — only if the element has no focus-visible style; keep
       it small and ring-like (tight pad), via a `marks` entry, not a big box.
    A reviewer must FAIL a single-control shot that carries no marker, even if the state is
    technically visible. (2026-06-22: the `sortable` shot shipped with the active sort caret
    unmarked — relying on "the caret differs from ID's neutral chevron + rows are sorted" — which
    is exactly the insufficient-emphasis this rule forbids; fix = `.focus()` the sortable header
    `<a>` for the native ring.)
15c. **Crop tight to where the context actually is — no large empty regions.** A feature that
    occupies only one part of the screen (e.g. the scopes tab bar lives in the left ~300px)
    must NOT be shown at full table width with empty space on the right. Narrow the `clip` so
    the image covers only the relevant area (title → feature → a little surrounding context);
    a clean right edge mid-table is fine for a focused crop. The user explicitly wants
    compact, scan-at-a-glance screenshots.
15d. **Highlighting a GROUP of elements: drawn blue box, sized via the `box` coord mark.**
    When the thing to mark isn't a single focusable element (so 15b's native ring can't
    apply) and has no single narrow wrapper — e.g. the four scope tabs, whose only common
    ancestor `.tabs` is deceptively full content-width — use the drawn `highlight` mark
    (`#ef4444`). Do NOT point it at the full-width container (the box becomes a wide thin bar
    across empty space). Instead use the harness's coordinate mark
    `marks: [{ box: { x, y, width, height }, type: "highlight" }]` (viewport CSS-px; probe the
    union rect of the first→last item) so the box hugs exactly the group, full edges inside
    the crop. `capture.mjs` records a `box` mark straight to the `.boxes.json` sidecar;
    annotate adds its usual ~12px pad.
15d′. **A drawn highlight must mimic the native focus ring, not a chunky box — use
    `style: "focus"`.** Whenever you fall back to a drawn `highlight` mark (per 15b/15b′ for a
    non-focusable element, or 15d for a group), add `style: "focus"` to the mark. annotate then
    renders a thin 2px stroke in `#f87171` (red-400) with a tight ~2px pad and 3px radius — so
    the drawn mark reads like a crisp callout, not a fat hand-drawn rectangle. The legacy chunky
    box (`#ef4444`, red-500,
    6px pad, 8px radius) is the default only for backward compatibility; new shots should always
    pass `style: "focus"`. Per-mark overrides exist if needed (`pad`, `stroke`, `radius`, `color`,
    unscaled px). The mark's `selector`/`box` must hug the target TEXT tightly — annotate pads
    from the recorded box, so a loose box floats the ring off the text (2026-06-23: the
    `change-field-name` header ring first shipped as a chunky box, then floating high above the
    word; fix = `style: "focus"` + a selector resolving to the header's inner text element).

## Lessons — UI-strip framing (control bars, toolbars, popovers, rows)

> The rules below grew out of reshooting the customizable-controls page (control bars,
> the view switcher, the row-controls strip, the `list` dropdown). Goal: every small UI
> strip reads like "the real thing at 100%" — centered, even mat, consistent size.

15e. **Frame by element + symmetric pad, not an eyeballed `clip`.** Use
    `selector: "<strip>", pad: { x: 10, y: 10 }` — the engine reads the live
    `boundingBox()` and pads equally, so the content is centered with an even mat every
    time. An eyeballed `clip` is a guess in absolute px; the element is shorter than the
    clip and the leftover space lands unevenly (the classic "more space below than above").
    When there's no stable selector, derive the clip from a **probed/measured bbox + equal
    pad** (`{ x: bx-10, y: by-10, width: bw+20, height: bh+20 }`) — never freehand y/height.

15f. **Capture pad = MAX 10px, symmetric.** Hard ceiling. A loose pad makes a strip float
    in whitespace AND makes strips of different content heights end up at different total
    heights (they look mismatched). Override any loose factory default (the `ccHeader`
    factory was 28/22 → fixed to 10).

15g. **Display UI strips at 1:1 — half the DPR-2 PNG dims, even when wider than the column.**
    A 1376×156 control bar is wired `width=688 height=78`; a 642×104 bar → `321×52`. Do NOT
    display a control bar at full pixel width: two bars of different widths (show=1376px,
    edit=1192px) each shown full-width get scaled to the column by *different* factors
    (50% vs 58%), so their buttons look like different sizes. 1:1 makes buttons identical
    real size; the bars may differ in total width, which is correct (they differ in the app).
    Different-width strips at 1:1 are CORRECT — don't pad them to a common width to "look
    uniform" (dead whitespace, breaks the ≤10px rule). Before "fixing" a reported size
    mismatch, **measure** a shared element in both
    (`magick a.png -fuzz 18% -transparent 'rgb(r,g,b)' -alpha extract -threshold 1 -trim info:`)
    — if identical, it's a relative-width illusion; leave it.
    **Also applies to floating UI** (filter panels, popovers, flatpickr) — see #9c; dynamic-filters
    is the reference implementation.

15h. **Measure with in-capture `marks`, not a standalone probe.** A separate probe can be in
    a different layout state than `capture.mjs` (sidebar open vs closed shifts right-aligned
    controls ~50px), giving silently-wrong coords. Add `marks: [{ selector, type:
    "highlight" }]`, run capture, read the `.boxes.json` sidecar — measured during the real
    capture. Convert: `CSS = clipOrigin + markPx / DPR`.

15i. **Cropping a single table row — never the first/last row.** Those carry the table's
    outer border / rounded corner → mismatched edge on a tight crop. Target a middle row by
    index (`table tbody tr:nth-child(3)`; hover the same row for on-hover controls).

15i′. **GENERAL RULE — a partial crop of any bordered/separated component must read as
    symmetric and intentional, never sliced.** 15i is the table-specific case of a broader
    rule: it applies to **cards, lists, field-row stacks, control bars, panels — anything
    whose parts are divided by borders/separators or wrapped in an outer border with rounded
    corners.** Whenever a screenshot captures only a *small slice* of a larger component:
    - **Don't cut through a separator or the outer/rounded border** so its sliced edge reads
      as a stray line. Either include the divider cleanly on BOTH sides (so it looks like a
      deliberate row/cell) or stay fully inside one cell.
    - **Pick a middle element, not the first or last** (first/last carry the rounded
      corner / outer edge) — true for table rows, card grids, list items, stacked field rows.
    - **The slice must look symmetric and nice:** equal mat on all sides (the ≤10px pad of
      15e/15f), the content centered, no dead space on one side (15c). A lone fragment of a
      bigger component should look like "a clean piece at 100%," not "torn off the edge."

15j. **Popover/dropdown over busy content — hide what's underneath.** When a dropdown/menu/
    popover opens over a table, its bottom collides with the content below (header peeking
    out, no room for a bottom mat). In `prepare`, inject CSS to hide it —
    `page.addStyleTag({ content: "table, .empty-state { visibility: hidden !important; }" })`
    (same idea as `hideKbd`) — so the floating element sits on blank page and gets an even
    mat all around. **`visibility:hidden` (not `display:none`) when you must KEEP a container's
    border/layout** — e.g. capturing a full card with an open popover: blanking the sibling
    field rows clears their values (which would otherwise peek past the popover edges, 15j)
    while the card keeps its borders and the rows keep their height (so the popover still
    opens where it did).

15j′. **But when the overlay is ABOUT the content beneath it, keep that content LIVE and
    visible — don't blank it.** 15j's hide-underneath is only for *incidental* clutter the
    floating element happens to cover. When the popover/overlay summarizes, derives from, or
    points at the content below — e.g. the `summarizable` distribution popover, which charts the
    very column it opens over — that underlying content IS the context (RULES 15a), and hiding it
    guts the shot. Show the **real table with its rows visible** as the background and let the
    popover open over it; frame the whole table + the open overlay together. Ask "is the stuff
    underneath the subject's context, or just stuff in the way?" — context stays, clutter gets
    `visibility:hidden`. (2026-06-22: the summarizable GIF was first shot with the table hidden /
    card transparent → a popover floating on bare mat; corrected to the live table behind it.)

## Lessons — grids, dark mode, demo CSS, image placement

> From reshooting the grid-view card images (hero, custom-html, badges).

15k. **Every card/tile in a grid shot must be FULLY visible — never a partially-cut last one.**
    If a card is clipped, fix the framing; don't ship a half-card.

15l. **Control the grid column count via the viewport width so N items fill exactly.** A
    responsive card grid changes columns with width — full-width (vw 1440, sidebar closed)
    gave 6 columns, so 4 products left a cut 4th card + empty columns. Probe the column count
    at several widths and pick the one where the items fill complete rows (products → `vw=1100`
    = 4 columns = 4 cards, wider and exact). Beats cropping around empty space or a cut card.
    Probe: find the `display:grid` element with the most `gridTemplateColumns` entries.

15m. **Doc code examples must be dark-mode aware.** If an example uses light-only Tailwind
    (`bg-blue-50`, `bg-gray-50`), add the `dark:` variant (`dark:bg-blue-900`,
    `dark:bg-gray-800`) so the *documented code itself* stays legible in dark mode — and the
    screenshot must prove text is readable in BOTH light and dark.

15n. **The demo's Tailwind purges utility classes it doesn't already use elsewhere.**
    `blur-sm`, `dark:bg-blue-900`, `border-red-500`, etc. silently don't render. For the shot,
    reproduce the look via inline `style` or injected CSS (e.g. `@media (prefers-color-scheme:
    dark) { .bg-blue-50 { background:#1e3a8a !important } }`); the DOC keeps the canonical
    class names (which compile in a real app). ALWAYS verify the class actually rendered —
    don't assume (view the capture / check computed style).

15o. **Place an image directly under the section/heading it illustrates.** The view-switcher
    image was dangling at the end of `## Options`; it belongs under `## Enable grid view`,
    whose prose references the view switcher. The image goes with the text that explains it.

15p. **When a doc highlights a specific control, focus it for the native ring (see 15b).** The
    view-switcher shot `.focus()`es the grid-view toggle so its `:focus-visible` ring marks
    WHICH control does the thing. Prefer the ring over a tooltip when the tooltip would fall
    outside a tight crop.

## Lessons — placeholders, matching code, compact bordered widgets

> From wiring the boolean / boolean_group field pages: an in-page placeholder tag, an
> image-vs-code mismatch, and several "cut-off card" iterations before landing on a compact
> bordered widget.

15q. **Honor in-page `<Image>` placeholders — they are TODOs.** A page may carry placeholder
    tags with no `src`: `<Image prompt="add a print screen here"/>` (the attribute is sometimes
    misspelt `promp`). Each marks WHERE a shot goes and WHAT it should show. When working a page,
    grep `<Image` and treat any tag carrying a `prompt`/`promp` attr (or missing `src`) as work:
    read the prompt, capture per it + the framing rules, then replace it with a full
    `<Image src dark-src width height alt>`. Never ship a page with a placeholder left in.

15q′. **READ THE PROMPT AND OBEY WHAT IT SAYS — the placeholder's wording is authoritative and
    OVERRIDES framing defaults.** Before composing a spec, parse the prompt for explicit intent and
    let it win over any "prefer X" lesson below. In particular the prompt may NAME A VIEW —
    "**show** page", "**edit**/new form", "**index** table" — or a layout, state, or specific field;
    when it does, capture THAT exact view/state, full stop. Do not "upgrade" to a different view
    because a framing lesson says it's more complete (e.g. 15y's "prefer the Form view for
    inline/stacked layout"): that preference applies ONLY when the prompt is silent on the view.
    Also weigh the surrounding section + the SIBLING images: a matched pair (e.g. an `inline` shot
    next to a `stacked` shot) must use the SAME view so the reader compares like-for-like — if the
    sibling is a Show shot, yours is too. (Real bug: prompt said "show page key_value field … inline
    layout"; the worker shot the Form view per 15y, contradicting both the explicit "show page" and
    its Show-view `stacked` sibling. Reshot on Show.) Order of authority: explicit prompt wording →
    section context + sibling consistency → generic framing defaults.

15r. **A PARTIAL border reads as "cut off" — go fully-around OR fully-inside, never partway.**
    Framing a slice of a bordered component (card/panel/table) so SOME of its outer border shows
    while the rest is cut looks broken. (Real bug: a clip at x=364 while the card border sat at
    x=369 caught the left/top/bottom border but cut the right → a "cut-off card.") Pick one,
    against the PROBED border coords:
    - **Full component** — include all four of its borders (the complete card/table), or
    - **No component border** — crop strictly INSIDE it (every clip edge falls between content
      and border) so no border shows at all.
    Landing partway (some edges in, some cut) is exactly what gets flagged as "still cut off."

15r′. **Judge border-completeness on the DARK variant — light mode hides a sliced card.** A
    component's own card/panel/control border is usually near-white (`border-gray-200`), so on the
    LIGHT PNG it's white-on-white against the mat and effectively invisible — a clip that slices the
    card's TOP (or any) edge looks perfectly clean in light and reveals the cut only in DARK, where
    the border contrasts. (Real bug: the `key_value` field shots cut the control card's top border;
    the light PNG measured a tidy ~10px mat on all four sides and "passed", while the dark PNG plainly
    showed the header row flush to the top edge with no top border or rounded corners.) So whenever
    you check 15r/15u ("is any border sliced / is every edge mat?"), the DARK image is
    AUTHORITATIVE: open it, and sample all four edges THERE, not on light. A light-only review is not
    a review. This is the inverse of 15u's stray-hairline case — a stray border screams on dark, a
    missing border hides on white; both are findings you can only make in dark.

15s. **Let the docs frame BE the border.** (LAST RESORT — default to showing the real container,
    10b; use this only for a genuine single-control fragment with no meaningful container.)
    `custom.css` already draws a border + shadow + mat
    around every `/4_0/` image. So a compact "bordered widget" around one field/group does NOT
    need the app's own card border — crop tight to the content on plain background and the docs
    frame supplies the surrounding border (the clean 15r "no component border" path). Capture to
    exact bounds (no surrounding page bg) to avoid the grey-ring mismatch of lesson 19.

15t. **A full-width container can't hug one field — shoot the view where the widget is self-
    contained.** The Avo Show card is always full content-width, so its border can't wrap a
    single field (you'd get a wide, mostly-empty card). For a compact bordered illustration of
    one field, prefer the view where it renders as a content-sized widget — e.g. `boolean_group`
    as labeled checkboxes on the FORM view, instead of a "View" popover floating in the
    full-width Show card — and/or apply 15s. Choose the view that frames cleanly, not just the
    first one that happens to show the feature.

15u. **Element/`selector` captures silently bake in the wrapper's OWN edge border — neutralize
    it, then PROVE the edges are clean.** An element capture (a `selector` with no border
    handling, or a `clip` flush to a wrapper) grabs whatever 1px structural border the wrapper
    carries on its edges — `.card`, `.card__body`, `.field-wrapper`, `.description-list` — so a
    faint gray hairline rides one side of the image, and the docs frame (lesson 16) then doubles
    it into a visible line. Before any such capture, transparent-out the STRUCTURAL borders
    (`.card:not(.relative), .card__body, .field-wrapper, .description-list { border-color:
    transparent !important }`, `:not(.relative)` so the overlay card doesn't sheet over the
    content) so only the MEANINGFUL inner control border survives — the editor box, the input,
    the popover. This is not optional polish: **a screenshot is not done until you have sampled
    its outermost 1–2px on ALL FOUR edges and confirmed they read as mat, not a uniform line** —
    `magick x.png -crop 2xH+0+0 +repage -format 'min:%[min] mean:%[mean]\n' info:` (and the other
    three edges); a column where `min≈mean` at a non-mat grey is a stray border. Check light AND
    dark (a hairline invisible on white screams on dark).

15v. **Never slice a control box (input / select / editor / picker) — show it whole, or show
    none of that side's border.** A form control wider than the area you're framing (e.g. a
    full-content-width date/text input sitting above a narrower dropdown) gets its far edge cut
    by the clip, so the box runs off the frame and reads as broken — the same defect as a half-cut
    card (15r), applied to a control. Either include ALL of the control's borders, or frame so
    none of that side's border is in shot. When a TRIGGER control is wider than the dropdown it
    opens, ALIGN them for the capture: constrain the control to ≈ the dropdown's width with CSS in
    `prepare` so trigger + dropdown read as one coherent, fully-contained unit (this is what makes
    the date-picker shot look like the legacy one). Three borders shown + one cut is always wrong.

15w. **Produce the state with Avo's real DSL — don't hand-fake the look with injected CSS or
    fabricated classes.** When a shot needs a field option (`disabled:`, `readonly:`, `stacked:`,
    `link_to_record:`, multiple `key_value` pairs, etc.), set that option on a REAL field via the
    DSL and let Avo render it natively. Do NOT reach for `injectCSS` to strip the card border,
    `neutralizeBorders` + `visibility:hidden` to hide sibling rows, or hand-built CSS that
    simulates the component — that produces a borderless fragment floating on mat that reads as
    "cut off" and doesn't match what a real user sees. Instead **show the native form card WITH
    its real border and the real separator between fields** (the docs frame, lesson 16, sits
    OUTSIDE that card — both borders are fine and read as intentional). The A/B contrast pair
    (a `readonly`/`disabled` field above a normal one) belongs in the SAME real card so its
    native divider separates them. Reserve border-stripping for the genuinely single-control
    fragment cases (15s/15t) — not for multi-row form shots, where the native card IS the frame.
    Corollary for `key_value`/data-display widgets: populate **2–3 real pairs/rows** of data so
    the control reads as a realistic example, not an empty stub.

15x. **On Show / Form (New/Edit) card shots, the fields must FILL the card — no half-empty rows.**
    Avo lays fields out on a grid; a field left at its default width occupies only the LEFT half of
    its row, leaving an empty right half that reads as a broken/unbalanced card (e.g. a "First name"
    or "Is writer" row with dead space to its right). Before capturing, set each demoed field's
    `width` (via the DSL — RULES 15w) so every row is full across the card:
    - **1 field on a row → `width: 100`** (the default full row) so it spans the whole card.
    - **2 fields meant to share a row →** choose by the values' LENGTH:
      - short values → **`width: 50` each**, sitting side by side and filling the row;
      - long value(s) → keep them **`width: 100`** (each on its own full-width row, stacked) rather
        than cramming a long value into a half column.
    The goal is a card with no ragged empty halves — every row either one full-width field or two
    balanced halves. (Note: any `width` below 100 auto-stacks the label above the value; see the
    `width` field-option docs. This is composition for the screenshot, matching how a well-configured
    real resource looks — pair it with 15w's "use the real DSL.")

15y. **Show the WHOLE component, with all its controls — not a read-only or collapsed rendering
    that hides parts of it.** An interactive field/component looks different (and more complete) on
    the FORM (New/Edit) view than on Show: Show often renders a stripped, read-only projection that
    omits the component's own affordances. Pick the view/state where the component is rendered in
    FULL. (Real bug: the `key_value` shots were taken on Show, so they showed only the data table and
    DROPPED the component's `+` add-row button in the header, and each row's drag handle + delete
    (trash) button — the reader can't see how to add/remove/reorder pairs. The Form view shows all of
    them.) Decide per shot: if the documented behavior is identical across views (e.g. field-wrapper
    `inline`/`stacked` LAYOUT shows label-beside vs label-above on BOTH Show and Form), prefer the
    Form view so the component is also shown complete — strictly more informative at no cost. Only
    stay on Show when the doc is specifically about the read-only display. **This "prefer Form"
    default is overridden by 15q′: if the prompt explicitly names a view ("show page") or the
    matched sibling image uses a particular view, honor that — the prompt wins over this preference.** Ask before capturing: "are
    any of this component's real controls missing from this view?" — if yes, you're shooting a
    fragment, not the component. Pairs with 10b (real container) and 15t (shoot the view where the
    widget frames cleanly).

15z. **For a single field/component shot, give it its OWN card — wrap it in a dedicated `panel do
    card do … end end` via the DSL — instead of cropping it out of the big panel and faking the
    border.** This is now the PREFERRED path for any single-field/component image, on EITHER the
    Show or the Form (New/Edit) view (pick the view per 15y). Avo's default resource panel is
    full content-width, so a `selector`/`clip` on one field grabs a slice of that wide panel — you
    then have to neutralize the wrapper hairline (15u) and let the docs frame stand in for the
    border (15s), which produces a borderless fragment floating on mat that reads as "cut off."
    Wrapping the demoed field in its OWN `panel`/`card` makes Avo render a real, content-sized card
    that genuinely HUGS just that field — so the capture is a complete card with true borders and
    rounded corners on all four sides, no neutralizing, no bare-mat fragment. Capture the card
    element itself (probe its selector live) with a symmetric pad; the docs frame (lesson 16) sits
    OUTSIDE it and both borders read as intentional. This SUPERSEDES the single-field workarounds:
    it resolves 15t ("a full-width card can't hug one field" — now you make a card that does),
    and demotes 15s/15u to legacy fallbacks for shots where you genuinely cannot author a card
    (e.g. a non-resource overlay). Combine with 15y: on the Form view the field also renders its
    full controls, so a dedicated Form-view card is the most complete single-field shot. (Origin:
    the `key_value` `inline`/`stacked` layout shots were cropped out of the Project Show panel with
    neutralized borders; reshot as a dedicated `panel`/`card` on the Form view so the whole
    key_value component sits in a real, content-sized card.) Example temp edit:
    ```ruby
    panel do
      card do
        field :meta, as: :key_value, stacked: true do
          { "environment" => "production", "region" => "eu-west", "tier" => "premium" }
        end
      end
    end
    ```

## Lessons — framing (CSS) & hygiene

16. **Framing lives in CSS, scoped to v4** (`docs/.vitepress/theme/custom.css`,
    `.aspect-ratio-box:has(img[src*="/4_0/"])`): hairline border / soft shadow / p-3 mat.
    Site-wide consistency, theme-aware, zero file bloat. **Never touch v3** — scope by
    the `/4_0/` image path.
17. **Apply changes into the docs immediately** — copy to `4_0/` + update `<Image>`
    dims; don't leave results in `out/`.
17a. **REDO of an already-shipped image: `apply.mjs` won't fire — apply by hand.** `apply.mjs`
    only matches a *placeholder* tag (one with NO `src`) by its `prompt`. It throws on anything
    already resolved — a tag that already has a `src`, a tag with no `prompt` attribute, or one
    pointing at a `.gif`. So for a re-shoot: copy `out/<id>.png` + `out/<id>-dark.png` over the
    existing `4_0/…` assets yourself, then edit the EXISTING `<Image>` tag in place — update
    `width`/`height` to the new PNG dims (read them: `node -e '…readUInt32BE(16/20)'` or
    `magick identify`) and fix the `alt` if the shot changed. Leave the tag's `src`/`dark-src`
    as-is (the asset paths didn't move). Everything stays unstaged.
17b. **GIFs are first-class, but PNG-only tooling — wire them manually.** A shot may need to be a
    `.gif` (an animation, e.g. `summarizable`). Ship BOTH a light `x.gif` and a dark `x-dark.gif`
    (`record-gif.mjs` honours `AVO_COLOR_SCHEME=dark`) and wire them into the same
    `<Image src="…/x.gif" dark-src="…/x-dark.gif" width height alt prompt>` — `Image.vue` swaps
    src↔dark-src on theme exactly as for PNGs, and the `/4_0/` frame CSS targets the path so a GIF
    is framed like any image. `apply.mjs` is PNG-only and will NOT handle a GIF — copy the two
    `.gif`s into `4_0/…` and edit the tag by hand (17a). Converting a static PNG to a GIF orphans
    the old `x.png`/`x-dark.png` — flag them for the user to delete.
18. **Don't track the demo — move fast.** `main.avodemo.com` is disposable scratch space for
    capturing shots: edit whatever you need (resources, controllers, models, initializer, seeds),
    reuse whatever already fits, and create from scratch when nothing does. You do NOT need to
    preserve or restore its state — no `git status` pre-check, no off-limits files, no reverting.
    Do what the shot needs and leave the demo as-is. (Demo only — never commit/push there, and
    never touch the docs repo beyond the intended doc + asset changes.) Initializer edits need an
    overmind `web` restart; resource/controller files hot-reload.
19. **When you isolate an element on a "clean" background, match the capture bg to the
    docs frame — don't expose the app's `<body>` colour.** To shoot just a fragment
    (e.g. the developer backtrace overlay) you hide the page (`body * { visibility:
    hidden }`) and let only the fragment show. What then shows through is the app's
    **`<body>` colour**, NOT the white you see in-app — that white is a content *panel*
    sitting on top of the body. Avo's body is `#fafafa` (near-white grey). The docs
    `/4_0/` frame mat (lesson #16) is `#fff` (light) / `#1b1b1f` (dark). The mismatch
    renders as a **grey box inside the white frame** — barely visible in light (250 vs
    255), obvious in dark (`#282828` vs `#1b1b1f`). Fix: force the captured page bg to
    the exact docs colours in `prepare`, so the fragment blends seamlessly into the mat:
    ```js
    html, body { background: #ffffff !important; }
    @media (prefers-color-scheme: dark) { html, body { background: #1b1b1f !important; } }
    ```
    Verify by sampling a bg pixel of the PNG — it must equal the frame's `--vp-c-bg`
    (`srgb(255,255,255)` light / `srgb(27,27,31)` dark), not `srgb(250,250,250)`.
19a. **Full-width captures expose `.main-content`, not `<body>` — force THAT element.** When
    the sidebar is closed (lesson 12) the content area goes full-width and the margins at
    the frame edge are painted by Avo's `main#main-content`, which in **dark** is `#171717`
    (oklch 0.2046) — a touch darker than `body` (`#1b1b1f`). Forcing only `html, body` leaves
    a ~4-level dark mismatch. Walk the element stack at an edge pixel (`elementFromPoint` +
    `getComputedStyle`) to find the real painter, then include it in the bg force:
    ```js
    html, body, .main-content { background: #ffffff !important; }
    @media (prefers-color-scheme: dark) { html, body, .main-content { background: #1b1b1f !important; } }
    ```
    Also drop `.main-content`'s 1px `border-left` — it's a divider against the (now-closed)
    sidebar and otherwise shows as a thin grey line at the left edge: `.main-content { border-left: 0 !important; }`.
    Verify ALL FOUR edges sample to the mat, not just one.
20. **Clip to the PANEL's bottom, not the inner element's.** A table's pagination element
    (`[data-controller~="pagy"]`) ends well above the `.card` panel that wraps it — clipping
    to the pagination box cuts the panel's bottom border/padding (a stray grey strip at the
    image's bottom edge). Walk up to the wrapping panel (`.card`/`turbo-frame`), take ITS
    bottom, and add the breathing room below that. Same idea as lesson 4, one container up.

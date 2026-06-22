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

6. **Resource files + controllers hot-reload** in dev → temp-edit a resource, capture,
   `git checkout` to revert. New resource? add `Avo::XController < Avo::ResourcesController`
   (routing is dynamic, controller hot-loads) — no server restart.
7. **Initializer config does NOT hot-reload.** For a global like
   `config.buttons_on_form_footers`, set `Avo.configuration.buttons_on_form_footers = true`
   inside a **reloadable resource file's** class body at capture time, then revert.
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

## Lessons — editorial rules (from review feedback)

10. **Tables must show pagination.**
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
    (`#2563eb`). Do NOT point it at the full-width container (the box becomes a wide thin bar
    across empty space). Instead use the harness's coordinate mark
    `marks: [{ box: { x, y, width, height }, type: "highlight" }]` (viewport CSS-px; probe the
    union rect of the first→last item) so the box hugs exactly the group, full edges inside
    the crop. `capture.mjs` records a `box` mark straight to the `.boxes.json` sidecar;
    annotate adds its usual ~12px pad.

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

15r. **A PARTIAL border reads as "cut off" — go fully-around OR fully-inside, never partway.**
    Framing a slice of a bordered component (card/panel/table) so SOME of its outer border shows
    while the rest is cut looks broken. (Real bug: a clip at x=364 while the card border sat at
    x=369 caught the left/top/bottom border but cut the right → a "cut-off card.") Pick one,
    against the PROBED border coords:
    - **Full component** — include all four of its borders (the complete card/table), or
    - **No component border** — crop strictly INSIDE it (every clip edge falls between content
      and border) so no border shows at all.
    Landing partway (some edges in, some cut) is exactly what gets flagged as "still cut off."

15s. **Let the docs frame BE the border.** `custom.css` already draws a border + shadow + mat
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

## Lessons — framing (CSS) & hygiene

16. **Framing lives in CSS, scoped to v4** (`docs/.vitepress/theme/custom.css`,
    `.aspect-ratio-box:has(img[src*="/4_0/"])`): hairline border / soft shadow / p-3 mat.
    Site-wide consistency, theme-aware, zero file bloat. **Never touch v3** — scope by
    the `/4_0/` image path.
17. **Apply changes into the docs immediately** — copy to `4_0/` + update `<Image>`
    dims; don't leave results in `out/`.
18. **Leave the repo clean.** Revert every temp edit (`git checkout` tracked,
    `git clean -f <path>` untracked). Never revert the user's own uncommitted changes
    (whatever they already had modified).
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

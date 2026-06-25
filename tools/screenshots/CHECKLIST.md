# Screenshot checklist (compact)

The fast-path rulebook. Workers read THIS by default. Every line is a hard rule distilled
from `RULES.md`; the `#refs` point to the full lesson — **open `RULES.md` and read the full
lesson ONLY when a shot is unusual or a `#ref` line below doesn't fully answer your case.**
Obeying this checklist = obeying the rules for the common case. Do not skip a line because
it seems minor; each one is a defect a reviewer will fail.

## Setup (always)
- Capture from the **demo app** `localhost:3020/avo`, login `avo@cado.com` / `secreto` — NOT the test dummy. `#1`
- Capture **light AND dark** for every image (`AVO_COLOR_SCHEME=dark`). Re-shoot both when a screen changes. `#header,18`
- DPR 2 (retina). Assets land in `docs/public/assets/img/4_0/<page>/<name>.png`. `#setup`
- Demo is disposable scratch — edit any resource/controller/model/initializer/seed, no revert, no `git status`. Resource/controller hot-reload; **initializer needs an overmind `web` restart**. `#6,7,18`

## What to shoot
- **Obey the placeholder prompt first** — if it names a VIEW (show/edit/index), a state, or a field, shoot exactly that. Prompt wording overrides every framing default below. `#15q′`
- Match a **sibling image's view** (an `inline` shot next to a `stacked` shot use the same view). `#15q′`
- **Visible text must match the adjacent code snippet** — column header = code's `name:`, option labels = code's `options` hash. Rename the temp field/options to match before shooting. `#13`
- Build a **minimal temp resource** rendering only the relevant fields rather than the rich demo resource. `#13`
- When no view is specified: default to the **Form (New/Edit) view** for interactive fields (shows all controls); default to **Show** for read-only/display features. `#15y,screenshot-view-default-show`

## Context — never a bare fragment
- Show the element **inside its real container** (field→card, cell→table, control→toolbar, overlay→trigger). A lone element on bare mat is the #1 rejection. `#10b`
- **Triggered component** (modal/popover/dropdown): show the surrounding element + the open component + the **highlighted trigger** (the row/cell/button that opened it). `#15a`
- Show the **WHOLE component with all controls** (add/delete/drag/`+`) — not a read-only Show projection that drops them. `#15y`
- Bare-element-on-mat is a **LAST RESORT** (single icon/swatch with no meaningful container). `#10b,15s`

## Single-field / single-component shots
- **Preferred:** wrap the field in its OWN `panel do card do … end end` via the DSL and shoot that real, content-sized card (true borders all four sides). Supersedes crop-and-neutralize. `#15z`
- Produce states with **Avo's real DSL** (`disabled:`, `stacked:`, etc.) — never fake the look with injected CSS or fabricated classes. `#15w`
- Populate **2–3 real rows/pairs** of data (key_value etc.) so it reads as a real example. `#15w`
- On Show/Form cards, **fields must fill the card** — set `width:` so no row has a dead empty half (1 field→`width:100`; two short→`width:50` each; long values→stack at `100`). `#15x`
- A single-FIELD FORM-CARD shot uses a **narrow viewport ~720–900** so it displays ~1× and the label stacks above the input (not a 9:1 slim strip). `#9b`

## Framing & sizing
- Frame by **`selector` + symmetric `pad: {x:10,y:10}`** (engine reads the live bbox), or a **probed bbox + equal pad** — never an eyeballed clip. `#15e`
- **Pad ≤ 10px, symmetric** on all sides — hard ceiling. `#15f,4`
- **Never slice a bordered component** (card/table/control/input/select/editor). Go **fully-around** (all four borders) OR **fully-inside** (crop between content and border, no border shows) — never partway. `#15r,15v`
- Crop a single table row from a **middle row** (`tr:nth-child(3)`), never first/last (they carry the rounded outer corner). Applies to cards/lists/field-rows too. `#15i,15i′`
- **Crop tight** to the meaningful context — no large empty regions; a clean mid-component right edge is fine for a focused crop. `#15c`
- **Close the sidebar** for focused shots (`avo.sidebar.open=0` cookie + `page.reload()` so content reflows full-width) and drop `.main-content` `border-left`. NEVER clip at the sidebar edge (x≈256) — leaves a stray divider line. `#12`
- **Floating UI** (filters/popovers/dropdowns/flatpickr): viewport 1440, crop to trigger+panel, `display:"half"` so it shows at real CSS size (small+centered, 1:1). Do NOT enlarge via narrow viewport. `#9c,15g`
- **Inline-text shots** (table column labels, help, field values): keep captured CSS width ≲ ~900px (narrower viewport ~820–960 + fewer columns) so text lands near 1×. `#9a,10a`
- **Tables as a whole:** show full width + pagination (`?per_page=6`), clip to the wrapping **panel** bottom (`.card`), not the inner pagination element. `#10,8,20`
- **Single-column/option table shot:** RESHAPE — minimal resource, ~3 columns, small `per_page`, narrow viewport. Don't crop a slice out of a 6-column table. `#10a`
- **Grids:** every tile fully visible; control column count via viewport width so N items fill complete rows (probe column count at several widths). `#15k,15l`
- **Popover over busy content:** `visibility:hidden` the incidental clutter underneath so the overlay gets even mat — BUT keep it live/visible when the overlay is ABOUT that content. `#15j,15j′`

## Display width (`display:` in spec)
- `display:"full"` → markdown `width`/`height` = **full PNG pixel dims**; image fills the ~688px content column. Use for structure-is-the-point shots. `#9`
- `display:"half"` → dims = **half** the PNG (real CSS size); image small + centered. Use for floating UI and focused widgets. `#9,9c`

## Marking a single small control
- If the subject is ONE small control/icon/indicator, you **MUST mark it** — framing alone fails review. `#15b′`
- Prefer the app's **native `:focus-visible` ring**: open the overlay, then `.focus()` the focusable trigger. `#15b,15p`
- Fallback **drawn highlight** only if no focus style: `marks:[{selector|box, type:"highlight", style:"focus"}]` (thin 2px ring), hug the target text tightly. For a GROUP use a probed `box` union rect, not the full-width container. `#15d,15d′`

## Border hygiene (verify before done)
- Element/`selector` captures bake in the wrapper's own hairline — neutralize structural borders (`.card:not(.relative), .card__body, .field-wrapper, .description-list { border-color: transparent }`) so only the meaningful inner border survives. `#15u`
- **Sample all four outer edges** of the PNG and confirm they read as **mat** (`#fff` light / `#1b1b1f` dark), not a uniform grey line. `magick x.png -crop 2xH+0+0 +repage -format 'min:%[min] mean:%[mean]\n' info:` `#15u`
- **Judge border-completeness / sliced-edge on the DARK PNG** — a near-white card border is invisible on white, so a cut edge only shows in dark. Dark is authoritative. `#15r′`
- Isolated-fragment captures: force page bg to the docs mat (`html,body,.main-content { background:#fff }` / `#1b1b1f` dark) so it blends into the frame — don't expose Avo's `#fafafa` body / `#171717` main-content. Verify a bg pixel. `#19,19a`

## Editorial / placement
- Image goes **directly after the code snippet** it illustrates, **under the heading** whose prose references it. `#11,15o`
- PNG (not JPG); same filename in the `4_0/` folder. `#15`
- Doc code examples must be **dark-mode aware** (`dark:` variants) so the documented code stays legible in dark. `#15m`
- The demo's Tailwind **purges unused utility classes** — reproduce the look via inline style / injected CSS for the shot; keep canonical class names in the doc. Verify the class actually rendered. `#15n`

## Apply
- `node apply.mjs <id>` copies the PNG pair + rewrites the placeholder tag (unstaged). Matches on the EXACT prompt. `#17`
- **Re-shoot of an already-shipped image:** `apply.mjs` won't fire (no placeholder) — copy `out/<id>.png` + `-dark.png` over the existing assets by hand and update the existing `<Image>` `width`/`height`/`alt`. `#17a`
- **GIFs** are manual (PNG-only tooling): ship `x.gif` + `x-dark.gif`, wire the `<Image>` by hand, flag any orphaned old PNGs. `#17b`

## GIFs (only when `kind="gif"`)
- Author in `GIF_SPECS` (not `SPECS`); fixed probed `clip` every frame; `record-gif.mjs` per theme. `#3`
- Capture at **DPR 2**, output `width` = clip's CSS width (downscale-only, never upscale → pixelation). `#3`
- Do the same framing prep (closeSidebar, matBg, hideKbd) at the top of `steps`. `#3`
- Chart canvas slices aren't DOM-selectable — hover geometrically by mid-angle. `#3a`

---
**When in doubt or the shot is unusual** (developer overlays, canvas charts, native `<select>` popups,
width/border edge cases not covered above), **read the full lesson in `RULES.md` by its `#ref`.**
This checklist is the common path, not a replacement for the rulebook.

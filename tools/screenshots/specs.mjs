// Docs-screenshot spec catalog.
//
// One object per screenshot. The resolve agent APPENDS resolved specs to `SPECS`; the
// captured images regenerate deterministically from these + the scripts.
//
// Spec shape:
//   id        unique slug → out/<id>.png (+ out/<id>-dark.png)
//   path      Avo path to navigate to (demo mounted at /avo)
//   viewport  { width, height }                    (default 1440×900)
//   settle    ms to wait before the shot           (optional)
//   prepare   async (page) => {}                   compose from prepare.mjs (optional)
//   selector  capture just this element            (omit → viewport/clip screenshot)
//   clip      { x, y, width, height }              region (ignored if selector is set)
//   pad       { x, y } | { top, bottom, x }        breathing room around selector (≤10, symmetric)
//   marks     [{ selector | box, type, from? }]    annotation targets (optional)
//   out       "docs/public/assets/img/4_0/<page>/<name>.png"   (light; -dark is derived)
//   display   "full" (default) | "half"            half = small/centered (RULES.md lesson 9)
//   source    { file, prompt }                     links the spec to its <Image prompt> tag (apply.mjs)
//
// See RULES.md for every framing rule and prepare.mjs for the prepare-step primitives.

import { compose, closeSidebar, matBg, hideKbd, neutralizeBorders, hover, focus, wait, injectCSS } from "./prepare.mjs";

// ---- factories — stamp out repeated specs for a page (adapt the `out` subpath) -------

// Element crop with symmetric ≤10px pad (RULES 15e/15f) — control bars, field rows, etc.
export const elementSpec = (id, path, selector, out, extra = {}) => ({
  id, path, viewport: { width: 1440, height: 1200 }, selector, pad: { x: 10, y: 10 },
  settle: 800, prepare: hideKbd, out, ...extra,
});

// Fixed-region clip crop.
export const clipSpec = (id, path, clip, out, extra = {}) => ({
  id, path, viewport: { width: 1440, height: 1100 }, clip, settle: 800, prepare: hideKbd, out, ...extra,
});

// ---- examples — illustrate the common shapes. NOT captured (kept out of SPECS).
// Copy one as a starting point, or just read them to learn the structure.
export const EXAMPLES = [
  // 1) Triggered popover IN CONTEXT (RULES 15a/15b/15j): close sidebar + mat bg, hover the
  //    trigger to open the tippy, focus it for the native ring, clip the table + popover tight.
  {
    id: "example-preview-popover",
    path: "/avo/resources/teams?per_page=6",
    prepare: compose(
      closeSidebar, matBg,
      hover('table tbody tr:nth-child(3) [data-field-type="preview"] a'),
      wait(1200),
      focus('table tbody tr:nth-child(3) [data-field-type="preview"] a'),
    ),
    clip: { x: 256, y: 220, width: 1180, height: 360 },
    out: "docs/public/assets/img/4_0/record-previews/preview.png",
    display: "full",
    source: { file: "docs/4.0/record-previews.md", prompt: "the preview popover open over the Team index" },
  },

  // 2) Small field crop shown half-size + centered (RULES 9), via the elementSpec factory.
  elementSpec(
    "example-field-boolean",
    "/avo/resources/users/1",
    '[data-field-type="boolean"]',
    "docs/public/assets/img/4_0/fields/boolean.png",
    { display: "half", source: { file: "docs/4.0/fields/boolean.md", prompt: "a boolean field on the show view" } },
  ),

  // 3) Highlight a GROUP of elements with a drawn box mark (RULES 15d) — when there is no
  //    single focusable wrapper. `box` is viewport CSS-px; capture.mjs records it to the sidecar.
  {
    id: "example-scopes-bar",
    path: "/avo/resources/users?per_page=6",
    prepare: compose(closeSidebar, matBg),
    clip: { x: 256, y: 200, width: 720, height: 120 },
    marks: [{ box: { x: 28, y: 64, width: 309, height: 24 }, type: "highlight" }],
    out: "docs/public/assets/img/4_0/scopes/scopes.png",
    source: { file: "docs/4.0/scopes.md", prompt: "the scopes filter bar on a resource index" },
  },
];

// The live catalog — the resolve agent appends resolved specs here; capture.mjs / apply.mjs
// read it. Starts empty on a fresh checkout.
export const SPECS = [
  // field-options "Change field name" — a boolean field whose Index column header shows the
  // custom label set via `name:` ("Availability"). RESHAPED to a single-column shot (RULES
  // 9a/10a): temp-hid the Skills/Country/City/Links index fields so only ID, Name and the renamed
  // boolean "Availability" column remain, small per_page (4) + a narrow ~900px viewport so the
  // header reads at ~1× — not a full wide table. Temp-set Course#has_skills `name: "Availability"`
  // to match the doc snippet (RULES 13). Sidebar closed + mat bg (RULES 12/19a). The "Availability"
  // header is a non-sortable `<div>` (not focusable), so the native ring (15b) can't apply — mark
  // the header TEXT extent with a drawn highlight styled like Avo's native :focus-visible ring
  // (`style: "focus"` → thin 2px #60a5fa stroke, 2px pad, 3px radius). The header `<div>` is the
  // full 222px column width (text left-aligned), so a `selector` ring on it would span the whole
  // empty column — instead an explicit `box` in viewport CSS-px = the GLYPH extent measured via a
  // DOM Range (RULES #5), probed live (probe-hdr.mjs) at this exact viewport + sidebar-closed
  // state, so the ring HUGS just "Availability". capture.mjs offsets the box by the padded clip
  // origin (element − pad) so the ring lands tight on the word, not pad-shifted up/left.
  {
    id: "field-options-change-field-name",
    path: "/avo/resources/courses?per_page=4",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ box: { x: 535, y: 289, width: 60, height: 16 }, type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/field-options/change-field-name.png",
    display: "full",
    alt: "An Avo index table with three columns — ID, Name and a boolean column whose header reads “Availability”, the custom label set via the field's name option, highlighted.",
    source: { file: "docs/4.0/field-options.md", prompt: "index with the column header Availability anotated" },
  },

  // field-options "Fields Formatter > format_using" — an `is_writer` text field on the User
  // index whose value renders as a 👍/👎 emoji via `format_using` instead of the raw value.
  // RESHAPED to a single-column shot (RULES 9a/10a): temp-hid every other index field so only
  // ID, Name and the `is_writer` 👍/👎 column remain, small per_page (4) + a narrow ~900px
  // viewport so the column reads at ~1× — not a full wide table. Temp-added the `is_writer`
  // text field to User#fields with the EXACT `format_using` lambda from the doc snippet (RULES
  // 13); a `do` block returns the raw value for odd ids (→ 👍) and nil for even ids (→ 👎) so
  // BOTH emoji appear among the 4 visible rows. Sidebar closed + mat bg (RULES 12/19a).
  {
    id: "field-options-format-using",
    path: "/avo/resources/users?per_page=4",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/format-using.png",
    display: "full",
    alt: "An Avo index table with three columns — ID, Name and an “Is writer” column whose cells show a 👍 or 👎 emoji rendered via format_using instead of the raw value.",
    source: { file: "docs/4.0/field-options.md", prompt: "Index view text field shown as a thumbs up/down emoji via format_using instead of the raw boolean value" },
  },

  // field-options "Fields Formatter > format_{view}_using" — the `is_writer` text field on a
  // User SHOW page, whose value renders as a 👍/👎 emoji via `format_display_using` (display
  // views only). Sibling of format-using (the index shot). We frame the WHOLE Show-view
  // details PANEL CARD (`.panel--has-sidebar .panel__body > .card`) so all FOUR of the card's
  // borders are intact (a complete component, fully-around — never a sliced/partial border,
  // RULES 15r/15i′). Temp-TRIMMED the Show card to a SHORT 5-field set (ID, First name, Is
  // writer, Last name, User Email — every other card field `except_on`/`only_on` away from
  // :show) so the whole card renders short enough to capture top-to-bottom with all four
  // borders + ≤10px mat. `is_writer` is a MIDDLE row (3 of 5), never the last, so no trailing
  // section can re-create a sliced bottom (RULES 15i/15i′). Temp-added `format_display_using:
  // -> { value.present? ? '👍' : '👎' }` to the card `is_writer` field, matching the doc
  // snippet exactly (RULES 13); user 2 has posts so value is present → 👍.
  // SIZING (user feedback: the old half-size shot was too small): keep the native card border
  // but ship it at display:"full" so the card fills the ~688px content column and reads
  // comfortably (RULES 9a). A narrow 760px viewport keeps the card content-sized — the captured
  // CSS width (~620px) lands the field labels/values near 1× at the content column instead of
  // shrinking them. KEEP the card's real border (no neutralizeBorders, RULES 15w); matBg makes
  // everything outside the card mat. Sidebar closed (RULES 12/19a).
  {
    id: "field-options-format-display-using",
    path: "/avo/resources/users/2",
    viewport: { width: 760, height: 1200 },
    settle: 800,
    // The card's LAST visual row is two w-1/2 cells (Is writer | User Email). Avo only zeroes
    // the bottom border on the DOM-last field-wrapper (User Email, the right cell), leaving the
    // left cell (Is writer) with a `border-bottom: 1px` that renders as a half-width separator
    // stub above the card's real rounded bottom — making the capture LOOK sliced even though the
    // true bottom border + both rounded corners are intact below it (RULES #20). Zero that inner
    // stub so the last row sits flush against the card's continuous bottom border.
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(".panel--has-sidebar .panel__body > .card .description-list > .field-wrapper:nth-last-child(2) { border-bottom-width: 0 !important; }"),
    ),
    selector: ".panel--has-sidebar .panel__body > .card",
    pad: { x: 10, y: 10 },
    // No highlight mark: the 👍 emoji is the only non-text value in the card, so the `is_writer`
    // row is already the natural focal point (framing, not annotation, marks the subject).
    out: "docs/public/assets/img/4_0/field-options/format-display-using.png",
    display: "full",
    alt: "An Avo Show view details panel card laid out in three rows — ID spanning the full width on top, First name and Last name side by side, then Is writer and User Email side by side — the “Is writer” value showing a 👍 emoji rendered via format_display_using.",
    source: { file: "docs/4.0/field-options.md", prompt: "Show view field shown as a thumbs up/down emoji via format_display_using (display views only)" },
  },

  // field-options "Sortable fields" — RESHAPED per RULES 9a/10a: the prose is about ONE
  // option (the active sort-arrow indicator on a sortable field's column HEADER), so the shot
  // focuses the Name column header rather than a full wide multi-column table. Temp edit
  // (reverted after capture): the Project resource is trimmed to exactly 3 index columns —
  // `hide_on: :index` on every other index field (stage badge, status, country, users_required,
  // started_at, files) leaves ID, Name, Progress — so the table fits FULLY at the narrow 900px
  // viewport with a clean right border + pagination (RULES 4/10 — no sliced columns; an earlier
  // take left all 8 columns in and the card's horizontal overflow sliced the table mid-column).
  // Small ?per_page=5 keeps it short. ?sort_by=name&sort_direction=asc activates the sort so
  // the SVG indicator inside the Name th renders in its ACTIVE sort-ascending state (filled
  // bars + up arrow, darker) — visibly distinct from the neutral double-chevron on the also-
  // sortable ID header — and the rows ARE sorted by name ascending (Asoka, Bigtax, Biodex…),
  // confirming the param works (RULES 13 — header reads "Name", matching the doc snippet
  // `field :name, as: :text, sortable: true`).
  // The header anchor is `flex-1 flex justify-between`, so in a wide column the sort indicator
  // floats to the far right of the th and visually detaches from its label (drifting toward the
  // next column — the defect this take was flagged for). injectCSS overrides the anchor to
  // `flex: 0 0 auto; justify-content: flex-start; gap: 0.25rem` so the indicator hugs the
  // "Name" (and "ID") text it belongs to — same small gap on both, reading clearly as Name's.
  // .card.relative.w-full wraps table+pagination so the bottom clips to the panel (RULES 20).
  // Sidebar closed + mat bg (RULES 12/19a).
  {
    id: "field-options-sortable",
    path: "/avo/resources/projects?per_page=5&sort_by=name&sort_direction=asc",
    viewport: { width: 900, height: 760 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(
        'th[data-control="resource-field-th"] a { flex: 0 0 auto !important; justify-content: flex-start !important; gap: 0.25rem !important; }',
      ),
      // RULES 15b′ — the subject is ONE small control (the active sort caret in the Name
      // header). Mark it with Avo's native :focus-visible ring by focusing the sortable Name
      // header <a> (no drawn box, no annotate). The header is a focusable link, so the real
      // 2px ring frames the "Name" label + its sort indicator, pointing the reader at WHICH
      // column header carries the sortable arrow.
      focus('th[data-table-header-field-id="name"] a'),
    ),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/sortable.png",
    display: "full",
    alt: "An Avo index table for Projects sorted by the Name column, whose header shows the active sort-arrow indicator for the sortable name text field.",
    source: { file: "docs/4.0/field-options.md", prompt: "Index column header with the sort arrow indicator for a sortable field" },
  },

  // field-options "Placeholder" — the New (create) Team form's `name` text field whose EMPTY
  // input shows the grey placeholder "John Doe" (temp-added `placeholder: 'John Doe'` to
  // Team#name, matching the doc snippet `field :name, as: :text, placeholder: 'John Doe'`,
  // field-options "placeholder" — the NATIVE Avo form card (RULES 15w), twin of disabled/required
  // (below). `placeholder: 'John Doe'` shows grey hint text inside an EMPTY input. A lone tiny field
  // row floating on bare mat reads as "small" (user feedback), so we show the placeholder on a REAL
  // field inside the native form card with one sibling field for context/size. Shot on the New
  // (create) form so both inputs are naturally EMPTY — the "Name" input renders its grey "John Doe"
  // placeholder, and the sibling "Website" input renders empty too, so the card reads as a real new-
  // record form. We do NOT strip the card border or hand-fake the look: the card renders with its
  // real border + native divider, and the docs frame (lesson 16) sits OUTSIDE that card (both borders
  // read as intentional). Matches the doc snippet `field :name, as: :text, placeholder: 'John Doe'`.
  // Temp edits (reverted after capture): Team model gets `attr_accessor :company_site` (form-input
  // pattern, no DB column); Team resource's card is trimmed via the DSL to ONLY these two fields
  // (`field :name, as: :text, name: "Name", placeholder: "John Doe"` then
  // `field :company_site, as: :text, name: "Website"`, then `next` to skip the rest) so the card is
  // compact while keeping its real border + divider. Frame the WHOLE native card
  // (`.card:has([data-field-id="name"])`) with symmetric ≤10px pad — all four borders included
  // (RULES 15r fully-around). Full display so the placeholder + separator read clearly. Sidebar
  // closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "field-options-placeholder",
    path: "/avo/resources/teams/new",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="name"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/placeholder.png",
    display: "full",
    alt: "An Avo New form with an empty 'Name' text field showing the grey placeholder text “John Doe”, above an empty 'Website' field.",
    source: { file: "docs/4.0/field-options.md", prompt: "New form empty text input showing the placeholder text John Doe" },
  },

  // field-options "Required" — the Edit form `name` text field of a Project (no temp edit:
  // field-options "Required" — the NATIVE Avo form card (RULES 15w), twin of disabled/readonly
  // (below). `required: true` appends a red asterisk (*) to the field LABEL — that asterisk is the
  // focal point. A lone tiny field row floating on bare mat reads as "small" (user feedback), so we
  // show the asterisk on a REAL field inside the native form card with one sibling field for context
  // /size: a REQUIRED "Name" text field (red * on its label, holding a real value) sitting ABOVE a
  // normal "Website" text field in the SAME real card, so Avo's own field separator (the
  // `.description-list` divider) divides them. We do NOT strip the card border or hand-fake the look:
  // the card renders with its real border + native divider, and the docs frame (lesson 16) sits
  // OUTSIDE that card (both borders read as intentional). Matches the doc snippet
  // `field :name, as: :text, required: true`. Temp edits (reverted after capture): Team model gets
  // `attr_accessor :company_name, :company_site` + `after_initialize` pre-fill (form-input pattern, no
  // DB mutation); Team resource's card is trimmed via the DSL to ONLY these two fields
  // (`field :company_name, as: :text, name: "Name", required: true` then
  // `field :company_site, as: :text, name: "Website"`, then `next` to skip the rest) so the card is
  // compact while keeping its real border + divider. Frame the WHOLE native card
  // (`.card:has([data-field-id="company_name"])`) with symmetric ≤10px pad — all four borders included
  // (RULES 15r fully-around). Full display so the asterisk + separator read clearly. Sidebar closed +
  // mat bg (RULES 12/19a); hideKbd.
  {
    id: "field-options-required",
    path: "/avo/resources/teams/team_qrv5nD7RmjOqKtdWMwaXl8JQ/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="company_name"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/required.png",
    display: "full",
    alt: "An Avo Edit form with a 'Name' text field whose label carries a red asterisk marking it required, above a normal 'Website' field.",
    source: { file: "docs/4.0/field-options.md", prompt: "Edit form field label with a red asterisk marking it as required" },
  },

  // field-options "Disabled" — the NATIVE Avo form card (RULES 15w): a DISABLED "Name" text field
  // sitting ABOVE a normal, editable "Website" text field in the SAME real card, so Avo's own
  // field separator (the `.description-list` divider) divides them. We do NOT strip the card
  // border or hand-fake the look: the card renders with its real border + native divider, and the
  // docs frame (lesson 16) sits OUTSIDE that card (both borders read as intentional). Matches the
  // doc snippet `field :name, as: :text, disabled: true`. Avo's genuine disabled rendering is muted
  // /grey text (same grey as a placeholder) with no greyed *background* — so a single short value
  // could be mistaken for a placeholder. Fix: BOTH fields hold obviously-real, distinct values —
  // disabled "Acme Corporation International" (greyed) above enabled
  // "https://www.acme-international.example.com" (dark) — making the disabled state unambiguous.
  // Temp edits (reverted after capture): Team model gets `attr_accessor :company_name,
  // :company_site` + `after_initialize` pre-fill (form-input pattern, no DB mutation); Team
  // resource's card is trimmed via the DSL to ONLY these two fields (`field :company_name, as:
  // :text, name: "Name", disabled: true` then `field :company_site, as: :text, name: "Website"`,
  // then `next` to skip the rest) so the card is compact while keeping its real border + divider.
  // Frame the WHOLE native card (`.card:has([data-field-id="company_name"])`) with symmetric ≤10px
  // pad — all four borders included (RULES 15r fully-around). Full display so the contrast +
  // separator read clearly. Sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "field-options-disabled",
    path: "/avo/resources/teams/team_qrv5nD7RmjOqKtdWMwaXl8JQ/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="company_name"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/disabled.png",
    display: "full",
    alt: "An Avo Edit form with a disabled, greyed-out 'Name' text field above a normal, editable 'Website' field — the contrast shows the disabled state.",
    source: { file: "docs/4.0/field-options.md", prompt: "Edit form showing a disabled greyed-out text field" },
  },

  // field-options "Readonly" — the NATIVE Avo form card (RULES 15w), twin of field-options-disabled
  // (above). Avo's `readonly: true` renders the input IDENTICALLY to `disabled`: muted/grey text, no
  // greyed background, same grey as a placeholder. So a single readonly field with a short value is
  // indistinguishable from an empty input with a placeholder (reviewers reject that). Fix (no faked
  // CSS): a READONLY "Name" text field sitting ABOVE a normal, editable "Website" text field in the
  // SAME real card, so Avo's own field separator (the `.description-list` divider) divides them. We do
  // NOT strip the card border or hand-fake the look: the card renders with its real border + native
  // divider, and the docs frame (lesson 16) sits OUTSIDE that card (both borders read as intentional).
  // BOTH fields hold obviously-real, distinct LONG values — readonly "Name" =
  // "Acme Corporation International" (greyed) above enabled "Website" =
  // "https://www.acme-international.example.com" (dark) — so the greyed value can't read as a
  // placeholder and the readonly state is unambiguous. Matches the doc snippet
  // `field :name, as: :text, readonly: true`. Temp edits (reverted after capture): Team model gets
  // `attr_accessor :company_name, :company_site` + `after_initialize` pre-fill (form-input pattern, no
  // DB mutation); Team resource's card is trimmed via the DSL to ONLY these two fields
  // (`field :company_name, as: :text, name: "Name", readonly: true` then
  // `field :company_site, as: :text, name: "Website"`, then `next` to skip the rest) so the card is
  // compact while keeping its real border + divider. Frame the WHOLE native card
  // (`.card:has([data-field-id="company_name"])`) with symmetric ≤10px pad — all four borders included
  // (RULES 15r fully-around). Full display so the contrast + separator read clearly. Sidebar closed +
  // mat bg (RULES 12/19a); hideKbd.
  {
    id: "field-options-readonly",
    path: "/avo/resources/teams/team_qrv5nD7RmjOqKtdWMwaXl8JQ/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="company_name"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/readonly.png",
    display: "full",
    alt: "An Avo Edit form with a readonly, greyed-out 'Name' text field above a normal, editable 'Website' field — the contrast shows the readonly state.",
    source: { file: "docs/4.0/field-options.md", prompt: "Edit form showing a readonly text field" },
  },

  // field-options "help" — RULES 15z: the help field gets its OWN dedicated `panel do card do … end
  // end` so Avo renders a real, content-sized card that HUGS just that field (true borders + rounded
  // corners on all four sides), instead of cropping a slice out of the big panel and neutralizing the
  // wrapper hairline (the legacy bare-fragment-on-mat approach). On the EDIT view Avo renders the
  // `help` string directly BELOW the input — so the captured card shows label + input + help line.
  // Field is `custom_css` (matches the adjacent doc snippet's `field :custom_css … help: "This
  // enables you to edit the user's custom styles."` verbatim — RULES 13); the help string is the
  // exact doc text. Temp edits (reverted after capture): Team model gets `attr_accessor :custom_css`
  // (form-input pattern, no DB mutation); Team resource gets a dedicated `panel do card do field
  // :custom_css, as: :text, name: "Custom CSS", help: "…" end end` at the top of `fields`. Frame the
  // WHOLE native card (`.card:has([data-field-id="custom_css"])`) with symmetric ≤10px pad — all four
  // borders included (RULES 15r/15z fully-around). Full display so the help line is legible. Sidebar
  // closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "field-options-help",
    path: "/avo/resources/teams/team_qrv5nD7RmjOqKtdWMwaXl8JQ/edit",
    viewport: { width: 720, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="custom_css"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/help.png",
    display: "full",
    alt: "An Avo Edit form 'Custom CSS' text field with a line of help text shown directly below the input explaining what the field does.",
    source: { file: "docs/4.0/field-options.md", prompt: "Edit form field with help text shown below the input" },
  },

  // field-options "label_help" — distinct from plain `help` (sibling above, which renders BELOW the
  // INPUT on edit only). `label_help` renders the help string directly BELOW the field LABEL on every
  // view (the `.field-wrapper__label-help` line sits inside the label block, above the input). Shot on
  // the User EDIT form. Per RULES 15z the field is wrapped in its OWN dedicated `panel do card do … end
  // end` so Avo renders a real, content-sized card that HUGS just this one field — a complete card with
  // true borders + rounded corners on all four sides, no neutralizing / no bare-mat fragment. Temp edit
  // (reverted after capture): the User resource gets a leading `panel/card` with
  // `field :custom_css, as: :code, theme: "dracula", language: "css", label_help: "This enables you to
  // edit the user's custom styles.", only_on: :edit` — matching the adjacent doc snippet verbatim
  // (RULES 13: the code, the dracula theme, the css language, the label_help string). The original
  // User `custom_css` field (which uses `help:`) is temp-hidden on edit so exactly ONE custom_css card
  // exists on the page (unambiguous selector). Narrow viewport (720) so the card renders ~1× (RULES 9b)
  // and the label stacks above its code editor — label → label_help line → editor read top-to-bottom,
  // making the "below the label" placement unmistakable. Capture the whole card with symmetric ≤10px pad
  // (RULES 15e/15z); the docs frame (lesson 16) sits OUTSIDE it. Full display so the label + help line +
  // editor read clearly. Sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "field-options-label-help",
    path: "/avo/resources/teams/team_qrv5nD7RmjOqKtdWMwaXl8JQ/edit",
    viewport: { width: 720, height: 900 },
    settle: 1000,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="custom_css"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/label-help.png",
    display: "full",
    alt: "An Avo Edit form 'Custom css' code field with a line of help text shown directly below the field label explaining what the field does.",
    source: { file: "docs/4.0/field-options.md", prompt: "Form field with label_help text shown below the field label" },
  },

  // field-options "Link to record" — a RESHAPED, focused People index of just 3 columns
  // (Id, Name, Type) so the Name-column LINKS are the obvious subject and the text lands near 1×
  // (RULES 9a/10a — a full ~2824px multi-column table was unfocused and shrunk text to ~0.5×).
  // People#name is already `field :name, as: :text, link_to_record: true` (matches the doc snippet
  // verbatim, RULES 13). With link_to_record the cell renders the value as an `<a>` to the record —
  // the demo styles it in Avo's link blue, so the link affordance is visible natively. To make it
  // unmistakable, hover a MIDDLE row's name link (RULES 15i) so its hover/underline state shows.
  // Temp edit (reverted after capture): the Person resource's `link` (as_html) field gets
  // `hide_on: :index` so the index is the focused Id / Name / Type triple, not Id / Name / Type /
  // Link (the as_html Link column is itself a link and would muddy "the Name cell is a link").
  // Narrow viewport (900) keeps the columns tight and the text readable (RULES 9a). Full table +
  // pagination via ?per_page=6 (RULES 10/20); .card.relative.w-full wraps table+pagination so the
  // bottom clips to the panel (RULES 20). Sidebar closed + mat bg (RULES 12/19a).
  {
    id: "field-options-link-to-record",
    path: "/avo/resources/people?per_page=6",
    viewport: { width: 900, height: 900 },
    settle: 800,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      hover('table tbody tr:nth-child(3) td a[href*="/resources/"]'),
      wait(600),
    ),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/link-to-record.png",
    display: "full",
    alt: "An Avo index table with three columns (Id, Name, Type) where the Name column cells are rendered as blue links to each record via link_to_record, with one middle-row link hovered to show its underlined state.",
    source: { file: "docs/4.0/field-options.md", prompt: "Index table cell rendered as a link to the record via link_to_record" },
  },

  // field-options "Align text on Index view" — a RESHAPED, focused Project index of just 3 data
  // columns (Id, Name, Users required) so the right-aligned NUMBER column is the obvious subject
  // and the text lands near 1× (RULES 9a/10a — the old 6-column ~2824px table was unfocused and
  // shrunk text to ~0.5×). Temp-trim the Project resource to `hide_on: :index` for every other
  // field and set `field :users_required, as: :number, html: {index: {wrapper: {classes:
  // "text-right"}}}` exactly as the doc snippet (RULES 13). The html option stamps `text-right`
  // onto the column's <td> cells (verified via probe: all 6 users_required cells carry
  // `text-right`), so the numbers hug the RIGHT edge of their column, contrasting with the
  // LEFT-aligned text columns (Id, Name). Narrow viewport (900) keeps the columns tight and the
  // numbers visibly hug the right edge while text stays readable (RULES 9a). Full table +
  // pagination via ?per_page=6 (RULES 10/20); .card.relative.w-full wraps table+pagination so the
  // bottom clips to the panel (RULES 20). Sidebar closed + mat bg (RULES 12/19a).
  {
    id: "field-options-align-text",
    path: "/avo/resources/projects?per_page=6",
    viewport: { width: 900, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/align-text.png",
    display: "full",
    alt: "An Avo index table with three columns (Id, Name, Users required) where the Users required number column is right-aligned via the html option, its numbers hugging the right edge of the column, contrasting with the left-aligned Id and Name text columns.",
    source: { file: "docs/4.0/field-options.md", prompt: "Index table numeric column right-aligned via the html option" },
  },

  // field-options "Stacked layout — inline (default)" — the Project show view `meta` key_value
  // field (Project#meta is `field :meta, as: :key_value`, NO `stacked`, so the wrapper is the
  // default INLINE layout: label "Meta" in the LEFT column, the key/value control to its RIGHT).
  // Pairs with the sibling `stacked: true` shot (label ABOVE).
  //
  // Native DSL, no hardcoded pixel clip (RULES 15w): the `meta` field is temp-given a block
  // returning 3 realistic pairs ({"environment"=>"production","region"=>"eu-west",
  // "tier"=>"premium"}) so the key_value control reads as a real example with 3 rows. We capture
  // the real Meta field-wrapper element (`selector: '[data-field-id="meta"]'`) with a symmetric
  // 10px pad (RULES 15e/15f) — the element grab is exactly the label + key/value control, so no
  // sibling rows need hiding and no card needs transparenting. `neutralizeBorders` drops only the
  // structural `.field-wrapper` hairline (RULES 15u) so the docs frame supplies the surround
  // (RULES 15s) while the `.key-value__table` keeps its OWN meaningful inner border, intact on all
  // four sides (RULES 15r/15v). Sidebar closed + mat bg (RULES 12/19a). Viewport 1500: the
  // `meta` field-wrapper is `--full-width`, so the key/value table fills the content column edge
  // to edge; at the old 1100 the wrapper's right edge + 10px pad exceeded the viewport and
  // capture.mjs capped the clip width (line ~92), SLICING the table's right border (RULES
  // 15r/15v/15r′). 1500 gives the full-width wrapper enough content padding that the whole table
  // (all four borders) plus the symmetric 10px pad fits inside the viewport. Full display.
  {
    id: "field-options-stacked-inline",
    path: "/avo/resources/projects/3",
    viewport: { width: 1500, height: 1000 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, neutralizeBorders),
    selector: '[data-field-id="meta"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/stacked-inline.png",
    display: "full",
    alt: "An Avo show view key_value field in the default inline layout, with the field label “Meta” in the left column and a key/value control showing three pairs (environment: production, region: eu-west, tier: premium) to its right.",
    source: { file: "docs/4.0/field-options.md", prompt: "key_value field with the default inline layout, label beside value" },
  },

  // field-options "Stacked layout — stacked" — the SAME Project show view `meta` key_value field
  // but with `stacked: true` (temp-added to Project#meta), so the wrapper switches to the STACKED
  // layout: the label "Meta" sits ABOVE the key/value control (not beside it, as in the inline
  // sibling above — confirmed via probe: the field-wrapper carries `field-wrapper--stacked` and the
  // "Meta" label box top sits ABOVE the key/value table top). Pairs with the sibling inline shot.
  //
  // Native DSL, no hardcoded pixel clip (RULES 15w): the `meta` field is temp-given a block
  // returning 3 realistic pairs ({"environment"=>"production","region"=>"eu-west",
  // "tier"=>"premium"}) so the key_value control reads as a real example with 3 rows. We capture
  // the real Meta field-wrapper element (`selector: '[data-field-id="meta"]'`) with a symmetric
  // 10px pad (RULES 15e/15f) — the element grab is exactly the label + key/value control, so no
  // sibling rows need hiding and no card needs transparenting. `neutralizeBorders` drops only the
  // structural `.field-wrapper` hairline (RULES 15u) so the docs frame supplies the surround
  // (RULES 15s) while the `.key-value__table` keeps its OWN meaningful inner border, intact on all
  // four sides (RULES 15r/15v). Sidebar closed + mat bg (RULES 12/19a). Viewport is 1500 — the
  // SAME as the inline sibling — because these two shots are a MATCHED PAIR (RULES 15q′): both must
  // read at the IDENTICAL on-screen zoom so the reader compares label-beside vs label-above
  // like-for-like. Both wrappers carry `field-wrapper--full-width`, so at the same viewport+sidebar
  // state the captured `[data-field-id="meta"]` wrapper has the SAME width in both (only the height
  // differs — stacked is genuinely taller, which is fine; only the WIDTH/zoom must match). At 1500
  // with the sidebar CLOSED the content column is wider than the probe's sidebar-open 1500 (probe:
  // wrapper x≈404 w≈950, table w≈918, value inputs end ~30px inside the table right edge), so the
  // value-cell inputs render WHOLE with all four borders well inside the wrapper — no slicing
  // (RULES 15v). Identical pixel width to the inline sibling (verified via `identify`); full display.
  {
    id: "field-options-stacked-stacked",
    path: "/avo/resources/projects/3",
    viewport: { width: 1500, height: 1000 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, neutralizeBorders),
    selector: '[data-field-id="meta"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/stacked-stacked.png",
    display: "full",
    alt: "An Avo show view key_value field in the stacked layout, with the field label “Meta” shown above a key/value control listing three pairs (environment: production, region: eu-west, tier: premium).",
    source: { file: "docs/4.0/field-options.md", prompt: "key_value field with the stacked layout, label above value" },
  },

  // field-options "`inline` layout (default)" — the SAME Project SHOW view `meta` key_value field as
  // the stacked sibling above, but in Avo's DEFAULT (inline) field-wrapper layout, i.e. WITHOUT
  // `stacked: true`. This shot is the matched PAIR of `field-options-stacked-stacked`: same Show view,
  // same record (project 3), same selector/viewport/prepare/pad/display — the ONLY difference is the
  // layout (inline here = label "Meta" BESIDE the key/value control; stacked there = label ABOVE).
  // The section ("Stacked layout") documents the field-WRAPPER layout, not key_value editing controls,
  // so the read-only Show projection is correct here and the two siblings must be like-for-like.
  //
  // Native DSL, no hardcoded pixel clip (RULES 15w): the `meta` field is temp-given a block returning
  // 3 realistic pairs ({"environment"=>"production","region"=>"eu-west","tier"=>"premium"}) so the
  // control reads as a real example with 3 rows — the SAME temp edit as the stacked sibling, minus
  // `stacked: true` (inline is the default). We capture the real Meta field-wrapper element
  // (`selector: '[data-field-id="meta"]'`) with a symmetric 10px pad (RULES 15e/15f); `neutralizeBorders`
  // drops only the structural `.field-wrapper` hairline (RULES 15u) so the docs frame supplies the
  // surround while the `.key-value__table` keeps its own meaningful inner border on all four sides.
  // Sidebar closed + mat bg (RULES 12/19a); hideKbd. Viewport 1500 — the SAME as the stacked sibling
  // so the matched PAIR reads at the IDENTICAL zoom (both wrappers are `--full-width`, so same
  // viewport → same captured width → same on-screen scale). Full display.
  {
    id: "field-options-key-value-inline",
    path: "/avo/resources/projects/3",
    viewport: { width: 1500, height: 1000 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, neutralizeBorders),
    selector: '[data-field-id="meta"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-options/key-value-inline.png",
    display: "full",
    alt: "An Avo show view key_value field in the default inline layout, with the field label “Meta” shown beside a key/value control listing three pairs (environment: production, region: eu-west, tier: premium).",
    source: { file: "docs/4.0/field-options.md", prompt: "show page key_value field with the default inline layout, label beside value" },
  },

  // summarizable — chart icon in a column header + the open summary distribution popover, in
  // context over the Projects index table (RULES 15a: trigger + open popover + table). The
  // popover is a native HTML popover anchored under the table header; the chart icon button is
  // highlighted via a drawn mark (it's not single-focusable once the popover steals focus).
  {
    id: "field-options-summarizable",
    path: "/avo/resources/projects?per_page=6",
    viewport: { width: 1440, height: 950 },
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(`.popover-menu__panel { box-shadow: 0 8px 30px rgba(0,0,0,.12) !important; }`),
      async (page) => {
        await page.locator('button[popovertarget="summary-popover-status"]').first().click();
      },
      wait(2000),
    ),
    clip: { x: 300, y: 270, width: 505, height: 310 },
    marks: [{ selector: 'button[popovertarget="summary-popover-status"]', type: "highlight" }],
    out: "docs/public/assets/img/4_0/field-options/summarizable.png",
    display: "full",
    alt: "An Avo index table column header showing the summarizable chart icon, with the open summary popover charting the distribution of the column's values.",
    source: { file: "docs/4.0/field-options.md", prompt: "Index table header showing the summarizable chart icon and summary popover for a column" },
  },

  // native-components "Avo::PanelComponent" intro illustration — a single, complete Avo Show
  // panel matching the ERB example: a panel HEADER (the bold record title + a one-line
  // description directly beneath it + a primary button in the tools area on the right) above a
  // BODY of a couple of fields. The Avo Show page renders exactly this: `.header`
  // (data-component="avo/ui/panel_header_component" — title + description + `.header__controls`
  // tools) sits above the `.panel` body card. We frame the WHOLE thing top-to-bottom by taking
  // the UNION of the two stacked elements: `clipFrom: ".header"` (top anchor) → `selector:
  // ".panel"` (bottom-right), + symmetric pad (capture.mjs's clipFrom union path). Product Show
  // (id 4 = "Apple Watch") is the natural match for the ERB's @product. Temp edits to
  // product.rb (reverted after capture): shortened `self.description` to one clean line ("Build
  // apps 10x faster.") so the description reads as a single subtitle line under the title, and
  // moved price/description(tiptap)/image to `only_on: :index` so the Show BODY is a short,
  // clean three-field list (ID, Title, Category) — a small self-contained body like the legacy
  // image. The header tools area natively carries Go back / Delete / Edit; injectCSS hides the
  // two text-style controls (Go back + Delete) leaving only the PRIMARY accent button (Edit),
  // matching the ERB's single primary "View product" button (RULES note: exact label needn't
  // match — the point is a primary button in the tools slot). Sidebar closed + mat bg so the
  // panel renders full-width and every frame edge is mat (RULES 12/19a); narrow ~1000px viewport
  // keeps the panel content-sized and readable (RULES 9a). Whole component, all four borders of
  // both header and body inside the clip — header + body as one well-formed panel (RULES 15r).
  {
    id: "panel-index",
    path: "/avo/resources/products/4",
    viewport: { width: 1000, height: 700 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(".header__controls .button--style-text { display: none !important; }"),
    ),
    clipFrom: ".header",
    selector: ".panel",
    pad: { x: 10, y: 12 },
    out: "docs/public/assets/img/4_0/avo-panel-component/index.png",
    display: "full",
    alt: "An Avo Show page rendered as a single PanelComponent: a panel header with the bold record title and a one-line description beneath it, a primary button in the tools area on the right, and a body listing a couple of fields.",
    source: {
      file: "docs/4.0/native-components/avo-panel-component.md",
      prompt: "Avo Show page rendering a single PanelComponent that matches the ERB example above: a bold panel title 'Avo' with the description 'Build apps 10x faster' directly beneath it, a primary 'View product' button in the header tools area on the right, and a body section containing the heading 'Product information' and the line 'Style: shiny'. Capture the whole panel, header plus body.",
    },
  },
];

// ---- GIF specs — animated demos; record-gif.mjs drives each spec's steps(page, snap) -------
// Same idea as SPECS, for GIFs. Append a spec here when a shot must animate. Starts empty.
export const GIF_SPECS = [
  // summarizable — the REAL Projects index table stays visible as context (RULES 15a/10/4), with
  // the summary-distribution popover opened OVER it from the Status column header's chart icon, then
  // each pie segment hovered so its per-segment tooltip ("done: 5", "finalized: 5", …) shows in turn.
  // The whole table card (header + rows, its own borders intact) is the background; the popover drops
  // down over the left columns while the Status column + rows on the right read clearly as a table.
  // The chart is a <canvas> (chart.js pie, not selectable per-slice), so each segment is hovered by
  // moving the mouse to its mid-angle point on the ring (pie starts at top, sweeps clockwise).
  //
  // USER FEEDBACK ("now is much better but I would like to have all that table; lets have less
  // columns"): the index is temp-SLIMMED to 4 columns — ID, Name, Status, Country — by adding
  // `hide_on: :index` to the Project resource's progress, stage(badge), users_required, started_at
  // and files fields (reverted with `git checkout` after capture). Status KEEPS its `summarizable`,
  // so its header chart-icon trigger (`button[popovertarget="summary-popover-status"]`) stays in shot.
  // Fewer columns + a narrower 900px viewport let the WHOLE table card fit and read bigger (RULES 9a).
  {
    id: "field-options-summarizable",
    path: "/avo/resources/projects?per_page=6",
    viewport: { width: 900, height: 950 },
    // Whole 4-column table card (probed x17→884, y276→647) + ~10px symmetric mat; popover
    // (x158→558, y307→583) sits fully inside this frame, so both table and popover are wholly in
    // shot (RULES 4/10/20). Status header chart-icon trigger (x530,y291) is in frame.
    clip: { x: 7, y: 266, width: 887, height: 391 },
    width: 900,
    delay: 18, // cs/frame → hold:5 ≈ 0.9s per segment
    steps: async (page, snap) => {
      await closeSidebar(page); // cookie + reload → content reflows full-width (RULES 12)
      await matBg(page); // docs-mat bg + drop sidebar divider (RULES 19/19a)
      await hideKbd(page);
      // Only soften the popover's shadow so it reads as floating over the table — the table and its
      // rows stay fully visible as the real context (RULES 15a); no tbody hide, no card transparency.
      await page.addStyleTag({
        content: `.popover-menu__panel { box-shadow: 0 8px 30px rgba(0,0,0,.12) !important; }`,
      });
      const trigger = page.locator('button[popovertarget="summary-popover-status"]').first();
      await trigger.focus(); // native :focus-visible ring marks the trigger (RULES 15b)
      await trigger.click(); // open the native popover (turbo-frame loads the chart)
      await page.waitForSelector("#summary-popover-status canvas", { timeout: 8000 });
      await page.waitForTimeout(1400); // let the chart render

      await snap(6); // hold ~1.1s on the full chart / legend over the table

      // Segment values in render order (Status distribution on the demo Projects index).
      const values = [5, 5, 5, 4, 4, 4, 3, 2, 2, 2];
      const total = values.reduce((a, b) => a + b, 0);
      const rect = await page.locator("#summary-popover-status canvas").boundingBox();
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const r = Math.min(rect.width, rect.height) * 0.3; // ring radius inside each slice
      let acc = 0;
      for (const v of values) {
        const mid = acc + v / 2;
        acc += v;
        const ang = (mid / total) * 2 * Math.PI - Math.PI / 2; // top start, clockwise
        await page.mouse.move(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
        await page.waitForTimeout(220); // let the tooltip settle on the slice
        await snap(5); // pause ~0.9s on this hovered segment (tooltip showing)
      }
      await page.mouse.move(cx, cy); // dismiss tooltip
      await page.waitForTimeout(120);
      await snap(4); // brief rest on the full chart before the loop repeats
    },
    out: "docs/public/assets/img/4_0/field-options/summarizable.gif",
  },
];

// Example GIF spec (NOT in GIF_SPECS) — "filters panel stays open while results update".
// Illustrates the steps(page, snap) pattern: snap(hold) emits `hold` identical frames to
// pause on a state. Copy + adapt the path/clip/steps for a new GIF.
export const GIF_EXAMPLE = {
  id: "example-keep-filters-open",
  path: "/avo/resources/courses?per_page=5",
  viewport: { width: 1440, height: 950 },
  clip: { x: 262, y: 50, width: 1168, height: 530 }, // content-only: table + filter panel + pagination
  steps: async (page, snap) => {
    await snap(3); // initial index
    await page.locator('[data-button="resource-filters"]').first().click();
    await page.waitForTimeout(900);
    await snap(3); // panel open
    for (const country of ["USA", "Japan", "Spain"]) {
      await page.locator(`.filters__panel label:has-text("${country}")`).first().click();
      await page.waitForTimeout(900);
      await snap(3); // panel STILL open, results updated
    }
    await page.locator('.filters__panel label:has-text("USA")').first().click();
    await page.waitForTimeout(900);
    await snap(4); // untick — still open (hold longer at the end)
  },
  out: "docs/public/assets/img/4_0/filters/keep-filters-panel-open.gif",
};

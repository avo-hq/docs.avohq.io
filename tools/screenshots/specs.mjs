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

import { compose, closeSidebar, matBg, hideKbd, hideRecords, hideIndexColumns, neutralizeBorders, hover, focus, wait, injectCSS, openSelect, click, hideSummarizableIcons, scrollTo } from "./prepare.mjs";

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
    selector: '.card:has([data-field-id="custom_css_label"])',
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

  // fields/boolean_group "Field declaration example" — the boolean_group `roles` field on the
  // INDEX view (prompt: "use index page"). On index Avo renders a boolean_group as a "View"
  // link (one per row) that opens a tippy popover listing each option with a checked/unchecked
  // box — so the shot shows the index table AND that popover open over a MIDDLE row, with the
  // View link FOCUSED for Avo's native :focus-visible ring (RULES 15a/15b/15b′ — a triggered
  // overlay shown in its trigger context, the small control marked by the real ring). The
  // popover labels read exactly Administrator / Manager / Writer, matching the doc snippet's
  // `options:` hash, and the column header reads "User roles", matching its `name:` (RULES 13).
  // RESHAPED per RULES 9a/10a: temp-trimmed the User resource's index `fields` to just ID, Name
  // and the renamed "User roles" boolean_group (early `return` when `view.index?`), small
  // ?per_page=4 + a narrow ~900px viewport so the 3-column table reads at ~1× — not the live
  // 15-column User index. Capture the full table card (.card.relative.w-full) so all four
  // borders + pagination are intact (RULES 4/10/20 — no sliced columns). The popover opens over
  // row 3 (a MIDDLE row, never first/last — RULES 15i) whose roles are a real mix (manager +
  // writer checked). The table beneath the popover IS the subject's context, so it stays LIVE
  // and visible (RULES 15j′ — do NOT blank it). Sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "boolean-group-index",
    path: "/avo/resources/users?per_page=4",
    viewport: { width: 900, height: 760 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      hover('table tbody tr:nth-child(3) [data-field-type="boolean_group"] [data-tippy-target="source"]'),
      wait(1000),
      focus('table tbody tr:nth-child(3) [data-field-type="boolean_group"] [data-tippy-target="source"]'),
    ),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/boolean_group/index.png",
    display: "full",
    alt: "An Avo index table with three columns — ID, Name and a “User roles” boolean_group column rendered as a “View” link per row — with the popover open over a middle row listing Administrator, Manager and Writer each with a checked or unchecked box.",
    source: { file: "docs/4.0/fields/boolean_group.md", prompt: "use index page" },
  },

  // fields/boolean — Index view with Published column showing green check + red X (matches the
  // doc's `field :is_published, as: :boolean, name: 'Published'` snippet). BooleanDemo resource
  // (Post-backed) exposes id, name and a virtual `published` field with true_value/false_value;
  // index_query limits to two rows with opposing values. Narrow 760px viewport (RULES 9b); sidebar
  // closed + mat bg (RULES 12/19a). Clip probed from `.card` (x8 y192 w744 h126) + ~10px mat.
  {
    id: "boolean-index",
    path: "/avo/resources/boolean_demos?per_page=4",
    viewport: { width: 760, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    clip: { x: 0, y: 182, width: 760, height: 191 },
    out: "docs/public/assets/img/4_0/fields/boolean.png",
    display: "full",
    alt: "An Avo index table with ID, Name and Published columns — a green check and a red X in the Published column.",
    source: { file: "docs/4.0/fields/boolean.md", prompt: "Boolean field shown as a green check and a red X on the Index view" },
  },

  // fields/boolean `nil_as_indeterminate` — Show view with a lone Verified field in its own card
  // rendering the gray minus-circle icon for nil. BooleanDemo#verified uses nil_as_indeterminate: true
  // and returns nil from a block. Clip probed from main .card (x8 y192 w744 h90) + ~10px mat.
  {
    id: "boolean-nil-indeterminate",
    path: "/avo/resources/boolean_demos/1",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    clip: { x: 0, y: 142, width: 900, height: 78 },
    out: "docs/public/assets/img/4_0/fields/boolean_nil_as_indeterminate.png",
    display: "full",
    alt: "Boolean field with nil_as_indeterminate showing a gray minus-circle icon",
    source: { file: "docs/4.0/fields/boolean.md", prompt: "Boolean field with nil_as_indeterminate showing a gray minus-circle icon" },
  },

  // map-view — Cities index in map view: view switcher (table/map), Mapbox map with city
  // markers and the adjacent index table (matches the Enable map view section). Sidebar closed
  // + mat bg (RULES 12/19a); extra settle for Mapbox tiles. Whole `.index-map-view` + ≤10px pad.
  {
    id: "map-view-index",
    path: "/avo/resources/cities?view_type=map&per_page=5",
    viewport: { width: 1280, height: 900 },
    settle: 1000,
    prepare: compose(closeSidebar, matBg, hideKbd, wait(2800)),
    selector: ".index-map-view",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/map-view/index.png",
    display: "full",
    alt: "The Cities resource in map view — the table/map view switcher, a Mapbox map with markers and the adjacent index table.",
    source: { file: "docs/4.0/map-view.md", prompt: "map view on the Cities index with the view switcher, Mapbox map and adjacent table" },
  },

  // map-view extra_markers — MapViewExtraDemo centred on the doc's Açores marker (label + tooltip
  // from the extra_markers snippet). One city record keeps the map view mounted; table hidden.
  {
    id: "map-view-extra-markers",
    path: "/avo/resources/map_view_extra_demos?view_type=map",
    viewport: { width: 1280, height: 900 },
    settle: 1000,
    prepare: compose(closeSidebar, matBg, hideKbd, wait(3500)),
    selector: ".map-component",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/map-view/extra-markers.png",
    display: "full",
    alt: "A map view zoomed on the Azores showing an extra marker labelled Açores with tooltip São Miguel.",
    source: { file: "docs/4.0/map-view.md", prompt: "map view extra marker with label Açores and tooltip São Miguel" },
  },

  // fields/avatar "index page" — the avatar field renders only on the Index view, showing
  // each record's avatar (or initials) in a small square cell. RESHAPED to a focused 3-column
  // table (RULES 10a/13): a minimal temp resource (AvatarDemo, backed by User) exposes only
  // id, `field :avatar, as: :avatar` and name, with `self.avatar` sourcing each user's
  // gravatar — so several rows show real avatar thumbnails matching the doc's bare
  // `field :avatar, as: :avatar`. per_page=6 keeps the table short with pagination; narrow
  // ~900px viewport (RULES 9a) keeps text ~1×. Sidebar closed + mat bg (RULES 12/19a); the
  // whole wrapping card is captured with a symmetric ≤10px pad (RULES 15e/15f/20).
  {
    id: "avatar-index",
    path: "/avo/resources/avatar_demos?per_page=6",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/avatar/index.png",
    display: "full",
    alt: "An Avo index table with three columns — ID, an Avatar column showing each user's square avatar thumbnail, and Name — illustrating the avatar field rendered on the Index view.",
    source: { file: "docs/4.0/fields/avatar.md", prompt: "index page" },
  },

  // fields/badge "all badge types per category" (placeholder under the H1) — the full badge
  // palette, GROUPED into the two categories the docs name: a "Base colors" panel (red, orange,
  // amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia,
  // pink, rose — 17) and a "Semantic colors" panel (neutral, info, success, warning, danger — 5).
  // Temp edit (Project resource, reverted): two `panel title: …` blocks of computed
  // `field :…, as: :badge, name: "", only_on: :show, width: 33, options: {color => Label} do Label
  // end` fields — each badge's value matches its own option key so every variant renders in its
  // real color, with the color name shown INSIDE the pill; width:33 (a legitimate field prop, not a
  // style hack) packs 3 badges per row so each panel reads as a tidy grid (RULES 15w — produced with
  // the real DSL). The badges render at their GENUINE native Avo size — NO pill-sizing CSS. The only
  // injected CSS hides the redundant per-badge field LABEL (.field-wrapper__label — layout, not
  // faking the component); the color name stays inside the pill. The category panel HEADERS ("Base
  // colors"/"Semantic colors") stay. Captured on the Project Show view, sidebar closed + mat bg
  // (RULES 12/19a). The two `.panel` blocks (data-item-index 13/14, probed) are framed together via
  // clipFrom (Base, top-left) + selector (Semantic, bottom-right) so BOTH category panels are wholly
  // in shot with a symmetric ≤10px pad (RULES 15e/15f); both panels are full content-width cards with
  // all four borders intact (RULES 15r, verified on dark). The real Avo BadgeField / BadgeComponent
  // expose NO size/variant prop (only color, style: solid/subtle, icon — grepped the gem), so there
  // is no genuine "larger badge" option to use. Prominence therefore comes ENTIRELY from FRAMING, not
  // from inflating the component: a NARROW ~640px viewport shrinks the panels' CSS width so the same
  // native badges fill more of the frame, and `display:"full"` makes the image fill the docs content
  // column — so the natively-small badges render a little larger without any badge CSS. STRUCTURE
  // shot (the whole palette at a glance).
  {
    id: "badge-types",
    path: "/avo/resources/projects/36",
    viewport: { width: 640, height: 2100 },
    settle: 900,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      injectCSS(`
        .panel[data-item-index="13"] .field-wrapper__label,
        .panel[data-item-index="14"] .field-wrapper__label { display: none !important; }
        /* Each badge field-wrapper carries a per-row border-bottom divider. In the
           under-populated final row (3-col grid, only 2 filled cells) the divider draws
           under just the filled cells, leaving a half-line dangling mid-card. Removing the
           row dividers (layout chrome, not the badge component) makes the palette read as a
           clean grid of pills with nothing to dangle (RULES 15i'/15r). */
        .panel[data-item-index="13"] .field-wrapper,
        .panel[data-item-index="14"] .field-wrapper { border-bottom: none !important; }
        /* The badge grid lays its field-wrappers in a flex-wrap row container
           (.description-list, justify-content:normal → left-packed). Each wrapper is a
           fixed 1/3 (w-1/3) cell, so full rows span the whole card and the under-populated
           final row hugs the left. Make the row container a centered flex-wrap, then shrink
           each cell to its pill so a row packs tightly and centers as a block. Probed
           computed: with only width:auto the cell still measured pill+32px because
           .field-wrapper__content carries 16px L/R padding (and a flex:1 1 0% content
           that re-stretches) so the pill left-hugged inside a padded cell, making the row read
           as edge-to-edge with uneven voids (the reviewer's "justify-between" look). The
           decisive fix is to collapse that padding and the inner flex stretch so the cell width
           EQUALS the pill width, then center the pill inside it. Now every cell is pill-tight,
           the 14px column gap is the only spacing, and justify-content:center centers BOTH the
           full rows and the short final rows. Layout chrome only; no change to badge
           color/size/count. */
        .panel[data-item-index="13"] .description-list,
        .panel[data-item-index="14"] .description-list {
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: center !important;
          align-content: center !important;
          gap: 10px 14px !important;
        }
        .panel[data-item-index="13"] .field-wrapper,
        .panel[data-item-index="14"] .field-wrapper {
          flex: 0 0 auto !important;
          width: auto !important;
          max-width: none !important;
          min-width: 0 !important;
          margin: 0 !important;
          justify-content: center !important;
        }
        /* Collapse the cell's own padding + inner flex stretch so the cell hugs the pill
           and the pill is centered within it (kills the left-hug / wide-void spread). */
        .panel[data-item-index="13"] .field-wrapper .field-wrapper__content,
        .panel[data-item-index="14"] .field-wrapper .field-wrapper__content {
          flex: 0 0 auto !important;
          width: auto !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          justify-content: center !important;
        }
        .panel[data-item-index="13"] .field-wrapper .field-wrapper__content-wrapper,
        .panel[data-item-index="14"] .field-wrapper .field-wrapper__content-wrapper {
          width: auto !important;
        }
      `),
    ),
    clipFrom: '.panel[data-item-index="13"]',
    selector: '.panel[data-item-index="14"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/badge/types.png",
    display: "full",
    alt: "Two Avo panels showing every badge color the field can render at its native size, grouped by category: a “Base colors” panel with red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink and rose badge pills, and a “Semantic colors” panel with neutral, info, success, warning and danger badge pills — each pill labelled with its color name.",
    source: { file: "docs/4.0/fields/badge.md", prompt: "all posible badges types split nice per categories no outside labels, the label should be inside the badge" },
  },

  // fields/checkbox_list "Field declaration example" (placeholder under the H1) — the
  // checkbox_list field shown WHOLE on a FORM (Edit) view, matching the adjacent code
  // (options built from real users with title/avatar_url/image_format/description +
  // inline_search: true). The prompt asks for a "gif … into the form" but this pipeline ships
  // STATIC light+dark PNGs, so we capture a representative form state of the complete component:
  // the inline-search input above the scrollable checkbox list, each row an avatar (circle) +
  // name + email description, with two options pre-checked (RULES 15y — show the whole
  // interactive component with all its controls on the Form view, not a read-only Show
  // projection). Per RULES 15z the field is wrapped in its OWN panel/card via a minimal temp
  // resource (CheckboxListDemo, backed by ::User) so Avo renders a real content-sized card that
  // HUGS just this field — true borders + rounded corners on all four sides, no border
  // neutralizing, no bare-mat fragment. A narrow ~760px viewport (RULES 9b) keeps the card
  // ~743px CSS so it displays ~1× and Avo STACKS the field below its "Team member" label
  // (label-above), giving a natural card shape instead of a zoomed-out strip. Sidebar closed +
  // mat bg (RULES 12/19a); hideKbd. Captured as the .card element with a symmetric ≤10px pad
  // (RULES 15e/15f). Temp edits (the resource, its controller, and a User#team_member_ids
  // accessor that pre-checks 2 options) are reverted after capture.
  {
    id: "checkbox-list-form",
    path: "/avo/resources/checkbox_list_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/checkbox_list/form.png",
    display: "full",
    alt: "An Avo edit-form card containing a checkbox_list field: a search input labelled to filter the options sits above a scrollable list of team members, each row showing a circular avatar, the person's name and their email as a description, with two options checked.",
    source: { file: "docs/4.0/fields/checkbox_list.md", prompt: "a gif with checkbox exemple into the form" },
  },

  // code — the doc's leading example is `field :custom_css, as: :code, theme: 'dracula',
  // language: 'css'`, so the shot shows the CodeMirror editor on a FORM (Edit) view in the
  // dracula theme with real CSS that highlights (selectors, properties, values colored) and the
  // gutter line numbers — the field's interactive editor in full (RULES 15y), not a read-only
  // Show projection. Per RULES 15z the field is wrapped in its OWN panel/card via a minimal temp
  // resource (CodeDemo, backed by ::User) so Avo renders a real content-sized card that HUGS just
  // this field — true borders + rounded corners on all four sides, no border neutralizing, no
  // bare-mat fragment. The CSS content is prefilled via a temp User#after_initialize that sets
  // custom_css ||= <css> (in-memory only, persists nothing; reverted after capture). A narrow
  // ~760px viewport (RULES 9b) keeps the card ~743px CSS so it displays ~1× and Avo STACKS the
  // editor below its "Custom css" label (label-above), a natural card shape not a zoomed-out
  // strip. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Captured as the .card element with a
  // symmetric ≤10px pad (RULES 15e/15f). Temp edits (the resource, its controller, the model
  // after_initialize) are reverted after capture.
  {
    id: "code-field-form",
    path: "/avo/resources/code_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/code/index.png",
    display: "full",
    alt: "An Avo edit-form card containing a code field: a CodeMirror editor in the dracula dark theme with line-number gutter, showing syntax-highlighted CSS (a .user-card rule with display, padding, border-radius and background properties).",
    source: { file: "docs/4.0/fields/code.md", prompt: "todo" },
  },

  // easy_mde — placeholder under the H1, prompt "from create page": the EasyMDE Markdown editor
  // as rendered on a CREATE/NEW (form) view (RULES 15q′ — the prompt names the create page, so we
  // capture exactly that). The shot shows the interactive editor in FULL (RULES 15y): its toolbar
  // (bold/italic/heading/list/link/preview buttons) above the CodeMirror text area pre-filled with
  // representative Markdown (a "Release notes" doc with headings, bold, a bullet list and a link),
  // so the reader sees the field's real affordances rather than a read-only Show projection. Per
  // RULES 15z the field is wrapped in its OWN panel/card via a minimal temp resource
  // (EasyMdeDemo, backed by ::User) so Avo renders a real content-sized card that HUGS just this
  // field — true borders + rounded corners on all four sides, no border neutralizing, no bare-mat
  // fragment. The Markdown is pre-filled via a temp User#after_initialize that sets
  // demo_markdown ||= <md> (in-memory only, persists nothing; reverted after capture). A narrow
  // ~760px viewport (RULES 9b) keeps the card ~743px CSS so it displays ~1× and Avo STACKS the
  // editor below its "Description" label (label-above), a natural card shape not a zoomed-out
  // strip. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Captured as the .card element with a
  // symmetric ≤10px pad (RULES 15e/15f). Temp edits (the resource, its controller, the model
  // accessor + after_initialize) are reverted after capture.
  {
    id: "easy-mde-form",
    path: "/avo/resources/easy_mde_demos/new",
    viewport: { width: 760, height: 1000 },
    settle: 1200,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:not(.relative)",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/easy_mde/form.png",
    display: "full",
    alt: "An Avo create-form card containing an easy_mde field: the EasyMDE Markdown editor with its toolbar (bold, italic, heading, lists, link and preview controls) above a text area pre-filled with sample Markdown — a Release notes document with a heading, bold text, a bullet list and a link.",
    source: { file: "docs/4.0/fields/easy_mde.md", prompt: "from create page" },
  },

  // files — view_type option, prompt "gif to see the difference between grid and list view types".
  // The pipeline produces static PNGs, not GIFs (RULES #3), so instead of a fake animation we
  // capture the files field in its visually-distinctive DEFAULT layout — the GRID view — with the
  // view-type SWITCHER visible (the list/grid toggle at the card's top-right, grid active). That
  // single static frame conveys the whole feature: the grid layout AND the control that flips it to
  // list. The files (plural) field — the only one carrying view_type — lives on Project; the demo
  // had ZERO attachments (PROCESS.md known limitation: a files field with nothing attached renders
  // only an empty dropzone), so we temp-attach 4 real demo photos to Project #1 (reusing the
  // Product image blob files) and PURGE them after capture, leaving demo data untouched. Per RULES
  // 15z the field is wrapped in its OWN panel/card via a minimal temp edit to the Project resource
  // (field :files, as: :files, name: "Documents") so Avo renders a real content-sized card that
  // HUGS just the field — true borders + 12px rounded corners on all four sides, no neutralizing,
  // no bare-mat fragment. At viewport 1100 the @container grid lands on 2 columns so the 4 photos
  // fill a balanced 2×2 (RULES 15k/15l/15x — every tile fully visible, no ragged half-row). Sidebar
  // closed + mat bg (RULES 12/19a); hideKbd hides the grid toggle's hotkey badge. Captured as the
  // .card element with a symmetric ≤10px pad (RULES 15e/15f). Temp edits (resource card + the 4
  // heading — placeholder under the H1, prompt "todo": the Heading field as it renders inside a
  // Show card, acting as a visual SECTION DIVIDER between groups of fields. A lone heading in an
  // empty card is meaningless (RULES 10b) — so the shot frames the heading WITH the fields it
  // separates: a "User information" heading above First name / Last name / Email, then a second
  // "Contact details" heading above Birthday / Membership, so the reader plainly sees it grouping
  // and titling sections. The heading text "User information" matches the doc's adjacent code
  // (`field :user_information, as: :heading` / label "user information", RULES 13). Per RULES 15z
  // the section is wrapped in its OWN panel/card via a minimal temp resource (HeadingDemo, backed
  // by ::User) so Avo renders a real content-sized card that HUGS just this group — true borders +
  // rounded corners on all four sides, no border neutralizing, no bare-mat fragment. Show view
  // (the heading renders on Show/Edit/Create; Show reads cleanest as a static section divider).
  // Paired fields share a row at width:50 so no ragged half-rows (RULES 15x). A narrow ~760px
  // viewport (RULES 9b) keeps the card ~743px CSS so it displays ~1×, label-above (stacked) fields.
  // Sidebar closed + mat bg (RULES 12/19a); hideKbd. Captured as the heading's card element with a
  // symmetric ≤10px pad (RULES 15e/15f). Temp edits (the resource + its controller) are reverted
  // after capture.
  {
    id: "heading-field",
    path: "/avo/resources/heading_demos/1",
    viewport: { width: 760, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:has([data-field-id='heading_user_information'])",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/heading/index.png",
    display: "full",
    alt: "An Avo show-view card with two heading fields acting as section dividers: a 'User information' heading above First name, Last name and Email fields, then a 'Contact details' heading above Birthday and Membership fields.",
    source: { file: "docs/4.0/fields/heading.md", prompt: "show page with heading fields separating User information and Contact details sections" },
  },

  // fields/key_value "KeyValue" — the key_value field as rendered on the CREATE (New) form, the
  // EDITABLE component with all its controls (RULES 15y: the Form view shows the `+` add-row button
  // in the header plus each row's drag handle + delete (trash) button — the Show projection drops
  // them). Prompt = "from create page", so the New form is mandated (RULES 15q′). Per RULES 15z the
  // field gets its OWN dedicated `panel do card do field :meta, as: :key_value end end` (matching the
  // doc snippet `field :meta, as: :key_value` verbatim, default labels Key/Value — RULES 13), so Avo
  // renders a real, content-sized card that HUGS just this one field with true borders + rounded
  // corners on all four sides (no neutralizing, no bare-mat fragment). Temp edits (reverted after
  // capture): Project resource wraps :meta in that panel/card (replacing its rich custom-labelled
  // field), and Project model gets `after_initialize { self.meta ||= {…} }` so the New form
  // pre-populates 3 realistic rows (environment: production, region: eu-west, tier: premium) and the
  // control reads as a real example, not an empty stub (RULES 15w). Capture the WHOLE card element
  // (`.card:has([data-field-type="key_value"])`) with symmetric ≤10px pad (RULES 15e/15f/15r — all
  // four borders included). Narrow viewport (1000) so the content-sized card displays near 1× at the
  // ~688px content column (RULES 9a/9b). Sidebar closed + mat bg (RULES 12/19a); hideKbd. Full display.
  {
    id: "key-value-form",
    path: "/avo/resources/projects/new",
    viewport: { width: 1000, height: 1400 },
    settle: 900,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-type="key_value"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/key_value/index.png",
    display: "full",
    alt: "An Avo New (create) form card showing a KeyValue field with three editable key/value rows (environment: production, region: eu-west, tier: premium), each row with a drag handle and a delete button, plus an add-row button in the Key/Value header.",
    source: { file: "docs/4.0/fields/key_value.md", prompt: "from create page" },
  },

  // location show map — Dashy dashboard `MapCard` partial card (`Avo::Cards::MapCard` on
  // `/avo/dashboards/dashy`): Google Maps embed in a compact-header card titled "Map card", with
  // "Open in Maps" and native map navigation controls. No Mapbox token needed (iframe). Scrolls
  // the card into view; 900px viewport; sidebar closed + mat bg; hideKbd; settle for iframe paint.
  {
    id: "location-show-map",
    path: "/avo/dashboards/dashy",
    viewport: { width: 900, height: 900 },
    settle: 2500,
    prepare: compose(closeSidebar, matBg, hideKbd, scrollTo('.card:has(iframe)')),
    selector: ".card:has(iframe)",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/location/show-map.png",
    display: "full",
    alt: "An Avo Map card on the Dashy dashboard showing an embedded Google Maps view of Manhattan with an Open in Maps link and map navigation controls.",
    source: { file: "docs/4.0/fields/location.md", prompt: "page with navigation map" },
  },

  // location `stored_as` — the City EDIT form with `stored_as: [:latitude, :longitude]` so Avo
  // renders two separate coordinate inputs (Latitude / Longitude) instead of one comma-joined field.
  // Per RULES 15z the field is wrapped in its OWN panel/card on the City resource (edit-only card
  // duplicate). No Mapbox token needed — the edit view shows the lat/long inputs without a map.
  // Narrow 760px viewport (RULES 9b); sidebar closed + mat bg; hideKbd. Captured as the whole
  // card with symmetric ≤10px pad. Temp edit to city.rb reverted after capture.
  {
    id: "location-stored-as",
    path: "/avo/resources/cities/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:has([data-field-id='coordinates'])",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/location/stored-as.png",
    display: "full",
    alt: "An Avo edit-form card showing a location field with stored_as configured: separate Latitude and Longitude text inputs side by side, prefilled with Paris coordinates.",
    source: { file: "docs/4.0/fields/location.md", prompt: "todo" },
  },

  // money "Example on new" — prompt "on create page": the money field on the product NEW (create)
  // form in its default closed state — amount input (0.00) beside the currency selector (USD),
  // with all four currencies configured (EUR / USD / RON / PEN per the doc's `currencies:` line,
  // RULES 13). Per RULES 15z the field is wrapped in its OWN panel/card via a temp edit to the
  // Product resource (`:price` re-scoped `only_on: %i[new edit]` inside `panel do card do … end
  // end`). A narrow ~760px viewport (RULES 9b) keeps the card ~743px CSS so it displays ~1× and
  // Avo STACKS the field below its "Price" label. Sidebar closed + mat bg (RULES 12/19a); hideKbd.
  // Captured as the .card element with a symmetric ≤10px pad (RULES 15e/15f). Temp edit reverted.
  {
    id: "money-create",
    path: "/avo/resources/products/new",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-type="money"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/money/form.png",
    display: "full",
    alt: "An Avo create-form card containing a money field: an amount input showing 0.00 beside a currency selector set to USD.",
    source: { file: "docs/4.0/fields/money.md", prompt: "on create page" },
  },

  // money "Example on new" — the money field on the New (create) form with its CURRENCY
  // SELECTOR showing the choices (prompt "gif with showing the dropdown selector"; the pipeline
  // ships static PNGs, so one static frame of the open selector). The currency selector is a
  // NATIVE <select> whose popup is OS-drawn and can't be screenshot, so per the openSelect
  // primitive we expand the REAL element to size=N — a legitimate HTML rendering of the same
  // element — so all four currency options (EUR / USD / RON / PEN, matching the doc's
  // `currencies: %w[EUR USD RON PEN]`, RULES 13) show inline as a visible list right beside the
  // amount input, in the field's trigger context (RULES 15a — the selector shown where it lives).
  // Per RULES 15z the field is wrapped in its OWN panel/card via a temp edit to the Product
  // resource (the existing `:price` money field re-scoped `only_on: %i[new edit]` inside a
  // `panel do card do … end end`), so Avo renders a real content-sized card that HUGS just this
  // field — true borders + rounded corners on all four sides, no neutralizing, no bare-mat
  // fragment. A narrow ~760px viewport (RULES 9b) keeps the card ~743px CSS so it displays ~1×
  // and Avo STACKS the field below its "Price" label. Sidebar closed + mat bg (RULES 12/19a);
  // hideKbd. Captured as the .card element with a symmetric ≤10px pad (RULES 15e/15f). Temp edit
  // reverted after capture.
  {
    id: "money-form-dropdown",
    path: "/avo/resources/products/new",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, openSelect("#product_price_currency"), wait(300)),
    selector: '.card:has([data-field-type="money"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/money/form-dropdown.png",
    display: "full",
    alt: "An Avo create-form card containing a money field: an amount input beside a currency selector expanded to show all four choices — EUR, USD, RON and PEN — listed inline.",
    source: { file: "docs/4.0/fields/money.md", prompt: "gif with showing the dropdown selector" },
  },

  // money "Example on show" — Price RON and Price USD in the main show card's description-list
  // (label left, value right, row dividers — same layout as ID/Name on any Avo show page). Fields
  // live at the top level of the Product resource in main.avodemo.com (not a nested panel). Captured
  // as the card's description-list region with symmetric ≤10px pad. Viewport ≥900px for inline rows.
  {
    id: "money-show-inline",
    path: "/avo/resources/products/1",
    viewport: { width: 900, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="price_ron"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/money/show-inline.png",
    display: "full",
    alt: "An Avo show-view card with two money fields on separate lines: Price RON showing 1,499.00 Lei on the first row and Price USD showing $199.00 on the second.",
    source: { file: "docs/4.0/fields/money.md", prompt: "show page with Price RON and Price USD on separate lines in the same card" },
  },

  // money "Example on show with currencies USD" (placeholder line 23, prompt "todo") — the money
  // field on the Show view rendering a value in USD ($199.00). Per RULES 15z the field is wrapped
  // in its OWN panel/card via a temp edit to the Product resource (a `panel do card do field
  // :price, as: :money, only_on: :show do Money.new(199_00, "USD") end end`), so Avo renders a
  // real content-sized card that HUGS just this field — true borders + rounded corners on all
  // four sides, no neutralizing, no bare-mat fragment (RULES 15t resolved). The "Price" label
  // matches the field name (RULES 13). A narrow ~760px viewport (RULES 9b) keeps the card ~743px
  // CSS so it displays ~1×, label-above. Sidebar closed + mat bg (RULES 12/19a); hideKbd.
  // Captured as the .card element with a symmetric ≤10px pad (RULES 15e/15f). Temp edit reverted.
  {
    id: "money-show-usd",
    path: "/avo/resources/products/1",
    viewport: { width: 760, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="price"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/money/show-usd.png",
    display: "full",
    alt: "An Avo show-view card containing a money field labelled Price, displaying the value $199.00 in US dollars.",
    source: { file: "docs/4.0/fields/money.md", prompt: "on show page" },
  },

  // money "Example on show with currencies RON" (placeholder line 27, prompt "todo") — the SAME
  // money field on the Show view rendering a value in RON (1,499.00 Lei), so the reader sees the
  // field formatting a different currency than the USD sibling. Per RULES 15z the field is wrapped
  // in its OWN panel/card via a temp edit to the Product resource (a `panel do card do field
  // :price_ron, as: :money, name: "Price", only_on: :show do Money.new(1_499_00, "RON") end end`),
  // so Avo renders a real content-sized card that HUGS just this field — true borders + rounded
  // corners on all four sides. The "Price" label matches the field name (RULES 13). A narrow
  // ~760px viewport (RULES 9b) keeps the card ~743px CSS so it displays ~1×, label-above. Sidebar
  // closed + mat bg (RULES 12/19a); hideKbd. Captured as the .card element with a symmetric ≤10px
  // pad (RULES 15e/15f). Temp edit reverted after capture.
  {
    id: "money-show-ron",
    path: "/avo/resources/products/1",
    viewport: { width: 760, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="price_ron"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/money/show-ron.png",
    display: "full",
    alt: "An Avo show-view card containing a money field labelled Price, displaying the value 1,499.00 Lei in Romanian leu (RON).",
    source: { file: "docs/4.0/fields/money.md", prompt: "show view card with price displayed in RON" },
  },

  // money "Example on index" — the money field as it renders in the Index TABLE view, showing
  // formatted prices per row (e.g. $199.00). SCOPED to ID, Title, Price (RULES 10a): records
  // 5 and 6 hidden via hideRecords; image/category columns hidden via hideIndexColumns.
  // Narrow ~900px viewport keeps the table at ~1× (RULES 9a). WHOLE table card captured
  // (`.card.relative.w-full`) with footer intact (RULES 4/10/20). `view_type=table` forces
  // the table view. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Symmetric ≤10px pad.
  {
    id: "money-index",
    path: "/avo/resources/products?view_type=table&per_page=6",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, hideRecords(5, 6), hideIndexColumns("image", "category")),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/money/index.png",
    display: "full",
    alt: "An Avo index table with three columns — ID, Title and Price — where the Price column shows each product's money field formatted as a currency value such as $199.00.",
    source: { file: "docs/4.0/fields/money.md", prompt: "index table with ID, Title and Price columns" },
  },

  // progress_bar — index table with ID, Name and Progress columns showing the progress element
  // per row (RULES 10a). Extra columns hidden via hideIndexColumns; sidebar closed + mat bg.
  {
    id: "progress-bar-index",
    path: "/avo/resources/projects?view_type=table&per_page=6",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      hideIndexColumns("stage", "status", "country", "users_required", "started_at", "files"),
    ),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/progress_bar/index.png",
    display: "full",
    alt: "An Avo index table with ID, Name and Progress columns where each row shows a progress bar with its percentage value.",
    source: { file: "docs/4.0/fields/progress_bar.md", prompt: "progress bar on the index table" },
  },

  // progress_bar — edit-form slider with max:150, step:10, display_value and value_suffix: "%"
  // matching the Examples block. ProgressBarDemo wraps the field in its own panel/card (RULES 15z).
  {
    id: "progress-bar-form",
    path: "/avo/resources/progress_bar_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card[data-item-index="0"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/progress_bar/form.png",
    display: "full",
    alt: "An Avo edit-form card containing a progress_bar field showing the value above a range slider configured with max 150, step 10 and a percent suffix.",
    source: { file: "docs/4.0/fields/progress_bar.md", prompt: "progress bar slider with max, step and suffix on edit form" },
  },

  // record_link — show-view card with a single record_link field linking to the related Post record.
  {
    id: "record-link-show",
    path: "/avo/resources/record_link_demos/1",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card[data-item-index="0"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/record_link/show.png",
    display: "full",
    alt: "An Avo show-view card containing a record_link field that displays a clickable link to the related Post record.",
    source: { file: "docs/4.0/fields/record_link.md", prompt: "record link field pointing to a related record" },
  },

  // table-view row_options — RowOptionsDemo index showing agent rows highlighted with
  // `bg-blue-50 dark:bg-blue-950/40` via table_view row_options (matches the doc snippet).
  // Temp demo files (reverted after capture): RowOptionsDemo resource + model fixture rows.
  {
    id: "table-view-row-options",
    path: "/avo/resources/row_options_demos?view_type=table",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, hideSummarizableIcons),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/table-view/row-options.png",
    display: "full",
    alt: "An Avo index table with ID, Name and Role columns where rows with role agent are highlighted with a light blue background via table_view row_options, while customer rows use the default background.",
    source: { file: "docs/4.0/table-view.md", prompt: "index table with agent rows highlighted using row_options class bg-blue-50" },
  },

  // status — StatusDemo index (ids 1–6) with ID, Name, Status and Stage (badge) columns. Fixture
  // rows cover loading (running, pending), failed, success (done, success) and neutral (archived).
  // No summarizable icons. Temp demo files reverted after capture.
  {
    id: "status-index",
    path: "/avo/resources/status_demos?view_type=table",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd, hideSummarizableIcons),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/status/index.png",
    display: "full",
    alt: "An Avo index table with ID, Name, Status and Stage columns where Status rows show loading, pending, failed, success and neutral indicators and Stage rows show colored badges.",
    source: { file: "docs/4.0/fields/status.md", prompt: "index table with ID, Name and Status columns showing loading, failed, success and neutral status states" },
  },

  // time — TimeDemo edit form with the flatpickr time picker open (no calendar), matching the
  // adjacent code's picker_format, format and time_24hr options.
  {
    id: "time-form-picker",
    path: "/avo/resources/time_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      click('[data-field-id="starting_at"] input.form-control.input'),
      wait(500),
    ),
    // Card (y≈192 h≈98) + flatpickr popup (y≈271 h≈40) + ~10px symmetric mat — no empty space below.
    clip: { x: 0, y: 182, width: 760, height: 140 },
    out: "docs/public/assets/img/4_0/fields/time/form-picker.png",
    display: "full",
    alt: "An Avo edit-form card containing a time field with the flatpickr time picker open, showing hours and minutes in 24-hour format without a calendar.",
    source: { file: "docs/4.0/fields/time.md", prompt: "time field on the edit form with the flatpickr time picker open showing hours and minutes without a calendar" },
  },

  // rhino — RhinoDemo edit form: full card with the Rhino WYSIWYG toolbar and sample body content.
  {
    id: "rhino-form",
    path: "/avo/resources/rhino_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 1200,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card[data-item-index="0"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/rhino/form.png",
    display: "full",
    alt: "An Avo edit-form card with a Rhino WYSIWYG editor showing the formatting toolbar above a text area with sample content.",
    source: { file: "docs/4.0/fields/rhino.md", prompt: "GIF showing the options with exemple" },
  },

  // trix — TrixDemo edit form: full card with the Trix toolbar, attachment button, and sample body.
  {
    id: "trix-form",
    path: "/avo/resources/trix_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 1200,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card[data-item-index="0"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/fields/trix/form.png",
    display: "full",
    alt: "An Avo edit-form card with a Trix WYSIWYG editor showing the formatting toolbar above a text area with sample body content.",
    source: { file: "docs/4.0/fields/trix.md", prompt: "trix editor on the edit form with toolbar and sample body content" },
  },

  // customizable-controls — Fish Show page: full panel (header + body card) with the header
  // tools area highlighted (show_controls: back, links, delete, actions, edit).
  {
    id: "customizable-controls-panel",
    path: "/avo/resources/fish/1",
    viewport: { width: 1000, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    clipFrom: '.header[data-item-index="1"]',
    selector: '.panel[data-item-index="2"]',
    pad: { x: 10, y: 12 },
    marks: [{ selector: '.header[data-item-index="1"] .header__controls', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/customizable-controls/panel.png",
    display: "full",
    alt: "An Avo Show page panel with the record title and customizable controls highlighted in the header tools area, above a card listing the record fields.",
    source: { file: "docs/4.0/customizable-controls.md", prompt: "full show page panel with the customizable controls highlighted in the header tools area" },
  },

  // customizable-controls — Fish index table row controls (row_controls): hover a row so the
  // customized controls strip is visible, capture the .resource-controls group tight.
  {
    id: "customizable-controls-row",
    path: "/avo/resources/fish?view_type=table&per_page=6",
    viewport: { width: 1200, height: 900 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      hover("table tbody tr:first-child"),
      wait(600),
    ),
    selector: "table tbody tr:first-child .resource-controls",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/customizable-controls/row-controls.png",
    display: "full",
    alt: "An Avo index table row showing customized row controls: a Release action button, edit, show and delete icons, an Actions menu, and icon links.",
    source: { file: "docs/4.0/customizable-controls.md", prompt: "customized row controls on an index table row" },
  },

  // map-view — Cities index in map view (view switcher + Mapbox map + table).
  {
    id: "map-view-index",
    path: "/avo/resources/cities?view_type=map&per_page=5",
    viewport: { width: 1440, height: 1200 },
    settle: 3500,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".index-map-view",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/map-view/index.png",
    display: "full",
    alt: "The Cities index in map view with the view switcher, a Mapbox map showing record markers, and the adjacent records table.",
    source: { file: "docs/4.0/map-view.md", prompt: "map view on the Cities index with the view switcher, Mapbox map and adjacent table" },
  },

  // map-view — extra_markers: green marker labeled Açores with tooltip São Miguel (Azores).
  {
    id: "map-view-extra-marker",
    path: "/avo/resources/map_extra_marker_demos?view_type=map",
    viewport: { width: 1440, height: 1200 },
    settle: 4000,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      async (page) => {
        const map = page.locator(".mapboxgl-map").first();
        await map.waitFor({ state: "visible", timeout: 15000 });
        const box = await map.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        }
        await wait(1000)(page);
      },
    ),
    selector: ".map-component",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/map-view/extra-markers.png",
    display: "full",
    alt: "A Mapbox map zoomed on the Azores with a green extra marker labeled Açores and a tooltip reading São Miguel.",
    source: { file: "docs/4.0/map-view.md", prompt: "map view extra marker with label Açores and tooltip São Miguel" },
  },

  // resource-panels — intro: full resource show page with app sidebar visible (v3-style overview).
  {
    id: "resource-panels-intro",
    path: "/avo/resources/resource_panels_computed_demos/1",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(
      async (page) => {
        await page.context().addCookies([
          { name: "avo.sidebar.open", value: "1", url: new URL(page.url()).origin },
        ]);
        await page.reload({ waitUntil: "networkidle" });
      },
      hideKbd,
    ),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
    out: "docs/public/assets/img/4_0/resource-panels/panel.png",
    display: "full",
    alt: "An Avo resource show page with the sidebar navigation visible and a panel in the main content area listing record fields.",
    source: { file: "docs/4.0/resource-panels.md", prompt: "Avo resource show page panel with header title and a body card listing record fields" },
  },

  // resource-panels — show page: record header (title + actions), root fields, named panel.
  {
    id: "resource-panels-root-and-panel",
    path: "/avo/resources/user_panels_demos/2",
    viewport: { width: 1000, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg),
    clipFrom: '.header[data-item-index="1"]',
    selector: '.panel[data-item-index="3"]',
    pad: { x: 10, y: 12 },
    out: "docs/public/assets/img/4_0/resource-panels/root-and-panel.png",
    display: "full",
    alt: "An Avo show page with the record title and action buttons in the header, a main panel card with ID and User Email fields, and a named User information panel with First name, Last name, and Is active.",
    source: { file: "docs/4.0/resource-panels.md", prompt: "User show page with root id and User Email fields plus a named User information panel with description, first name, last name, and Is active fields" },
  },

  // resource-panels — computed main panel with id, name, user, and type (example 1).
  {
    id: "resource-panels-computed-main",
    path: "/avo/resources/resource_panels_computed_demos/1",
    viewport: { width: 1000, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    clipFrom: '.header[data-item-index="1"]',
    selector: '.panel[data-item-index="2"]',
    pad: { x: 10, y: 12 },
    out: "docs/public/assets/img/4_0/resource-panels/computed-main.png",
    display: "full",
    alt: "An Avo show page with a single computed main panel containing ID, Name, User, and Type fields.",
    source: { file: "docs/4.0/resource-panels.md", prompt: "Show page with a single computed main panel containing id, name, user, and type fields" },
  },

  // resource-panels — computed split: main panel (id, name), reviews has_many, panel (user, type).
  {
    id: "resource-panels-split",
    path: "/avo/resources/resource_panels_split_demos/1",
    viewport: { width: 1000, height: 900 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      async (page) => {
        await page.locator("#has_many_field_show_reviews[complete]").waitFor({ timeout: 15000 });
        await wait(600)(page);
      },
    ),
    clipFrom: '.panel[data-item-index="2"]',
    selector: '.panel[data-item-index="4"]',
    pad: { x: 10, y: 12 },
    out: "docs/public/assets/img/4_0/resource-panels/split-panels.png",
    display: "full",
    alt: "An Avo show page with a computed main panel for ID and Name, a Reviews has_many association panel, and a second panel for User and Type.",
    source: { file: "docs/4.0/resource-panels.md", prompt: "Show page with a computed main panel for id and name, a reviews has_many panel, and a simple panel for user and type fields" },
  },

  // resource-panels — manual order: user/type panel, reviews, then main panel (id, name).
  {
    id: "resource-panels-custom-order",
    path: "/avo/resources/resource_panels_custom_order_demos/1",
    viewport: { width: 1000, height: 900 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      async (page) => {
        await page.locator("#has_many_field_show_reviews[complete]").waitFor({ timeout: 15000 });
        await wait(600)(page);
      },
    ),
    clipFrom: '.panel[data-item-index="2"]',
    selector: '.panel[data-item-index="4"]',
    pad: { x: 10, y: 12 },
    out: "docs/public/assets/img/4_0/resource-panels/custom-order.png",
    display: "full",
    alt: "An Avo show page with panels in custom order: User and Type first, a Reviews has_many panel, then the main panel with ID and Name.",
    source: { file: "docs/4.0/resource-panels.md", prompt: "Show page with panels in custom order: user and type panel first, reviews has_many panel, then main panel with id and name" },
  },

  // resource-panels — index view shows only root/main_panel fields (id, email, name).
  {
    id: "resource-panels-index",
    path: "/avo/resources/user_panels_demos?view_type=table&per_page=6",
    viewport: { width: 1200, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/resource-panels/index-view.png",
    display: "full",
    alt: "An Avo index table listing ID, User Email, and Name columns while panel-only fields stay off the index view.",
    source: { file: "docs/4.0/resource-panels.md", prompt: "Users index table showing only root and main_panel fields with panel fields hidden" },
  },

  // tabs — TabsDemo show page matching the adjacent `tabs do` example: root id + User Email panel,
  // tab switcher (User information, Teams, People, Spouses, Projects), and the active User
  // information panel (first name, last name, Is active). clipFrom main panel through user-info
  // panel so the tab bar sits between them (RULES 13/15e). Sidebar closed + mat bg (12/19a).
  // `.tab-group` ships a dashed outer border in the product UI — hidden for docs (not the subject).
  {
    id: "tabs-show",
    path: "/avo/resources/tabs_demos/2",
    viewport: { width: 1100, height: 900 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(
        ".tab-group { border: none !important; outline: none !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; margin-inline: 0 !important; padding: 0 !important; }",
      ),
    ),
    clipFrom: ".panel[data-item-index=\"2\"]",
    selector: ".panel[data-item-index=\"0\"]",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/tabs/show.png",
    display: "full",
    alt: "An Avo User show page with id and User Email in the main panel, a tab switcher listing User information, Teams, People, Spouses and Projects, and the User information panel showing first name, last name and the Is active boolean.",
    source: {
      file: "docs/4.0/tabs.md",
      prompt:
        "User show page with id and User Email in the main panel, tab switcher with User information Teams People Spouses and Projects tabs, and the User information panel showing first name last name and Is active",
    },
  },

  // tabs — tab `description` tooltip on hover (User information → "Some information about this user").
  // clipFrom the tippy box through the tablist — avoids a large top pad that clips the main panel border above.
  {
    id: "tabs-tab-description",
    path: "/avo/resources/tabs_demos/2",
    viewport: { width: 1100, height: 700 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(
        ".tab-group { border: none !important; outline: none !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; margin-inline: 0 !important; padding: 0 !important; }",
      ),
      hover(".tabs__item[data-tabs-tab-name-param=\"User information\"]"),
      wait(800),
    ),
    clipFrom: ".tippy-box",
    selector: '[role="tablist"]',
    pad: { x: 20, top: 0, bottom: 10 },
    out: "docs/public/assets/img/4_0/tabs/tab-description.png",
    display: "half",
    alt: "The Avo tab switcher with the User information tab hovered, showing a tooltip with the description Some information about this user.",
    source: {
      file: "docs/4.0/tabs.md",
      prompt: "Avo tab switcher with a tab label and its description tooltip visible on hover",
    },
  },
];

// ---- GIF specs — animated demos; record-gif.mjs drives each spec's steps(page, snap) -------
// Same idea as SPECS, for GIFs. Append a spec here when a shot must animate. Starts empty.
export const GIF_SPECS = [
  // money-currency-dropdown ("gif with showing the dropdown selector", placeholder money.md line 19,
  // kind="gif") — the money field's currency selector on the product NEW form, animated: the closed
  // state (amount input beside the currency picker), then the selector expanded to reveal all four
  // currencies (EUR / USD / RON / PEN — matching the doc's `currencies: %w[EUR USD RON PEN]`, RULES
  // 13), then the selection stepping down through each currency before settling. The native OS
  // <select> popup renders OUTSIDE the page (not screenshot-able), so we expand the REAL element to
  // size=N — a legitimate HTML rendering of the same element — so the options show inline as a
  // visible list right beside the amount input, in the field's trigger context (RULES 15a). Per RULES
  // 15z the field is wrapped in its OWN panel/card via a temp edit to the Product resource (`:price`
  // re-scoped `only_on: %i[new edit]` inside a `panel do card do … end end`), so Avo renders a real
  // content-sized card that HUGS just this field — true borders + rounded corners on all four sides,
  // no neutralizing, no bare-mat fragment. A narrow 760px viewport (RULES 9b) keeps the card ~744px
  // CSS so it displays ~1× and Avo STACKS the field below its "Price" label. Sidebar closed + mat bg
  // (RULES 12/19a); hideKbd. Clip framed from the probed card box (closed x8 y384 w744 h98 → open
  // h144 once expanded) + ~8px symmetric horizontal mat (card sits at x8, the page centres it) and
  // ~10px vertical mat, sized to the OPEN (tallest) state so no frame edge slices the card. Temp
  // edit reverted after capture.
  {
    id: "money-currency-dropdown",
    path: "/avo/resources/products/new",
    viewport: { width: 760, height: 900 },
    settle: 800,
    clip: { x: 0, y: 374, width: 760, height: 164 },
    width: 760,
    delay: 22,
    steps: async (page, snap) => {
      await closeSidebar(page); // cookie + reload → content reflows full-width (RULES 12)
      await matBg(page); // docs-mat bg + drop sidebar divider (RULES 19/19a)
      await hideKbd(page);
      await page.waitForTimeout(300);

      const select = page.locator("#product_price_currency");
      await select.scrollIntoViewIfNeeded();
      await snap(7); // hold ~1.5s on the closed state — amount input + currency picker

      // Expand the real <select> inline so all four currencies show as a visible list (RULES 15a:
      // shown in the field's context). The native OS popup can't be captured, so we size it open.
      await openSelect("#product_price_currency")(page);
      await page.waitForTimeout(300);
      await snap(7); // hold ~1.5s on the open list — EUR / USD / RON / PEN all visible

      // Walk the selection down each currency so the highlighted option moves through the list.
      for (const code of ["EUR", "USD", "RON", "PEN"]) {
        await select.selectOption(code);
        await page.waitForTimeout(180);
        await snap(5); // pause ~1.1s on each highlighted currency
      }

      await select.selectOption("RON"); // settle on a non-default pick
      await page.waitForTimeout(180);
      await snap(8); // hold longer at the end on the chosen currency before the loop repeats
    },
    out: "docs/public/assets/img/4_0/fields/money/currency-dropdown.gif",
    alt: "An Avo create-form card with a money field: an amount input beside a currency selector that expands to reveal all four choices — EUR, USD, RON and PEN — with the selection stepping through each one.",
    source: { file: "docs/4.0/fields/money.md", prompt: "gif with showing the dropdown selector" },
  },

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

  // checkbox_list "a gif where we select multiple options" (placeholder checkbox_list.md line 28) —
  // the checkbox_list field on the CheckboxListDemo edit form (matches the adjacent code:
  // team_member_ids + inline_search + avatar/title/description options). Animated: start with
  // none checked, then click three options one-by-one so the reader sees multi-select in action.
  // Per RULES 15z the field sits in its OWN panel/card (CheckboxListDemo resource); options are
  // capped at 6 users so the list fits without scrolling. Sidebar closed + mat bg (RULES 12/19a);
  // hideKbd. Clip = probed card box (x9 y192 w743 h458) + ~10px symmetric mat (x0 y182 w760 h478).
  {
    id: "checkbox-list-select",
    path: "/avo/resources/checkbox_list_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    clip: { x: 0, y: 182, width: 760, height: 478 },
    width: 760,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(300);

      await page.locator('[data-field-type="checkbox_list"]').scrollIntoViewIfNeeded();
      await snap(6); // ~1.2s — empty selection, search + list visible

      const boxes = page.locator('.checkbox-list__row input[type="checkbox"]');
      for (let i = 0; i < 3; i++) {
        await boxes.nth(i).click();
        await page.waitForTimeout(220);
        await snap(5); // pause on each newly checked row
      }

      await snap(8); // hold longer on the three-selected end state
    },
    out: "docs/public/assets/img/4_0/fields/checkbox_list/select.gif",
    alt: "An Avo edit-form card containing a checkbox_list field: an animation that checks three team members one after another from an initially empty selection.",
    source: { file: "docs/4.0/fields/checkbox_list.md", prompt: "a gif where we select multiple options" },
  },

  // files view_type — toggle grid ↔ list on the Project show-view files card. Uses exactly TWO seed
  // images (iphone / macbook). Clip spans grid→list reflow (card y shifts on toggle) with mat above
  // grid and below list, staying clear of the Meta field.
  {
    id: "files-view-type",
    path: "/avo/resources/projects/1",
    viewport: { width: 1100, height: 1000 },
    settle: 900,
    clip: { x: 14, y: 517, width: 1072, height: 269 },
    width: 1200,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        document.querySelector(".card:has([data-field-id='files'])")?.scrollIntoView({ block: "start" });
      });
      await page.waitForTimeout(300);
      // Toggling grid↔list changes page height; the browser auto-scrolls (~39px) and the fixed
      // clip loses the card. Pin scrollY after the initial framing and restore before every snap.
      const scrollY = await page.evaluate(() => window.scrollY);
      const lockScroll = async () => {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(80);
      };

      await lockScroll();
      await snap(6); // grid view (default)

      await page.locator('a[data-control="view-type-toggle-list"]').click();
      await page.waitForTimeout(500);
      await lockScroll();
      await snap(10); // list view — two rows + full card border

      await page.locator('a[data-control="view-type-toggle-grid"]').click();
      await page.waitForTimeout(400);
      await lockScroll();
      await snap(6); // back to grid
    },
    out: "docs/public/assets/img/4_0/fields/files/view-type.gif",
    alt: "An Avo show-view card for a files field: an animation toggling between grid view (thumbnail tiles) and list view (file rows) using the view-type switcher.",
    source: { file: "docs/4.0/fields/files.md", prompt: "gif to see the difference between grid and list view types" },
  },

  // markdown — Marksmith Write tab with prefilled example markdown, then Preview tab showing rendered
  // HTML. Temp edit: project.rb wraps :description (name "Body") in its own panel/card with a
  // `default:` of example markdown on the New form.
  {
    id: "markdown-field",
    path: "/avo/resources/projects/new",
    viewport: { width: 1000, height: 1400 },
    settle: 900,
    clip: { x: 6, y: 892, width: 988, height: 422 },
    width: 1000,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(300);
      await page.locator(".card:has(.marksmith)").scrollIntoViewIfNeeded();
      await snap(6); // Write tab with example markdown

      await page.locator(".marksmith-preview-tab").click();
      await page.waitForTimeout(700);
      await snap(10); // Preview rendered

      await page.locator(".marksmith-write-tab").click();
      await page.waitForTimeout(300);
      await snap(5);
    },
    out: "docs/public/assets/img/4_0/fields/markdown/markdown-field.gif",
    alt: "An Avo New (create) form card showing the Markdown field powered by Marksmith: an animation switching from the Write tab (example markdown with heading, list, blockquote, link and code block) to the Preview tab showing the rendered HTML.",
    source: { file: "docs/4.0/fields/markdown.md", prompt: "create a gif that will display how markdown is working with some exemples" },
  },

  // preview — hover the preview icon on the Teams index to reveal the preview popover (RULES 15a).
  // Hide the dynamic-filters bar (Add filter / Reset filters). Clip includes the FULL index search
  // + Filters/view-toggle row (y≈187) — the old y=205 top sliced those controls in half. Sized
  // through pagination bottom + both hover popovers (row 3 y≈215, row 4 y≈262).
  {
    id: "preview-field",
    path: "/avo/resources/teams?per_page=6",
    viewport: { width: 900, height: 950 },
    settle: 800,
    clip: { x: 0, y: 167, width: 900, height: 438 },
    width: 900,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await injectCSS(".main-filters-panel { display: none !important; }")(page);
      await page.waitForTimeout(300);
      await snap(6);

      const trigger = page.locator('table tbody tr:nth-child(3) [data-field-type="preview"] a');
      await trigger.hover();
      await page.waitForTimeout(400);
      await trigger.focus();
      await page.waitForTimeout(900);
      await snap(12);

      const trigger2 = page.locator('table tbody tr:nth-child(4) [data-field-type="preview"] a');
      await trigger2.hover();
      await trigger2.focus();
      await page.waitForTimeout(900);
      await snap(8);
    },
    out: "docs/public/assets/img/4_0/fields/preview/index.gif",
    alt: "An Avo Teams index table where hovering the preview icon on a row opens a popup showing that record's preview fields.",
    source: { file: "docs/4.0/fields/preview.md", prompt: "gif with the the preview" },
  },

  // radio — click through the three role options on the RadioDemo edit form (RULES 13: labels match doc).
  // Clip frames the WHOLE card (probed x8 y192 w744 h142) + ~10px symmetric mat on all sides.
  {
    id: "radio-select",
    path: "/avo/resources/radio_demos/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    clip: { x: 0, y: 182, width: 760, height: 162 },
    width: 760,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(300);
      await snap(6);

      for (const label of ["Manager", "Writer", "Administrator"]) {
        await page.locator(`[data-field-type="radio"] label:has-text("${label}")`).click();
        await page.waitForTimeout(250);
        await snap(6);
      }
      await snap(8);
    },
    out: "docs/public/assets/img/4_0/fields/radio/form.gif",
    alt: "An Avo edit-form card with a radio field labelled User role, animating through Administrator, Manager and Writer options.",
    source: { file: "docs/4.0/fields/radio.md", prompt: "GIF with select options" },
  },

  // tags — TagsDemo NEW form → pick one & two from suggestions → Save → Show with tags.
  // Fresh framing (2026-06-23): probed `.panel-spacer` on create (x8 y104 w744 h477) so the
  // clip includes the page header (title + Save) AND the full form card — dropdown opens over
  // Category/Notes/Reference inside the card. Spacer fields also render on Show so the card keeps
  // a similar height after save. Fixed clip on every frame: x0 y96 w760 h493 (+8px mat).
  {
    id: "tags-create-save",
    path: "/avo/resources/tags_demos/new",
    viewport: { width: 760, height: 900 },
    settle: 800,
    clip: { x: 0, y: 96, width: 760, height: 493 },
    width: 760,
    delay: 24,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      const tagsField = page.locator('[data-field-id="tags"]');
      const tagsInput = tagsField.locator(".tagify__input");

      await tagsField.scrollIntoViewIfNeeded();
      await snap(7); // create form — header + empty tags card

      await tagsInput.click();
      await page.waitForTimeout(500);
      await snap(10); // suggestions dropdown open

      await page.locator('.tagify__dropdown__item[label="one"]').click();
      await page.waitForTimeout(400);
      await snap(7); // first suggestion picked

      await page.locator('.tagify__dropdown__item[label="two"]').click();
      await page.waitForTimeout(400);
      await snap(7); // both tags selected

      await page.locator('[data-resource-edit-target="saveButton"]').click();
      await page.waitForURL(/\/avo\/resources\/tags_demos\/\d+(?!\/edit)/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(700);
      await snap(12); // saved tags on Show
    },
    out: "docs/public/assets/img/4_0/fields/tags/create-save.gif",
    alt: "An Avo create form with a tags field: the animation opens the suggestions dropdown, picks one and two, saves the record, and shows the tags on the Show view.",
    source: { file: "docs/4.0/fields/tags.md", prompt: "gif on the create form adding tags from suggestions and saving to see them on show" },
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

// ---- NATIVE specs — headed + macOS screencapture; for OS-drawn widgets the headless page
// screenshot can't see (native <select> dropdown popups). Driven by record-native.mjs. macOS-only.
export const NATIVE_SPECS = [
  // money currency picker — the REAL native <select> dropdown on the product new form. The popup
  // is OS-drawn (outside the page surface), so we capture it via screencapture: open it, then
  // arrow the highlight down through EUR → USD → RON → PEN. clip is computed from the field's live
  // box plus a downward allowance for where the popup renders (its geometry isn't in the DOM).
  {
    id: "money-currency-native",
    path: "/avo/resources/products/new",
    viewport: { width: 1280, height: 900 },
    settle: 700,
    width: 900,
    delay: 24,
    prepare: async (page) => {
      await closeSidebar(page); // content reflows full-width
      await matBg(page); // docs mat background
      await hideKbd(page);
    },
    // field row (label + amount + currency select) for context + ~150px below for the popup.
    clip: async (page) => {
      const f = await page.locator('[data-field-id="price"]').boundingBox();
      return { x: Math.max(0, f.x - 10), y: Math.max(0, f.y - 10), width: f.width + 20, height: f.height + 150 };
    },
    steps: async (page, snap, os) => {
      const select = page.locator("#product_price_currency");
      await select.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await snap(6); // closed: amount input + "USD" picker with chevron (also caches the rect)

      // A native <select> popup only opens on a genuine OS click (Chromium ignores synthetic
      // Playwright/CDP events for this), so click it via cliclick. Once open it's modal — no
      // page.evaluate beyond this point (the rect is already cached) and keys go via the OS too.
      await os.click("#product_price_currency");
      await page.waitForTimeout(550);
      await snap(7); // open: EUR / USD / RON / PEN as the real macOS popup

      // walk the highlight down each currency (OS keystrokes reach the open native popup)
      for (let k = 0; k < 3; k++) {
        await os.key("arrow-down");
        await page.waitForTimeout(280);
        await snap(5);
      }
      await os.key("return"); // commit the pick, popup closes
      await page.waitForTimeout(300);
      await snap(6); // closed again, showing the chosen currency
    },
    out: "docs/public/assets/img/4_0/fields/money/currency-dropdown.gif",
    alt: "The money field's native currency dropdown open on the product form, stepping through EUR, USD, RON and PEN.",
    source: { file: "docs/4.0/fields/money.md", prompt: "gif with showing the dropdown selector" },
  },
];

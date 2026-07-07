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

import { compose, closeSidebar, matBg, hideKbd, hideRecords, hideIndexColumns, neutralizeBorders, hover, focus, wait, injectCSS, openSelect, click, hideSummarizableIcons, scrollTo, addDynamicFilter, expandFilterConditions, openFilterCalendar, hideUnder } from "./prepare.mjs";

// dynamic-filters (avo-advanced) — add ONE filter via the DSL "Add filter" dropdown; frame the
// filters bar + open filter-card popover over a 6-row index table (sidebar closed, mat bg).
// Popover gap: the fix in avo-dynamic_filters swaps the filter panel's `-mt-1` (which pulls the
// card UP, overlapping the trigger) for `.dynamic-filter-dropdown-popover` → top: calc(100% + 2px),
// a 2px gap below the trigger. dfPopoverGapFix mirrors that when the demo runs a packaged gem
// WITHOUT the fix: beta.13's panel has no such class — the `<dialog class="dropdown-popover … -mt-1">`
// carries the offset — so we also target the filter dialog directly (scoped via the menu class) and
// neutralize `-mt-1`. Covers both the patched (class present) and unpatched (beta.13) gems.
const dfPopoverGapFix = injectCSS(`
  .dynamic-filter-dropdown-popover,
  dialog.dropdown-popover:has(.dynamic-filter-dropdown-menu) {
    top: calc(100% + 2px) !important;
    margin-top: 0 !important;
  }
`);

const dfHideSelectColumn = injectCSS(`
  th[data-control="item-select-th"], td[data-control="item-select-td"] { display: none !important; }
`);

// Index tables: max 4 columns — id, name (first_name on Users), status, active where present.
const dfHideUsersColumns = hideIndexColumns(
  "email", "last_name", "is_admin", "user_status", "progress", "birthday", "is_writer", "cv", "roles",
);
const dfHideTeamsColumns = hideIndexColumns("preview", "logo", "created_at", "members_count", "admin");
const dfHideCoursesColumns = hideIndexColumns("has_skills", "skills", "country", "city", "links");

const dfUsersPrepare = (label, ...extra) => compose(
  closeSidebar, matBg, hideKbd, dfPopoverGapFix, dfHideSelectColumn, dfHideUsersColumns, addDynamicFilter(label), ...extra,
);
const dfTeamsPrepare = (label, ...extra) => compose(
  closeSidebar, matBg, hideKbd, dfPopoverGapFix, dfHideSelectColumn, dfHideTeamsColumns, addDynamicFilter(label), ...extra,
);
const dfCoursesPrepare = (label, ...extra) => compose(
  closeSidebar, matBg, hideKbd, dfPopoverGapFix, dfHideSelectColumn, dfHideCoursesColumns, addDynamicFilter(label), ...extra,
);

// Clips for dynamic-filter docs: filters row → table (6 per page) → pagination.
const DF_CLIP_USERS = { x: 14, y: 600, width: 1412, height: 435 };
const DF_CLIP_SIMPLE = { x: 14, y: 210, width: 1412, height: 410 };
const DF_CLIP_DATE_CAL = { x: 14, y: 210, width: 1412, height: 521 };

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
  // resource-tool-partial (resource-tools.md) — a custom resource tool rendered as a panel on a
  // record Show view, showing the default generated partial ("Post info" title, the "waiting to be
  // updated" body with the two file-path codes, the primary "Dummy link" button). The demo's User
  // resource registers `Avo::ResourceTools::UserTool` (visible on Show); the `_user_tool.html.erb`
  // partial is temp-rewritten to the doc's generated default (title "Post info", paths
  // post_info.html.erb / post_info.rb — RULES 13, matching the doc snippet) for the capture, then
  // reverted with `git checkout`. The tool renders as `div.flex.flex-col > div.panel` (unique on the
  // page). Sidebar closed + mat bg (RULES 12/19a); hideKbd. Whole panel via selector + symmetric
  // ≤10px pad so all four borders + the controls bar are in shot (RULES 15e/10b).
  {
    id: "resource-tool-partial",
    path: "/avo/resources/users/1",
    viewport: { width: 1200, height: 1700 },
    settle: 900,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: "div.flex.flex-col > div.panel",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/resource-tools/resource-tool-partial.png",
    display: "full",
    alt: "An Avo custom resource tool rendered as a panel on a record Show view, titled “Post info” with a primary Dummy link button.",
    source: { file: "docs/4.0/resource-tools.md", prompt: "a custom resource tool partial rendered as a panel on a record Show view" },
  },

  // field-options "Change field name" — a boolean field whose Index column header shows the
  // custom label set via `name:` ("Availability"). RESHAPED to a single-column shot (RULES
  // 9a/10a): temp-hid the Skills/Country/City/Links index fields so only ID, Name and the renamed
  // boolean "Availability" column remain, small per_page (4) + a narrow ~900px viewport so the
  // header reads at ~1× — not a full wide table. Temp-set Course#has_skills `name: "Availability"`
  // to match the doc snippet (RULES 13). Sidebar closed + mat bg (RULES 12/19a). The "Availability"
  // header is a non-sortable `<div>` (not focusable), so the native ring (15b) can't apply — mark
  // the header TEXT extent with a drawn highlight styled like Avo's native :focus-visible ring
  // thin 2px #f87171 (red-400) stroke, 2px pad, 3px radius). The header `<div>` is the
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

  // belongs_to — Comments index: ID + User columns with belongs_to link (Overview). Whole table card
  // (RULES 4/10/10a/10b); excerpt + commentable hidden via hideIndexColumns; view_type=table.
  {
    id: "belongs-to-index",
    path: "/avo/resources/comments?view_type=table&per_page=4",
    viewport: { width: 900, height: 700 },
    settle: 800,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      hideIndexColumns("excerpt", "commentable"),
      injectCSS('th[data-control="item-select-th"], td[data-control="item-select-td"] { display: none !important; }'),
    ),
    selector: ".card.relative.w-full",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/associations/belongs-to-index.png",
    display: "full",
    alt: "Comments index table with ID and User columns, the User cell showing a belongs_to link to the associated record.",
    source: { file: "docs/4.0/associations/belongs_to.md", prompt: "belongs_to link on index view" },
  },

  // belongs_to — Post show: User belongs_to link in its OWN dedicated panel/card (RULES 15z).
  // Temp edit (reverted after capture): Post resource gets `panel do card do field :user, only_on: :show
  // end end`; original `:user` hidden on show. Capture whole card with symmetric ≤10px pad (15e/15r).
  {
    id: "belongs-to-show",
    path: "/avo/resources/posts/10",
    viewport: { width: 720, height: 700 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="user"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/associations/belongs-to-show.png",
    display: "full",
    alt: "Post show view with a User belongs_to field linking to the associated user record inside a complete card.",
    source: { file: "docs/4.0/associations/belongs_to.md", prompt: "belongs_to field on show view" },
  },

  // belongs_to — Post edit: User belongs_to dropdown in its OWN dedicated panel/card (RULES 15z/9b).
  // Temp edit (reverted after capture): Post resource gets `panel do card do field :user, only_on:
  // [:edit, :new] end end`; original `:user` hidden on edit/new. Narrow viewport ~720px.
  {
    id: "belongs-to-edit",
    path: "/avo/resources/posts/10/edit",
    viewport: { width: 720, height: 800 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card:has([data-field-id="user"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/associations/belongs-to-edit.png",
    display: "full",
    alt: "Post edit form with the User belongs_to dropdown showing available records inside a complete card.",
    source: { file: "docs/4.0/associations/belongs_to.md", prompt: "belongs_to dropdown on edit form" },
  },

  // belongs_to — Review new: polymorphic reviewable with polymorphic_help + help matching doc snippet
  // (RULES 13/15z/15y). Temp review.rb wraps field in dedicated panel/card on :new only; body/user
  // hidden on new. Both type + record dropdowns and both help strings visible (closed state).
  {
    id: "belongs-to-polymorphic-help",
    path: "/avo/resources/reviews/new",
    viewport: { width: 720, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.selectOption("#review_reviewable_type", "Post");
      await wait(600)(page);
    },
    selector: '.card:has([data-field-id="reviewable"])',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/associations/polymorphic-help.png",
    display: "full",
    alt: "New review form with a polymorphic Reviewable belongs_to field showing the type dropdown, record dropdown, polymorphic_help and help text inside a complete card.",
    source: { file: "docs/4.0/associations/belongs_to.md", prompt: "polymorphic belongs_to with polymorphic_help and help on new form" },
  },

  // basic-filters — filter types overview (RULES 9c/15a/15e): 1440 viewport + display:"half"
  // → real app CSS size, centered (same pattern as dynamic-filters). Temp: PostStatus on Post.
  {
    id: "basic-filters-types",
    path: "/avo/resources/posts?view_type=table&per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      await focus('[data-button="resource-filters"]')(page);
    },
    clipFrom: '[data-button="resource-filters"]',
    selector: ".filters__panel",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/types.png",
    display: "half",
    alt: "Avo Filters button with the open panel showing boolean, select, and multiple select filter types on the Posts index.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "Avo filter types panel on index" },
  },

  // basic-filters — multiple select (RULES 9c/15a): Posts index with ONLY the Status filter
  // (matches the PostStatus code sample: name "Status", Admins / Non admins). Temp: post.rb.
  {
    id: "basic-filters-multiple-select",
    path: "/avo/resources/posts?view_type=table&per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      await focus('[data-button="resource-filters"]')(page);
    },
    clipFrom: '[data-button="resource-filters"]',
    selector: ".filters__panel",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/multiple-select.png",
    display: "half",
    alt: "Avo multiple select filter named Status showing Admins and Non admins options with a Filter by Status button.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "multiple select filter" },
  },

  // basic-filters — date_time :date (RULES 9c/15a/15v). Patch birthday.rb via patch-birthday.mjs date.
  {
    id: "basic-filters-datetime-date",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      const birthdayInput = page.locator('.filters__panel input[placeholder="Filter by birthday"]');
      await birthdayInput.scrollIntoViewIfNeeded();
      await birthdayInput.click();
      await wait(500)(page);
      await page.locator(".flatpickr-calendar.open .flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)").filter({ hasText: /^13$/ }).first().click();
      await wait(300)(page);
      await focus('.filters__panel input[placeholder="Filter by birthday"]')(page);
      await wait(200)(page);
    },
    clipFrom: '.filters__panel input[placeholder="Filter by birthday"]',
    selector: ".flatpickr-calendar.open",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/datetime-date.png",
    display: "half",
    alt: "Avo date time filter with type date showing the Birthday filter and flatpickr calendar with a date selected.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "date time filter date type" },
  },

  // basic-filters — date_time :time. Patch birthday.rb via patch-birthday.mjs time.
  // Clicking the input closes the filters panel; open flatpickr via API so the Birthday
  // field and time picker stay visible together (same framing as :date / :date_time).
  {
    id: "basic-filters-datetime-time",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      const birthdayInput = page.locator('.filters__panel input[placeholder="Filter by birthday"]');
      await birthdayInput.scrollIntoViewIfNeeded();
      await wait(300)(page);
      await openFilterCalendar(page);
      await focus('.filters__panel input[placeholder="Filter by birthday"]')(page);
      await wait(200)(page);
    },
    clipFrom: '.filters-section:has(.filters-date-input)',
    selector: ".flatpickr-calendar.open",
    pad: { x: 10, top: 50, bottom: 50 },
    out: "docs/public/assets/img/4_0/filters/datetime-time.png",
    display: "half",
    alt: "Avo date time filter with type time: the Birthday filter input and flatpickr time picker.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "date time filter time type" },
  },

  // basic-filters — date_time :date_time. Patch birthday.rb via patch-birthday.mjs date_time.
  {
    id: "basic-filters-datetime-datetime",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      const birthdayInput = page.locator('.filters__panel input[placeholder="Filter by birthday"]');
      await birthdayInput.scrollIntoViewIfNeeded();
      await birthdayInput.click();
      await wait(500)(page);
    },
    clipFrom: '.filters__panel input[placeholder="Filter by birthday"]',
    selector: ".flatpickr-calendar.open",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/datetime-datetime.png",
    display: "half",
    alt: "Avo date time filter with type date_time showing the Birthday filter and combined date/time picker.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "date time filter date_time type" },
  },

  // basic-filters — date_time range mode. Patch birthday.rb via patch-birthday.mjs range.
  {
    id: "basic-filters-datetime-range",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      const input = page.locator('.filters__panel input[placeholder="Filter by birthday"]');
      await input.scrollIntoViewIfNeeded();
      await input.click();
      await wait(500)(page);
      const day = page.locator(".flatpickr-calendar.open .flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)");
      await day.filter({ hasText: /^13$/ }).first().click();
      await wait(200)(page);
      await day.filter({ hasText: /^16$/ }).first().click();
      await wait(300)(page);
      await input.click();
      await wait(500)(page);
    },
    clipFrom: '.filters__panel input[placeholder="Filter by birthday"]',
    selector: ".flatpickr-calendar.open",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/datetime-range.png",
    display: "half",
    alt: "Avo date time filter in range mode showing the Birthday filter and a selected date range in flatpickr.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "date time filter range mode" },
  },

  // basic-filters — date_time single mode. Patch birthday.rb via patch-birthday.mjs single.
  {
    id: "basic-filters-datetime-single",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      const input = page.locator('.filters__panel input[placeholder="Filter by birthday"]');
      await input.scrollIntoViewIfNeeded();
      await input.click();
      await wait(500)(page);
      await page.locator(".flatpickr-calendar.open .flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)").filter({ hasText: /^13$/ }).first().click();
      await wait(300)(page);
      await input.click();
      await wait(500)(page);
    },
    clipFrom: '.filters__panel input[placeholder="Filter by birthday"]',
    selector: ".flatpickr-calendar.open",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/datetime-single.png",
    display: "half",
    alt: "Avo date time filter in single mode showing the Birthday filter and one selected date in flatpickr.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "date time filter single mode" },
  },

  // basic-filters — dynamic options static PNG (RULES 9c/15a). Temp: CourseCity keys + empty_message.
  {
    id: "basic-filters-dynamic-options",
    path: "/avo/resources/courses?view_type=table&per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator('[data-button="resource-filters"]').click();
      await wait(400)(page);
      await page.getByRole("checkbox", { name: "USA" }).check();
      await page.waitForSelector('.filters__panel label:has-text("New York")', { timeout: 10000 });
      await wait(500)(page);
      await focus('[data-button="resource-filters"]')(page);
    },
    clipFrom: '[data-button="resource-filters"]',
    selector: ".filters__panel",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/filters/dynamic-options.png",
    display: "half",
    alt: "Avo Filters button with Course country and city filters where selecting USA populates US cities.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "dynamic filter options country city" },
  },

  // actions/execution — all four action feedback alert types stacked (succeed, inform, warn, error).
  // Temp demo: DemoAlertTypes action on Fish show (reverted after capture).
  {
    id: "alert-response",
    path: "/avo/resources/fish?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: async (page) => {
      await compose(closeSidebar, matBg, hideKbd)(page);
      await page.locator("a.button.button--color-fuchsia").filter({ hasText: "Dummy action" }).click();
      await page.waitForSelector('#modal_frame [role="dialog"]', { timeout: 10000 });
      await page.locator("#modal_frame").getByRole("button", { name: /Run/i }).click();
      await page.waitForSelector("#alerts .alert--success", { timeout: 15000 });
      await wait(500)(page);
    },
    clipFrom: "#alerts .alert--success",
    selector: "#alerts .alert--danger",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/alert/alert-response.png",
    display: "half",
    alt: "Avo action feedback notifications: success, info, warning, and error alerts stacked.",
    source: { file: "docs/4.0/actions/execution.md", prompt: "action feedback alert types succeed inform warn error" },
  },

  // dynamic-filters (avo-advanced) — filters bar + open card over a 6-row index table.
  // per_page=6; sidebar closed + mat bg. See DF_CLIP_* constants and probe-df-context.mjs.

  // Boolean (users → "Is active"): default card, Is true condition + Apply.
  {
    id: "dynamic-filters-boolean",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfUsersPrepare("Is active"),
    // Zoomed-in (~1.5×) at a narrowed viewport so the WHOLE table (all columns + pagination) fits at
    // the same component scale. Clip = filters bar → table → pagination, sidebar closed, small mat pad.
    // x:12 keeps a left mat gap so the "Add filter" button + table left border aren't flush-cut.
    clip: { x: 12, y: 607, width: 1000, height: 426 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/boolean.png",
    alt: "Avo Users index with six rows per page: the Is active dynamic filter pill and open card showing the Is true condition and Apply button over the table.",
  },
  // Boolean conditions expanded: Is true / Is false / Is null / Is not null.
  {
    id: "dynamic-filters-boolean-conditions",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfUsersPrepare("Is active", expandFilterConditions),
    clip: { x: 12, y: 607, width: 1000, height: 426 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/boolean2.png",
    alt: "Avo Users index with the Is active dynamic filter: condition list expanded over the table showing Is true, Is false, Is null and Is not null.",
  },

  // Date (teams → "Created at"): flatpickr calendar + time picker open.
  {
    id: "dynamic-filters-date-calendar",
    path: "/avo/resources/teams?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfTeamsPrepare("Created at", openFilterCalendar),
    clip: { x: 12, y: 242, width: 1000, height: 526 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/date3.png",
    alt: "Avo Teams index with six rows per page: the Created at dynamic filter with flatpickr calendar and time picker open over the table.",
  },
  // Date conditions expanded: Is / Is not / Is on or before / Is on or after / Is within.
  {
    id: "dynamic-filters-date-conditions",
    path: "/avo/resources/teams?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfTeamsPrepare("Created at", expandFilterConditions),
    clip: { x: 12, y: 242, width: 1000, height: 408 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/date2.png",
    alt: "Avo Teams index with the Created at dynamic filter: condition list expanded over the table.",
  },

  // Number (teams → "ID"): default card, = condition + value input + Apply.
  {
    id: "dynamic-filters-number",
    path: "/avo/resources/teams?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfTeamsPrepare("ID"),
    clip: { x: 12, y: 242, width: 1000, height: 408 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/number.png",
    alt: "Avo Teams index with six rows per page: the ID dynamic filter pill and open card over the table.",
  },
  // Number conditions expanded: =, !=, >, >=, <, <=, Is within.
  {
    id: "dynamic-filters-number-conditions",
    path: "/avo/resources/teams?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfTeamsPrepare("ID", expandFilterConditions),
    clip: { x: 12, y: 242, width: 1000, height: 408 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/number2.png",
    alt: "Avo Teams index with the ID dynamic filter: condition operators expanded over the table.",
  },

  // Select (courses → "Country"): default card, Is condition + value picker + Apply.
  {
    id: "dynamic-filters-select",
    path: "/avo/resources/courses?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfCoursesPrepare("Country"),
    clip: { x: 12, y: 242, width: 1000, height: 408 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/select.png",
    alt: "Avo Courses index with six rows per page: the Country dynamic filter pill and open card over the table.",
  },
  // Select conditions expanded: Is / Is not / Is null / Is not null.
  {
    id: "dynamic-filters-select-conditions",
    path: "/avo/resources/courses?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfCoursesPrepare("Country", expandFilterConditions),
    clip: { x: 12, y: 242, width: 1000, height: 408 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/select2.png",
    alt: "Avo Courses index with the Country dynamic filter: condition list expanded over the table.",
  },

  // Text (users → "First name"): default card, Contains condition + value input + Apply.
  {
    id: "dynamic-filters-text",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfUsersPrepare("First name"),
    clip: { x: 12, y: 607, width: 1000, height: 426 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/text.png",
    alt: "Avo Users index with six rows per page: the First name dynamic filter pill and open card over the table.",
  },
  // Text conditions expanded: Contains, Does not contain, Is, Is not, Starts with, Ends with, …
  {
    id: "dynamic-filters-text-conditions",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfUsersPrepare("First name", expandFilterConditions),
    clip: { x: 12, y: 607, width: 1000, height: 426 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/text2.png",
    alt: "Avo Users index with the First name dynamic filter: text conditions expanded over the table.",
  },

  // Tags (courses → "Skills"): default card, Are condition + tag input + Apply.
  {
    id: "dynamic-filters-tags",
    path: "/avo/resources/courses?per_page=6",
    viewport: { width: 1024, height: 1320 },
    settle: 800,
    prepare: dfCoursesPrepare("Skills"),
    clip: { x: 12, y: 242, width: 1000, height: 408 },
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/tags.png",
    alt: "Avo Courses index with six rows per page: the Skills dynamic filter pill and open card over the table.",
  },
  // Tags conditions expanded: Are, Contain, Overlap.
  {
    id: "dynamic-filters-tags-conditions",
    path: "/avo/resources/courses?per_page=6",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: dfCoursesPrepare("Skills", expandFilterConditions),
    clip: DF_CLIP_SIMPLE,
    display: "full",
    out: "docs/public/assets/img/4_0/dynamic-filters/tags2.png",
    alt: "Avo Courses index with the Skills dynamic filter: tag conditions expanded over the table.",
  },

  // has_one — Team#1 (Apple) show: the `admin` has_one association panel, titled "Admin", showing the
  // UNFOLDED child user record (ID + USER INFORMATION fields) with the Actions/Detach controls — the
  // "peek at the Show view of the associated record" the doc describes (`field :admin, as: :has_one`).
  // The panel is normally HIDDEN in the demo because `explicit_authorization = true` gates association
  // panels behind `view_admin?` (undefined → false); a TEMP edit to team.rb sets
  // `Avo.configuration.explicit_authorization = false` (reverted after capture) so every panel renders.
  // Whole association turbo-frame captured (RULES 10/15z — complete panel with title + child = full
  // context). Sidebar closed + mat bg (RULES 12/19a); hideKbd; symmetric 10px pad (15e/15f).
  {
    id: "has-one-panel",
    path: "/avo/resources/teams/1",
    viewport: { width: 1200, height: 1600 },
    settle: 1200,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: "#has_one_field_show_admin",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/associations/has-one-panel.png",
    display: "full",
    alt: "An Avo Team show view with the admin has_one association panel titled Admin, showing the unfolded child user record with its Id and user information fields plus the Detach control.",
    source: { file: "docs/4.0/associations/has_one.md", prompt: "has_one association panel on show view" },
  },

  // has_many `linkable` (has_many.md) — static screenshot for now: Team#1 (Apple) show page with
  // breadcrumbs, record header, and the Memberships panel embedded below; red highlight on the
  // linkable open-in-new-tab icon. Temp edit: team.rb `linkable: true` (reverted after).
  // TODO(screenshot→gif): swap for has-many-linkable.gif — see GIF_SPECS `has-many-linkable-gif`.
  {
    id: "has-many-linkable",
    path: "/avo/resources/teams/1",
    viewport: { width: 1120, height: 1120 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      injectCSS(`a[href^="cursor://"] { display: none !important; }`),
      async (page) => {
        await page.evaluate(() => document.getElementById("has_many_field_show_memberships")?.scrollIntoView({ block: "start" }));
        await page.locator("#has_many_field_show_memberships[complete]").waitFor({ timeout: 15000 });
        await page.waitForTimeout(600);
        await page.evaluate(() => window.scrollTo(0, 0));
        await wait(700)(page);
      },
    ),
    // Full content width (sidebar closed, RULES 12/19a) with the record header (breadcrumbs +
    // title + Edit button, right≈1096, UNCUT) and the Memberships panel below (x25→1096,
    // bottom≈1043). Clip = union bbox of breadcrumbs ∪ Edit ∪ memberships panel + symmetric
    // ~10px pad (RULES 15e): x7→1114, y50→1053. All four edges land on the mat-forced .main-content.
    clip: { x: 7, y: 50, width: 1107, height: 1003 },
    marks: [{ selector: '#has_many_field_show_memberships a[has-data-tippy="Open in a new tab"]', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/associations/has-many-linkable.png",
    display: "full",
    alt: "An Avo Team show page with the Memberships has_many association panel embedded below the record fields; the linkable open-in-new-tab icon beside the panel title is highlighted.",
    source: { file: "docs/4.0/associations/has_many.md", prompt: "linkable association title opens the same view on a new page" },
  },

  // associations (custom label) (`/memberships?view=show`):
  // the dedicated has_many view whose TITLE is a CUSTOM LABEL ("Members" via field_translations —
  // the i18n localization the doc recommends for `team_members`). TEMP edit to avo.en.yml adds
  // `field_translations.memberships → Members` (reverted after capture). Capture the WHOLE
  // association page panel (title + action bar + table + pagination) — NOT the app top-navbar,
  // breadcrumbs, or sidebar (RULES 12/19a). Sidebar closed + mat bg; hideKbd; symmetric 10px pad
  // (15e/15f/15r). Annotate the custom title (prompt).
  {
    id: "associations-custom-label",
    path: "/avo/resources/teams/1/memberships?view=show",
    viewport: { width: 1100, height: 800 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      injectCSS(`a[href^="cursor://"] { display: none !important; }
        .top-navbar, .breadcrumbs, .breadcrumbs__container { display: none !important; }
        .main-content { padding-top: 0 !important; }`),
      wait(600),
    ),
    selector: ".main-content .panel.w-full",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '.main-content .panel.w-full .header__title [data-slot="text-value"]', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/associations/associations-custom-label.png",
    display: "full",
    alt: "An Avo has_many association page titled Members (a custom label via field localization) showing the full index table with attach and create actions, without the app header or sidebar.",
    source: { file: "docs/4.0/associations.md", prompt: "entier page without the header and sidebar and anotate the title" },
  },

  // ===================== cards.md + dashboards.md =====================
  // The demo's `Dashy` dashboard (app/avo/dashboards/dashy.rb) hosts every card type the Cards
  // page documents. Each card lazy-loads in its own turbo-frame, so the prepare scrolls the page
  // bottom→top to trigger all the lazy frames, then a long settle lets every card finish before
  // the shot. A single-card shot frames that card's `.card` wrapper (border + rounded corners
  // intact, RULES 15r fully-around) with a symmetric ≤10px pad; sidebar closed + mat bg
  // (RULES 12/19a). The dashboard-overview shot keeps the sidebar (Cards/dashboard context is
  // explicit, RULES 12) and captures the whole grid.

  // scroll the lazy dashboard frames into view (bottom then back to top) + settle so all cards load
  // before the shot. Used by every dashboard spec below.
  // (defined inline per-spec via `prepare` — see dashLoad)

  // dashboards-overview (dashboards.md) — the Dashy dashboard as it appears in the browser
  // viewport (NOT fullPage — fullPage stretches the fixed sidebar past the content and leaves
  // empty space below the user profile). Sidebar kept for navigation context (RULES 12). Lazy
  // cards are scrolled into view first; capture is viewport-only at 1440×900 — shows metrics +
  // charts through the column/pie/bar row; the Custom partials divider + map cards below are
  // intentionally cut off (they don't fit one screen).
  {
    id: "dashboards-overview",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1440, height: 900 },
    settle: 2500,
    prepare: async (page) => {
      await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      for (let y = 0; y <= 2000; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(350); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1200);
    },
    out: "docs/public/assets/img/4_0/dashboards/dashboard.png",
    display: "full",
    alt: "An Avo dashboard named Dashy with the sidebar visible, showing a viewport of its card grid — metrics, charts (area, scatter, line, column, pie, bar), Percent done and Amount raised.",
    source: { file: "docs/4.0/dashboards.md", prompt: "a dashboard overview page with its cards" },
  },

  // cards-metric — the metric card (Users count). A MetricCard renders a big number with a
  // header (label + ranges dropdown). Frame the single card wrapper, sidebar closed + mat bg.
  {
    id: "cards-metric",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 900 },
    settle: 1800,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
    },
    selector: '.card:has([data-card-id="users_metric"])',
    pad: { x: 4, y: 8 },
    out: "docs/public/assets/img/4_0/cards/metric.png",
    display: "half",
    alt: "An Avo metric card titled “Users count” showing a large number with a range dropdown in its header.",
    source: { file: "docs/4.0/cards.md", prompt: "a metric card showing a big number" },
  },

  // cards-chartkick — the chartkick area chart card (User signups). Frame the single card.
  {
    id: "cards-chartkick",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 900 },
    settle: 2000,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1000);
    },
    selector: '.card:has([data-card-id="user_signups"])',
    pad: { x: 4, y: 8 },
    out: "docs/public/assets/img/4_0/cards/chartkick.png",
    display: "full",
    alt: "An Avo chartkick card titled “User signups” rendering an area chart of signups over time.",
    source: { file: "docs/4.0/cards.md", prompt: "a chartkick chart card" },
  },

  // cards-map — the MapCard partial card with `display_header = false`, so the embedded Google
  // Maps iframe fills the whole card flush to its borders (the "Hide the header" example). Tall
  // card (rows=4). The avo-dashboards beta still paints a `.card__header` strip with the label
  // even when `display_header = false`, so to surface the DOCUMENTED state (header hidden, content
  // flush) we hide that header strip via CSS for the map card only and let the iframe fill the
  // card body to the top. Frame the single card wrapper, sidebar closed + mat bg.
  {
    id: "cards-map",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 1450 },
    settle: 2200,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important} .card:has([data-card-id='map_card']) .card__header{display:none!important}" });
      for (let y = 0; y <= 1600; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(300); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1500);
    },
    selector: '.card:has([data-card-id="map_card"])',
    pad: { x: 8, y: 8 },
    out: "docs/public/assets/img/4_0/cards/map.png",
    display: "full",
    alt: "An Avo partial card embedding a Google Maps view of Manhattan, rendered flush to the card edges because the card header is hidden.",
    source: { file: "docs/4.0/cards.md", prompt: "a map card filling the whole card with the header hidden" },
  },

  // cards-custom-partial — the PartialCard rendering custom HTML content (rows=4, cols=1), with
  // its header + description ("This card has been loaded from a custom partial.") and the partial
  // body. Frame the single card wrapper, sidebar closed + mat bg.
  {
    id: "cards-custom-partial",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 1450 },
    settle: 2200,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      for (let y = 0; y <= 1600; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(300); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1500);
    },
    selector: '.card:has([data-card-id="users_custom_card"])',
    pad: { x: 8, y: 8 },
    out: "docs/public/assets/img/4_0/cards/custom-partial.png",
    display: "half",
    alt: "A tall Avo partial card whose body is custom HTML loaded from a partial, with the description “This card has been loaded from a custom partial.”",
    source: { file: "docs/4.0/cards.md", prompt: "a custom partial card with custom content" },
  },

  // cards-amount-raised-without-format — the AmountRaised metric card as it renders WITHOUT a
  // `self.format` (the demo's app/avo/cards/amount_raised.rb has `prefix = "$"` and `result 9001`
  // and NO format), so the value shows the raw number with the $ prefix. Sibling of the
  // with-format shot. Frame the single card wrapper, sidebar closed + mat bg.
  {
    id: "cards-amount-raised-without-format",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 900 },
    settle: 1800,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(900);
    },
    selector: '.card:has([data-card-id="amount_raised"])',
    pad: { x: 4, y: 8 },
    out: "docs/public/assets/img/4_0/cards/amount-raised-without-format.png",
    display: "half",
    alt: "An Avo metric card titled “Amount raised” showing the value with a $ prefix and no formatting applied.",
    source: { file: "docs/4.0/cards.md", prompt: "amount raised metric card without format" },
  },

  // cards-amount-raised-with-format — the AmountRaised metric card WITH `self.format = -> {
  // number_to_social value, start_at: 1_000 }` (temp-added to app/avo/cards/amount_raised.rb,
  // matching the doc snippet exactly — RULES 13), so the value 9001 renders as the compact
  // social form ("9K") with the $ prefix. Sibling of the without-format shot — SAME crop, same
  // card. Temp edit reverted after capture. Frame the single card wrapper, sidebar closed + mat bg.
  {
    id: "cards-amount-raised-with-format",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 900 },
    settle: 1800,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(900);
    },
    selector: '.card:has([data-card-id="amount_raised"])',
    pad: { x: 4, y: 8 },
    out: "docs/public/assets/img/4_0/cards/amount-raised-with-format.png",
    display: "half",
    alt: "An Avo metric card titled “Amount raised” showing the value formatted via number_to_social as a compact “9K” with a $ prefix.",
    source: { file: "docs/4.0/cards.md", prompt: "amount raised metric card with number_to_social format" },
  },

  // cards-prefix-suffix — a metric card that decorates its value with BOTH a `~` prefix and a
  // `%` suffix (the "Decorate the data using prefix and suffix" example). Temp edit (reverted
  // after capture): the demo's Users count card (app/avo/cards/example_metric.rb) gets
  // `self.prefix = "~"` and `self.suffix = "%"` uncommented, matching the doc snippet
  // `self.prefix = '~'` / `self.suffix = '%'` (RULES 13). Frame the single card wrapper, sidebar
  // closed + mat bg.
  {
    id: "cards-prefix-suffix",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 900 },
    settle: 1800,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(900);
    },
    selector: '.card:has([data-card-id="users_metric"])',
    pad: { x: 4, y: 8 },
    out: "docs/public/assets/img/4_0/cards/prefix-suffix.png",
    display: "half",
    alt: "An Avo metric card whose value is decorated with a ~ prefix and a % suffix.",
    source: { file: "docs/4.0/cards.md", prompt: "metric card with a prefix and suffix decorating the value" },
  },

  // cards-divider — the labelled divider ("Custom partials") that separates two groups of cards on
  // the dashboard. Shown IN CONTEXT (RULES 15a/10b): the full row of three chart cards ABOVE, the
  // divider line + label, then the custom-partial and map cards BELOW in full (both complete, all
  // borders). Clip probed sidebar-closed @ 1100px: chart-row top y=676 (−8 mat), bottom y=1383
  // (map + partial card wrappers, +8 mat), full grid width x 16→1084. Sidebar closed + mat bg.
  {
    id: "cards-divider",
    path: "/avo/dashboards/dashy",
    viewport: { width: 1100, height: 1500 },
    settle: 2000,
    prepare: async (page) => {
      await closeSidebar(page); await matBg(page); await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      for (let y = 0; y <= 1600; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(300); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1200);
    },
    clip: { x: 16, y: 668, width: 1068, height: 723 },
    out: "docs/public/assets/img/4_0/cards/divider.png",
    display: "full",
    alt: "An Avo dashboard divider labelled “Custom partials” separating a row of chart cards above from the custom partial and map cards below, each shown in full.",
    source: { file: "docs/4.0/cards.md", prompt: "a labelled divider separating dashboard cards" },
  },

  // ── menu-editor ──────────────────────────────────────────────────────────
  // Sidebar-menu shots. The custom main_menu / profile_menu are surfaced by a temp override
  // (Avo.configuration.main_menu = ... inside review.rb) per PROCESS.md. The sidebar column is
  // ~256px CSS wide; we capture the left column (navbar logo + sidebar menu) via a clip, then
  // DISPLAY at half the DPR-2 pixel dims (small/centered, RULES 9 — references are ~250px wide).

  // 1) Custom main menu — Resources section, Company group, Projects highlighted with two
  //    subitem links, Teams, Team memberships, Reviews.
  {
    id: "menu-editor-main",
    path: "/avo/resources/projects",
    viewport: { width: 1440, height: 900 },
    settle: 600,
    prepare: hideKbd,
    clip: { x: 0, y: 0, width: 256, height: 312 },
    out: "docs/public/assets/img/4_0/menu-editor/v4/main.png",
    display: "half",
    alt: "Avo custom main menu with a Resources section, a Company group, the Projects resource highlighted with First project / Second project sub-links, Teams, Team memberships and Reviews.",
  },

  // 2) all_ helpers — App section with all_resources (alphabetical resource list).
  {
    id: "menu-editor-all-helpers",
    path: "/avo/resources/projects",
    viewport: { width: 1440, height: 900 },
    settle: 600,
    prepare: hideKbd,
    clip: { x: 0, y: 0, width: 256, height: 312 },
    out: "docs/public/assets/img/4_0/menu-editor/v4/all-helpers.png",
    display: "half",
    alt: "Avo menu built with the all_resources helper, listing every resource alphabetically in the sidebar.",
  },

  // 3) Collapsable section + group (expanded).
  {
    id: "menu-editor-collapsable",
    path: "/avo/resources/projects",
    viewport: { width: 1440, height: 900 },
    settle: 600,
    prepare: hideKbd,
    clip: { x: 4, y: 50, width: 248, height: 138 },
    out: "docs/public/assets/img/4_0/menu-editor/collapsable.jpg",
    display: "half",
    alt: "A collapsable Avo sidebar section with an expanded group showing its resource links.",
  },

  // 4) Collapsed section/group state.
  {
    id: "menu-editor-collapsed",
    path: "/avo/resources/projects",
    viewport: { width: 1440, height: 900 },
    settle: 600,
    prepare: hideKbd,
    clip: { x: 4, y: 50, width: 248, height: 66 },
    out: "docs/public/assets/img/4_0/menu-editor/collapsed.jpg",
    display: "half",
    alt: "A collapsed Avo sidebar section/group with its child items hidden.",
  },

  // 5) Profile menu — open dropdown (Profile + Sign out) over the avatar trigger (RULES 15a).
  {
    id: "menu-editor-profile-menu",
    path: "/avo/resources/projects",
    viewport: { width: 1440, height: 900 },
    settle: 600,
    prepare: compose(hideKbd, hideUnder(".main-content"), hideUnder(".sidebar__body"), click(".sidebar-profile .button--style-text"), wait(600)),
    clip: { x: 6, y: 776, width: 316, height: 120 },
    out: "docs/public/assets/img/4_0/menu-editor/profile-menu.png",
    display: "half",
    alt: "The Avo profile dropdown menu open above the user avatar, showing a Profile link and a red Sign out link.",
  },

  // as-link-to-resource (customization.md "## ID links to resource") — with id_links_to_resource the
  // index ID column renders each id as a LINK to that record's Show. Reshaped to a focused ID + Name
  // table (RULES 10a/10b): a TEMP-minimal Teams resource (other index columns hidden via hide_on:
  // :index, id given link_to_record: true), a narrow 860 viewport so ID + Name read at ~1× (RULES
  // 9a), per_page=5 so the whole table card + pagination fit. Sidebar closed + mat bg (RULES 12/19a);
  // hideKbd. Capture the whole table card with ≤10px symmetric pad — real native edges + pagination
  // (RULES 4/10), the blue ID links are the subject. Temp team.rb edit reverted after capture.
  {
    id: "as-link-to-resource",
    path: "/avo/resources/teams?per_page=5",
    viewport: { width: 860, height: 900 },
    settle: 900,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: '.card[data-component-name="avo/view_types/table_component"]',
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/customization/as-link-to-resource.png",
    display: "full",
    alt: "An Avo index where each row's ID is rendered as a blue link to that record's show view, with a Name column.",
  },

  // associations-lookup-list-limit (customization.md "### `lookup_list_limit`") — the
  // "There are more records available." message Avo appends to a belongs_to options list when the
  // lookup hits `lookup_list_limit`. Surfaced on the New Membership form: its `user` belongs_to is
  // `searchable: false`, so it renders a native <select> listing User options; with a TEMP
  // `lookup_list_limit: 5` (set in membership.rb's class body) and 55 users, the list shows 5 names +
  // the disabled "There are more records available." option. The native popup can't be screenshot, so
  // openSelect expands the REAL select to size=N inline (RULES 15a/openSelect) — the message shows in
  // the field's form context. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Capture the whole New
  // form card (panel) with ≤10px symmetric pad so the User field + open list read inside the form
  // (RULES 10b). Full dims (old shot was wide). Temp config reverted after capture.
  {
    id: "associations-lookup-list-limit",
    path: "/avo/resources/memberships/new",
    viewport: { width: 900, height: 1000 },
    settle: 900,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      openSelect("#team_membership_user_id"),
      wait(400),
    ),
    // form card x17-884 y186-464 (probed, sidebar closed) + ≤10px symmetric mat; the expanded select
    // (to y377) sits inside, so the whole New form card with the open list reads as one (RULES 10b/4).
    clip: { x: 7, y: 176, width: 887, height: 298 },
    // Red box around the disabled "There are more records available." option. The option's own
    // bounding box (page y≈355, 17px tall) abuts "Allan Labadie" above, so a selector box top would
    // graze it — use an explicit viewport box inset ~3px at the top to clear Allan (viewport CSS-px;
    // capture.mjs offsets by the clip origin). openSelect expands the native <select> inline.
    marks: [{ box: { x: 254, y: 358, width: 221, height: 13 }, type: "highlight", pad: 1 }],
    out: "docs/public/assets/img/4_0/customization/associations-lookup-list-limit.png",
    display: "full",
    alt: "An Avo new form where a belongs_to user select lists five records followed by a disabled 'There are more records available.' message when the lookup list limit is reached.",
  },

  // custom-fields progress-show (custom-fields.md "## Generate a new field" → after registering
  // `field :progress, as: :progress_bar`) — the progress_bar field rendered on the SHOW view. The
  // built-in Avo progress_bar (which this tutorial recreates) renders a real progress bar + the
  // value. Captured from a clean temp resource (ProgressShotDemo, a Project subclass) where the
  // `:progress` field is wrapped in its OWN `panel do card do … end end` (RULES 15z) so it sits in a
  // dedicated content-sized card; the field reads "Progress" + "98%" (record id=1). Sidebar closed +
  // mat bg (RULES 12/19a); hideKbd. Whole card via selector `.card` (the progress card is the only/
  // first .card on the page) + ≤10px symmetric pad. Narrow 900 viewport so it displays ~1× (RULES 9a).
  {
    id: "progress-show",
    path: "/avo/resources/progress_shot_demos/1",
    viewport: { width: 680, height: 760 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/custom-fields/progress-show.png",
    display: "full",
    alt: "A progress_bar custom field on an Avo Show view, rendering a green progress bar with the value 98% above it.",
    source: { file: "docs/4.0/custom-fields.md", prompt: "the progress custom field on the show view" },
  },

  // custom-fields progress-index (custom-fields.md "## Customize the views") — the progress_bar
  // field rendered as a small bar (w-24) in the INDEX cell, with the value+suffix above it
  // (`display_value: true, value_suffix: "%"`). RESHAPED to a focused ~3-column table (ID, Name,
  // Progress) with a few MIDDLE rows (RULES 10a/9a/15i): the temp ProgressShotDemo resource exposes
  // only id, name and progress on index; small per_page so a real pager shows. Sidebar closed + mat
  // bg (RULES 12/19a); hideKbd. Narrow viewport so columns are tight + text near 1×. Whole table card
  // via selector + ≤10px symmetric pad (RULES 10/20).
  {
    id: "progress-index",
    path: "/avo/resources/progress_shot_demos?per_page=4",
    viewport: { width: 760, height: 760 },
    settle: 900,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/custom-fields/progress-index.png",
    display: "full",
    alt: "An Avo index table with ID, Name and Progress columns, where Progress renders a small progress bar with the value and a percent suffix above it.",
    source: { file: "docs/4.0/custom-fields.md", prompt: "the progress custom field on the index view" },
  },

  // custom-fields progress-edit (custom-fields.md "## Customize the views" → the Edit range input) —
  // the progress_bar field on the EDIT form as a range input with the value+suffix shown above it.
  // Captured from the temp ProgressShotDemo edit form (id=1) where `:progress` is wrapped in its OWN
  // panel/card (RULES 15z/15y — Form view shows the full range control); `step: 10, display_value:
  // true, value_suffix: "%"`. NARROW viewport (~820) so the single-field form card displays ~1× with
  // the label stacked above the input (RULES 9b). Sidebar closed + mat bg (RULES 12/19a); hideKbd.
  // Whole card via selector `.card` (the progress card) + ≤10px symmetric pad.
  {
    id: "progress-edit",
    path: "/avo/resources/progress_shot_demos/1/edit",
    viewport: { width: 640, height: 760 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/custom-fields/progress-edit.png",
    display: "full",
    alt: "A progress_bar custom field on an Avo Edit form, rendered as a range slider with the current value and percent suffix shown above it.",
    source: { file: "docs/4.0/custom-fields.md", prompt: "the progress custom field on the edit view" },
  },

  // guide-bulk_destroy (guides/bulk_destroy_action_using_customizable_controls.md) — the bulk-destroy
  // action surfaced as a customizable INDEX control (the red trash button top-right) plus its open
  // confirmation modal. The demo's base_resource registers `Avo::Actions::BulkDestroy` as an
  // `index_control` on Products/Posts/Users/etc (icon trash, color red, style outline) exactly per the
  // guide. We use Products (table view) because its first four records have clean titles (Apple Watch,
  // MacBook Pro, iPhone, iPod): select those four rows, then click the red destroy control → the action
  // modal opens listing "Are you sure you want to delete these 4 records?", the scrollable record list,
  // and the "This action cannot be undone." warning with Cancel / Run — the exact UI the guide
  // describes. Red group box around the header select-all + four checked row checkboxes; red focus
  // ring on the bulk-destroy trigger (native blue focus ring stripped via injectCSS). Sidebar closed +
  // mat bg (RULES 12/19a); hideKbd. clip frames the red control row → table card → modal.
  {
    id: "guide-bulk_destroy-bulk_destroy_image",
    path: "/avo/resources/products?per_page=6&view_type=table",
    viewport: { width: 1280, height: 900 },
    settle: 900,
    prepare: compose(
      closeSidebar,
      matBg,
      hideKbd,
      injectCSS(`a.button--color-red:focus, a.button--color-red:focus-visible,
        a[class*="color-r"]:focus, a[class*="color-r"]:focus-visible {
        outline: none !important; box-shadow: none !important;
      }`),
      async (page) => {
        await page.waitForTimeout(300);
        // select the four named rows (tbody indices 2..5 = Apple Watch, MacBook Pro, iPhone, iPod)
        const rows = page.locator('tbody tr input[type="checkbox"]');
        const n = await rows.count();
        for (let i = 2; i < n; i++) await rows.nth(i).click();
        await page.waitForTimeout(300);
        // click the red customizable bulk-destroy control → opens the confirmation modal
        await page.locator('a.button--color-red, a[class*="color-r"]').first().click();
        await page.waitForSelector('text=This action cannot be undone', { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(900);
        await page.evaluate(() => document.activeElement?.blur?.());
      },
    ),
    clip: { x: 12, y: 106, width: 1256, height: 500 },
    marks: [
      { box: { x: 41, y: 235, width: 17, height: 293 }, type: "highlight", color: "#ef4444" },
      { selector: 'a.button--color-red, a[class*="color-r"]', type: "highlight", style: "focus", color: "#ef4444" },
    ],
    out: "docs/public/assets/img/4_0/guides/bulk_destroy/bulk_destroy_image.png",
    display: "full",
    alt: "An Avo Products index with four records selected and the customizable bulk-destroy control (red trash button) clicked, opening a confirmation modal that lists the records to be deleted and warns the action cannot be undone.",
    source: { file: "docs/4.0/guides/bulk_destroy_action_using_customizable_controls.md", prompt: "a bulk-destroy action surfaced via customizable controls on an index (selected rows + the destroy control)" },
  },

  // guide-display-scope-record-count (guides/display-scope-record-count.md) — the scopes tab bar
  // showing a record-count badge on the Active scope. Temp-edit `Active` scope `name` to the guide's
  // callable + gray pill (RULES 13). Full-width scopes bar + index toolbar + table header for
  // natural context (not the old tight 366×64 strip). Red highlight on the count badge (RULES 15d).
  // Sidebar closed + mat bg (RULES 12/19a); hideKbd. Temp scope edit reverted after capture.
  {
    id: "guide-display-scope-record-count-scopes",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 900, height: 900 },
    settle: 900,
    prepare: compose(closeSidebar, matBg, hideKbd),
    clip: { x: 7, y: 488, width: 887, height: 198 },
    marks: [{ selector: "span.bg-gray-500", type: "highlight", color: "#ef4444" }],
    out: "docs/public/assets/img/4_0/guides/display-scope-record-count/scopes.png",
    display: "full",
    alt: "An Avo Users index with the scopes tab bar — All, Admins, Non admins, Active — where the Active scope shows a small gray badge with the record count, highlighted in red.",
    source: { file: "docs/4.0/guides/display-scope-record-count.md", prompt: "the scopes bar showing record counts next to each scope name" },
  },

  // guide-conditionally-render-styled-rows (guides/conditionally-render-styled-rows.md) — an index
  // whose ROWS are conditionally styled (colored background) via the guide's `:has()` CSS trick. The
  // guide attaches a `soft-deleted` class to the `:id` field wrapper of the records to mark (even ids
  // in the example) then targets `tr[…table_row_component]:has(.soft-deleted)` with a red background.
  // We reproduce it on the Projects index: temp-edit Project#fields' `:id` field with the guide's
  // EXACT `html -> { index { wrapper { classes { record.id.even? ? 'soft-deleted' } } } }` block
  // (RULES 13), and inject the guide's row-background CSS in prepare (a raw `#fef2f2`, which the demo's
  // Tailwind purge can't strip since it's literal CSS — RULES 15n; plus a dark-mode red so the dark
  // shot stays legible — RULES 15m). The even-id rows (36/34/32) then render with a light-red
  // background, the odd rows plain — exactly the conditional row styling. Table-as-a-whole shot so the
  // full table + pagination read together (RULES 10); whole `.card` via selector + symmetric ≤10px
  // pad. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Temp resource edit reverted after captures.
  {
    id: "guide-conditionally-render-styled-rows-conditionally-render-styled-rows",
    path: "/avo/resources/projects?per_page=6&view_type=table",
    viewport: { width: 1280, height: 950 },
    settle: 900,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({ content: `
        tr[data-component-name="avo/index/table_row_component"]:has(.soft-deleted){ background:#fef2f2 !important; }
        @media (prefers-color-scheme: dark){ tr[data-component-name="avo/index/table_row_component"]:has(.soft-deleted){ background:#3f1d1d !important; } }
      ` });
      await page.waitForTimeout(300);
    },
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/guides/conditionally-render-styled-rows/conditionally-render-styled-rows.png",
    display: "full",
    alt: "An Avo Projects index where the even-id rows are rendered with a light-red background via a conditional CSS class, while the odd-id rows stay plain.",
    source: { file: "docs/4.0/guides/conditionally-render-styled-rows.md", prompt: "an index whose rows are conditionally styled (colored row backgrounds)" },
  },
  // format-ruby-object-to-json (guides/format-ruby-object-to-json.md) — the `meta` code field on a
  // Project Show, BEFORE the pretty-print formatter: the JSON renders on one wrapped line, hard to
  // read. Temp Project resource shows only id + `field :meta, as: :code, language: "javascript"`;
  // project 2's meta temp-seeded to a 3-item todo array. Whole Show `.card` (id + meta rows) via
  // selector + symmetric pad; sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "guide-format-ruby-object-to-json-before",
    path: "/avo/resources/projects/2",
    viewport: { width: 1280, height: 950 },
    settle: 800,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
    },
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/guides/format-ruby-object-to-json/before.png",
    display: "full",
    alt: "A Project Show page with the meta JSON rendered as a code field on a single hard-to-read wrapped line.",
    source: { file: "docs/4.0/guides/format-ruby-object-to-json.md", prompt: "the meta code field before formatting — raw one-line JSON" },
  },
  // use-markdown-in-help-attributes (guides/use-markdown-in-help-attributes.md) — a field on a form
  // whose `help:` text is RENDERED MARKDOWN (headings, a bold paragraph, a fenced code block, an
  // inline code span and a bullet list). Temp Project resource renders a single `markdown` field in
  // its own panel/card (RULES 15z) with `help: markdown_help(<<~MARKDOWN …)`; the resource carries
  // the guide's Redcarpet renderer + `markdown_help` helper so the help is genuinely compiled from
  // markdown (not faked). Captured on the New form (the field + its rendered help below the editor).
  // Whole `.card` via selector + symmetric pad; sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "guide-use-markdown-in-help-attributes-result",
    path: "/avo/resources/projects/new",
    viewport: { width: 900, height: 1400 },
    settle: 900,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      // The demo's Tailwind purges the help list's `list-disc` (RULES 15n) and marksmith's editor
      // CSS resets list markers; restore the bullets so the rendered <ul> matches the doc's output.
      await page.addStyleTag({ content: `
        .help ul, [class*="help"] ul, section ul.list-disc { list-style: disc !important; }
        section ul.list-disc li, .help ul li { display: list-item !important; }
      ` });
    },
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/guides/use-markdown-in-help-attributes/result.png",
    display: "full",
    alt: "A markdown field on a New form whose help text is rendered markdown — headings (Dog, Cat, bird), a bold paragraph, a code block, an inline code span and a bullet list.",
    source: { file: "docs/4.0/guides/use-markdown-in-help-attributes.md", prompt: "a field whose help attribute is rendered markdown" },
  },
  // safely-override-resource-components (guides/safely-override-resource-components.md) — SHOT 1:
  // after wiring a custom index component (extends Avo::Views::ResourceIndexComponent) onto the Movie
  // resource via `self.components`, the Movies index renders the component's placeholder template
  // ("Add Avo::Views::ResourceCustomIndexComponent template here") instead of the table. Temp
  // component (rb + erb placeholder) + Movie `self.components` wiring. Content area (breadcrumb + the
  // placeholder line) with sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "guide-safely-override-resource-components-custom-index-component-1",
    // Re-captured at 200% zoom (RULES 9a legibility) to match sibling shot 2. The viewport is held
    // at 1800 (NOT widened) and `.main-content { zoom: 2 }` magnifies the content → effective layout
    // 1800/2 = 900, so the content is painted 2× inside the same-width frame and reads LARGER on the
    // full-width image. (Widening the viewport with the zoom cancels the effect — effective width
    // stays constant and the on-page size doesn't change.) Clip probed from the zoomed layout:
    // breadcrumb top − 10px down to the placeholder line bottom + 10px (short shot — no table),
    // ~10px symmetric side mat.
    path: "/avo/resources/movies",
    viewport: { width: 1800, height: 1300 },
    settle: 800,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await injectCSS(".main-content { zoom: 2; }")(page);
    },
    clip: { x: 22, y: 86, width: 1756, height: 148 },
    out: "docs/public/assets/img/4_0/guides/safely-override-resource-components/custom_index_component_1.png",
    display: "full",
    alt: "The Movies index rendering the custom index component's placeholder text instead of a table, after wiring it via self.components.",
    source: { file: "docs/4.0/guides/safely-override-resource-components.md", prompt: "the Movies index showing the custom component placeholder text" },
  },
  // safely-override-resource-components — SHOT 2: the custom component now wraps the original index
  // component and adds a blue "MovieFest 2025 • Discover what's trending…" message banner ABOVE the
  // table. Temp component template renders the banner + `render Avo::Views::ResourceIndexComponent
  // .new(**@kwargs)`. Content area = the message banner + the full Movies table + pagination
  // (RULES 10); sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "guide-safely-override-resource-components-custom-index-component-2",
    // Re-captured at 200% zoom (RULES 9a legibility). The viewport is held at 1800 (NOT widened) and
    // `.main-content { zoom: 2 }` magnifies the content → effective layout 1800/2 = 900, so the banner
    // + table are painted 2× inside the same-width frame and read LARGER on the full-width image.
    // (Widening the viewport with the zoom cancels the effect.) The table still keeps all columns
    // (ID/Name/Release date/Fun fact) at effective 900. Clip probed from the zoomed layout: top =
    // banner top − 10px, bottom = the table panel/pagination bottom + 10px (RULES 10/20), x/width =
    // banner span + ~10px symmetric mat.
    path: "/avo/resources/movies",
    viewport: { width: 1800, height: 1300 },
    settle: 900,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await injectCSS(".main-content { zoom: 2; }")(page);
    },
    clip: { x: 38, y: 166, width: 1724, height: 706 },
    out: "docs/public/assets/img/4_0/guides/safely-override-resource-components/custom_index_component_2.png",
    display: "full",
    alt: "The Movies index with a blue MovieFest 2025 message banner rendered above the table by the custom index component.",
    source: { file: "docs/4.0/guides/safely-override-resource-components.md", prompt: "the Movies index with a custom message banner above the table" },
  },
  // tabs-counter-indicator (guides/tabs-counter-indicator.md) — a tabs switcher whose labels carry a
  // counter badge (count of associated records). Temp TabsDemo resource wraps the Teams/People tab
  // titles with the doc's `name_with_counter(name, count)` helper (sanitized HTML badge); record 41
  // temp-seeded to teams=2 / people=1 so the badges read "2" and "1" exactly like the legacy shot.
  // Teams tab made active (focus) so its badge stands out. Whole `.tabs` switcher row via selector +
  // symmetric pad; sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "guide-tabs-counter-indicator-tabs-counter",
    path: "/avo/resources/tabs_demos/41",
    viewport: { width: 1280, height: 950 },
    settle: 800,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      // activate the Teams tab (the .tabs row's Teams link) so its counter badge is highlighted
      const teams = page.locator('.tabs:visible a', { hasText: 'Teams' }).first();
      try { await teams.click({ timeout: 4000 }); await page.waitForTimeout(600); } catch (e) {}
    },
    // tight clip to the tab labels (RULES 15c) — the .tabs row is wider than its content,
    // so clip from the row's left to just past the last (Projects) tab, full row height + pad.
    clip: { x: 156, y: 322, width: 522, height: 64 },
    out: "docs/public/assets/img/4_0/guides/tabs-counter-indicator/tabs_counter.png",
    display: "half",
    alt: "An Avo tabs switcher where the Teams and People tab labels each show a small grey counter badge with the number of associated records.",
    source: { file: "docs/4.0/guides/tabs-counter-indicator.md", prompt: "a tabs switcher whose labels show a record-count badge" },
  },
  // format-ruby-object-to-json — AFTER: same `meta` code field, now passed through
  // `JSON.pretty_generate(record.meta.as_json)` so it renders multi-line, indented and readable.
  // Temp Project resource uses the `do … end` computed code field; same project 2 seed + framing.
  {
    id: "guide-format-ruby-object-to-json-after",
    path: "/avo/resources/projects/2",
    viewport: { width: 1280, height: 1100 },
    settle: 800,
    prepare: async (page) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
    },
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/guides/format-ruby-object-to-json/after.png",
    display: "full",
    alt: "The same Project Show page with the meta JSON pretty-printed in the code field — multi-line, indented and easy to read.",
    source: { file: "docs/4.0/guides/format-ruby-object-to-json.md", prompt: "the meta code field after formatting — pretty-printed multi-line JSON" },
  },

  // ---- common/ association-panel shared partials (TEMP edit: user.rb adds a direct
  // `:comments` has_many panel on Show with reloadable/name/scope/description options, and sets
  // explicit_authorization=false so association panels render; reverted after capture).
  // Each captures the whole comments association turbo-frame (RULES 10/15z) on User#1's Show.

  // associations_description_option_common.md — the `description` option: the text shown under
  // the association title. TEMP edit: user.rb sets name/description on `:comments`; user_policy.rb
  // adds `view_comments?` (explicit_authorization); reverted after capture.
  {
    id: "common-description-option",
    path: "/avo/resources/users/1",
    viewport: { width: 1100, height: 1400 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      injectCSS(`#has_many_field_show_comments .header__description { width: fit-content; display: inline-block; }`),
      async (page) => {
        await page.evaluate(() => document.getElementById("has_many_field_show_comments")?.scrollIntoView({ block: "center" }));
        await page.locator("#has_many_field_show_comments[complete]").waitFor({ timeout: 20000 });
        await wait(600)(page);
      },
    ),
    selector: "#has_many_field_show_comments",
    pad: { x: 10, y: 10 },
    marks: [{ selector: "#has_many_field_show_comments .header__description", type: "highlight", style: "focus", pad: 1 }],
    out: "docs/public/assets/img/4_0/common/associations/description-option.png",
    display: "full",
    alt: "A has_many association panel with the description text shown under the association title",
    source: { file: "docs/4.0/common/associations_description_option_common.md", prompt: "association panel with a description under its title" },
  },

  // reloadable.md — the reload icon next to the association title. Header strip only; red highlight
  // on the reload control (not the native blue focus ring — stripped via injectCSS). TEMP edit:
  // user.rb sets reloadable/name/description on `:comments`; user_policy.rb adds view_comments?;
  // reverted after capture.
  {
    id: "common-reloadable",
    path: "/avo/resources/users/1",
    viewport: { width: 1100, height: 1400 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      injectCSS(`#has_many_field_show_comments [data-controller="panel-refresh"],
        #has_many_field_show_comments [data-action*="panel-refresh#refresh"] {
          outline: none !important; box-shadow: none !important;
        }`),
      async (page) => {
        await page.evaluate(() => document.getElementById("has_many_field_show_comments")?.scrollIntoView({ block: "center" }));
        await page.locator("#has_many_field_show_comments[complete]").waitFor({ timeout: 20000 });
        await wait(600)(page);
      },
    ),
    selector: "#has_many_field_show_comments .header",
    pad: { x: 10, y: 10 },
    marks: [{
      selector: '#has_many_field_show_comments [data-action*="panel-refresh#refresh"]',
      type: "highlight",
      color: "#ef4444",
      pad: 2,
      stroke: 2,
      radius: 3,
    }],
    out: "docs/public/assets/img/4_0/common/reloadable.png",
    display: "full",
    alt: "An association panel header with the reload icon (highlighted) next to the association title",
    source: { file: "docs/4.0/common/reloadable.md", prompt: "the reload icon next to an association panel title" },
  },

  // scopes_common.md — a has_many association panel with a scope applied (the scoped list of
  // associated records). Whole panel: title + scoped rows + pagination.
  {
    id: "common-scope",
    path: "/avo/resources/users/1",
    viewport: { width: 1100, height: 1400 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      async (page) => {
        await page.locator("#has_many_field_show_comments[complete]").waitFor({ timeout: 15000 });
        await wait(600)(page);
      },
    ),
    selector: "#has_many_field_show_comments",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/common/associations/scope.png",
    display: "full",
    alt: "An Avo has_many association panel showing a scoped list of associated records.",
    source: { file: "docs/4.0/common/scopes_common.md", prompt: "has_many association panel with a scope applied" },
  },

  // show_hide_buttons_common.md — header controls (Actions, Attach, Create) + per-row controls
  // (show, edit, delete) governed by authorization. Two red highlights: `.header__controls`
  // and the row-controls column (union box probed at 1100×1400). Commentable column hidden.
  // TEMP edit: user.rb name/description on `:comments`; user_policy.rb association policy
  // methods; comment.rb adds Dummy action for header Actions; reverted after capture.
  {
    id: "common-authorization",
    path: "/avo/resources/users/1",
    viewport: { width: 1100, height: 1400 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd, hideIndexColumns("commentable"),
      async (page) => {
        await page.evaluate(() => document.getElementById("has_many_field_show_comments")?.scrollIntoView({ block: "center" }));
        await page.locator("#has_many_field_show_comments[complete]").waitFor({ timeout: 20000 });
        await wait(600)(page);
      },
    ),
    selector: "#has_many_field_show_comments",
    pad: { x: 10, y: 10 },
    marks: [
      { selector: "#has_many_field_show_comments .header__controls", type: "highlight", color: "#ef4444", pad: 2, stroke: 2 },
      { box: { x: 957, y: 1020, width: 113, height: 189 }, type: "highlight", color: "#ef4444", pad: 2, stroke: 2 },
    ],
    out: "docs/public/assets/img/4_0/common/associations/authorization.png",
    display: "full",
    alt: "An Avo has_many association panel whose header Actions, Attach, and Create buttons and per-row show, edit, and delete controls are governed by authorization policies.",
    source: { file: "docs/4.0/common/show_hide_buttons_common.md", prompt: "association panel action buttons governed by authorization" },
  },

  // associations_name_option_common.md — the `name` option: the association panel TITLE uses a
  // custom name. Whole panel.
  {
    id: "common-name-option",
    path: "/avo/resources/users/1",
    viewport: { width: 1100, height: 1400 },
    settle: 1200,
    prepare: compose(
      closeSidebar, matBg, hideKbd,
      async (page) => {
        await page.evaluate(() => document.getElementById("has_many_field_show_comments")?.scrollIntoView({ block: "center" }));
        await page.locator("#has_many_field_show_comments[complete]").waitFor({ timeout: 15000 });
        await wait(600)(page);
      },
    ),
    selector: "#has_many_field_show_comments",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '#has_many_field_show_comments .header__title [data-slot="text-value"]', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/common/associations/name-option.png",
    display: "full",
    alt: "An Avo has_many association panel whose title uses a custom name option.",
    source: { file: "docs/4.0/common/associations_name_option_common.md", prompt: "association panel whose title uses the name option" },
  },

  // ---- faq.md "Render new lines for textarea fields" — textarea preserves newlines on Show
  // by default (whitespace-pre-line in the show component). TEMP edit: comment.rb wraps `body`
  // in its own card (RULES 15z); comment #282 has a 3-line body. Switch format_using between
  // captures (see notes). Narrow viewport so the card hugs + displays ~1× (RULES 9b/15z).

  // edit.png — Body textarea on Edit with multi-line content.
  // comment.rb: panel/card, `field :body, as: :textarea, stacked: true` (no format_using).
  {
    id: "faq-newline-edit",
    path: "/avo/resources/comments/282/edit",
    viewport: { width: 760, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:has(textarea)",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/faq/newline/edit.png",
    display: "full",
    alt: "A textarea Body field on the Edit form showing multi-line content with a trailing empty line after the last sentence.",
    source: { file: "docs/4.0/faq.md", prompt: "textarea field with newlines on the edit form" },
  },

  // show.png — same value on Show; trailing newlines render via an extra <br> in the show component.
  // comment.rb: panel/card, stacked body only (no format_using). Record #282 ends with a newline.
  {
    id: "faq-newline-show",
    path: "/avo/resources/comments/282",
    viewport: { width: 760, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:has([data-field-type='textarea'])",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/faq/newline/show.png",
    display: "full",
    alt: "The same Body value on the Show view, including the trailing empty line after the last sentence.",
    source: { file: "docs/4.0/faq.md", prompt: "textarea value on show with line breaks preserved by default" },
  },

  // simple_format.png — Show with `format_using: -> { simple_format value }` for paragraph spacing.
  // comment.rb body field gets that format_using before this capture.
  {
    id: "faq-newline-simple-format",
    path: "/avo/resources/comments/282",
    viewport: { width: 760, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:has([data-field-type='textarea'])",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/faq/newline/simple_format.png",
    display: "full",
    alt: "A Show view Body field rendered with simple_format, turning blank lines into spaced paragraphs.",
    source: { file: "docs/4.0/faq.md", prompt: "textarea value on show formatted with simple_format" },
  },

  // ===========================================================================
  // html.md — "Where are the attributes added?" — 8 ANATOMY shots.
  // Each documents which part of a field WRAPPER an `html:` attribute attaches to, per view.
  // Frame the field in its real container (the Course resource: Name / Has skills / Country /
  // City rows) and draw a focus-style box (RULES 15d′) on the named element:
  //   wrapper  → the whole .field-wrapper (one full row)
  //   label    → .field-wrapper__label (the "Name" label area)
  //   content  → .field-wrapper__content (slot=value — the value/input area)
  //   input    → the <input> itself (edit only)
  // Course 150's name is "Design 515". Sidebar closed + mat bg (RULES 12/19a).
  // wrapper shots frame the whole card (full context); label/content/input frame the card too
  // for consistency — the box position distinguishes the part. Index frames the table card and
  // boxes a middle name CELL (RULES 15i — not first/last row).

  // 1) Index field wrapper — the name CELL on the Courses index table.
  {
    id: "html-index-field-wrapper",
    path: "/avo/resources/courses?per_page=5",
    viewport: { width: 1440, height: 1000 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card.relative",
    pad: { x: 10, y: 10 },
    marks: [{ selector: 'table tbody tr:nth-child(3) td[data-field-id="name"]', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/index-field-wrapper.png",
    display: "full",
    alt: "The Avo Courses index table with one Name cell highlighted — the index field wrapper.",
    source: { file: "docs/4.0/html.md", prompt: "Index field wrapper" },
  },

  // 2) Show field wrapper — the whole name row on the Course Show card.
  {
    id: "html-show-field-wrapper",
    path: "/avo/resources/courses/150",
    viewport: { width: 1440, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"]', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/show-field-wrapper.png",
    display: "full",
    alt: "An Avo Show card with the Name field wrapper highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Show field wrapper" },
  },

  // 3) Show label target — the label area of the name field on Show.
  {
    id: "html-show-label-target",
    path: "/avo/resources/courses/150",
    viewport: { width: 1440, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"] .field-wrapper__label', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/show-label-target.png",
    display: "full",
    alt: "An Avo Show card with the Name field's label area highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Show label target" },
  },

  // 4) Show content target — the value/content area of the name field on Show.
  {
    id: "html-show-content-target",
    path: "/avo/resources/courses/150",
    viewport: { width: 1440, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"] .field-wrapper__content', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/show-content-target.png",
    display: "full",
    alt: "An Avo Show card with the Name field's content (value) area highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Show content target" },
  },

  // 5) Edit field wrapper — the whole name row on the Course Edit form card.
  {
    id: "html-edit-field-wrapper",
    path: "/avo/resources/courses/150/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"]', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/edit-field-wrapper.png",
    display: "full",
    alt: "An Avo Edit form card with the Name field wrapper highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Edit field wrapper" },
  },

  // 6) Edit label target — the label area of the name field on Edit.
  {
    id: "html-edit-label-target",
    path: "/avo/resources/courses/150/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"] .field-wrapper__label', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/edit-label-target.png",
    display: "full",
    alt: "An Avo Edit form card with the Name field's label area highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Edit label target" },
  },

  // 7) Edit content target — the content (value) area of the name field on Edit.
  {
    id: "html-edit-content-target",
    path: "/avo/resources/courses/150/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"] .field-wrapper__content', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/edit-content-target.png",
    display: "full",
    alt: "An Avo Edit form card with the Name field's content area highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Edit content target" },
  },

  // 8) Edit input target — the <input> element of the name field on Edit.
  {
    id: "html-edit-input-target",
    path: "/avo/resources/courses/150/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    marks: [{ selector: '[data-field-id="name"] input', type: "highlight", style: "focus" }],
    out: "docs/public/assets/img/4_0/html/edit-input-target.png",
    display: "full",
    alt: "An Avo Edit form card with the Name field's input element highlighted.",
    source: { file: "docs/4.0/html.md", prompt: "Edit input target" },
  },

  // ===========================================================================
  // field-wrappers.md — 4 ANATOMY shots of the field wrapper itself.
  // index/show/edit wrappers (same Course rows), and a stacked field (label above value — Event name).

  // 1) index_field_wrapper — the Courses index table card (no highlight mark).
  {
    id: "field-wrappers-index_field_wrapper",
    path: "/avo/resources/courses?per_page=5",
    viewport: { width: 1440, height: 1000 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card.relative",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-wrappers/index_field_wrapper.png",
    display: "full",
    alt: "The Avo Courses index table showing index field wrappers in each cell.",
    source: { file: "docs/4.0/field-wrappers.md", prompt: "index field wrapper" },
  },

  // 2) show_field_wrapper — Course Show card (id, name, availability, country). TEMP edit: course.rb
  // trims fields to four rows. No highlight mark.
  {
    id: "field-wrappers-show_field_wrapper",
    path: "/avo/resources/courses/150",
    viewport: { width: 1440, height: 900 },
    settle: 700,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-wrappers/show_field_wrapper.png",
    display: "full",
    alt: "An Avo Show card with field wrappers for id, name, availability, and country.",
    source: { file: "docs/4.0/field-wrappers.md", prompt: "show field wrapper" },
  },

  // 3) edit_field_wrapper — Course Edit form card (id, name, availability, country). TEMP edit: course.rb
  // trims fields to four rows. No highlight mark.
  {
    id: "field-wrappers-edit_field_wrapper",
    path: "/avo/resources/courses/150/edit",
    viewport: { width: 1440, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-wrappers/edit_field_wrapper.png",
    display: "full",
    alt: "An Avo Edit form card with field wrappers for id, name, availability, and country.",
    source: { file: "docs/4.0/field-wrappers.md", prompt: "edit field wrapper" },
  },

  // 4) stacked_field — `stacked: true` on Event#name (label above input). TEMP edit: event.rb
  // wraps name in its own panel/card (RULES 15z). Capture the whole card incl. bottom border/padding.
  {
    id: "field-wrappers-stacked_field",
    path: "/avo/resources/events/1/edit",
    viewport: { width: 760, height: 900 },
    settle: 800,
    prepare: compose(closeSidebar, matBg, hideKbd),
    selector: ".card:has([data-field-id=\"name\"])",
    pad: { x: 10, y: 10 },
    out: "docs/public/assets/img/4_0/field-wrappers/stacked_field.png",
    display: "full",
    alt: "A stacked field wrapper: the label is displayed above the input in a column layout.",
    source: { file: "docs/4.0/field-wrappers.md", prompt: "a field with stacked layout — label above input" },
  },

  // customization — config.sidebar_toggle_visible = false. SPECIAL CASE: this is the ONE shot that
  // KEEPS the sidebar open and visible (do NOT closeSidebar). The config is applied LIVE on the demo.
  // On a desktop-width viewport (lg: breakpoint) the navbar's collapse/expand toggle next to the logo
  // gets `lg:hidden` (verified: the [data-sidebar-toggle-icon] button is 0×0 / lg:hidden on desktop),
  // and the sidebar stays permanently open. We capture the WHOLE viewport — sidebar + navbar + content
  // — so the reader sees there is no toggle button next to the logo. Full-viewport screenshot (no
  // selector/clip). matBg + hideKbd only.
  {
    id: "customization-sidebar-toggle-hidden",
    path: "/avo/resources/users?per_page=6",
    viewport: { width: 1440, height: 1180 },
    settle: 800,
    prepare: compose(matBg, hideKbd),
    out: "docs/public/assets/img/4_0/customization/sidebar-toggle-hidden.png",
    display: "full",
    alt: "An Avo resource index on desktop with the sidebar permanently open and no toggle button in the navbar, because sidebar_toggle_visible is set to false.",
    source: { file: "docs/4.0/customization.md", prompt: "Full Avo resource index page with config.sidebar_toggle_visible = false: the sidebar is open on the left and the navbar at the top has NO collapse/expand toggle button next to the logo. Capture the entire page (sidebar + navbar + content) at a desktop width." },
  },
];

// ---- GIF specs — animated demos; record-gif.mjs drives each spec's steps(page, snap) -------
// Same idea as SPECS, for GIFs. Append a spec here when a shot must animate. Starts empty.
export const GIF_SPECS = [
  // resource-search (search/resource-search.md "## Resource search") — the per-resource search box
  // on Projects index: empty table → focus search → type "an" → table filters to matching rows.
  // Clip = `.panel__body` + 10px symmetric pad, sized to the UNFILTERED (tallest) state so the
  // shrink to 3 rows reads as real filtering, not a cropped frame. NOT the navbar global search.
  {
    id: "resource-search",
    path: "/avo/resources/projects?per_page=8",
    viewport: { width: 1100, height: 1000 },
    settle: 900,
    clip: { x: 14, y: 184, width: 1072, height: 579 },
    width: 2144,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      const input = page.locator(
        '[data-controller~="resource-search"] input[type="search"], [data-controller~="resource-search"] input[placeholder="Search"]',
      ).first();

      await snap(10, false); // full table, empty search

      await input.click();
      await page.waitForTimeout(300);
      await snap(6, false); // search focused, still unfiltered

      await input.type("a", { delay: 70 });
      await page.waitForTimeout(700);
      await snap(8, false); // partial filter after "a"

      await input.type("n", { delay: 70 });
      await page.waitForTimeout(900);
      await snap(14, false); // "an" — 3 matching records
    },
    out: "docs/public/assets/img/4_0/search/resource-search.gif",
    display: "full",
    alt: "An Avo Projects index where typing into the per-resource search box filters the table to matching records.",
    source: { file: "docs/4.0/search/resource-search.md", prompt: "the per-resource search box on a resource index mid-search showing filtered results" },
  },

  // fields/markdown.md — the Marksmith markdown editor in action, framed as a WHOLE card (RULES
  // 15z/10b). Temp edit: project.rb wraps `:description, as: :markdown` in its OWN `panel do card
  // do … end end`, so Avo renders a real, content-sized card hugging just that field — header/label,
  // Write/Preview tabs, formatting toolbar, textarea and footer, all four borders visible. Captured
  // on the Project New form (interactive: the Write/Preview tabs work). Narrow viewport WIDTH (760)
  // so the field stacks its label above the editor and the card is ~743px CSS wide (RULES 9b) — not
  // a slim label-left strip. A 1200px bottom spacer (injected in steps) gives the page generous
  // scroll headroom: the markdown card is near the document end, so without headroom the page hits
  // max-scroll and pin() can't seat the card top where we want (its top then rides up under the
  // navbar and the clip slices the card's TOP border in the empty-Write state, which is the tallest
  // because the textarea's min-height makes the card tallest there). With the spacer the page can
  // always scroll the card top to clip-top + ~10px (probed: vTop=58, clamped=false in every state),
  // so the top border + rounded top corners are never cut. Sidebar closed + mat bg (RULES 12/19a);
  // hideKbd. The fixed clip (y=48, just under the ~48px fixed navbar) frames the whole card + ~10px
  // symmetric mat: top mat 10px (card top 58); the tallest state (empty/typed Write, card bottom
  // ~430) gets ~10px bottom mat, the shorter Preview a little more — never cut. Animation: clear the
  // prefilled markdown, type it live (heading, bold, a list), Preview → rendered HTML, back to Write.
  {
    id: "markdown-field",
    path: "/avo/resources/projects/new",
    viewport: { width: 760, height: 1000 },
    settle: 900,
    clip: { x: 0, y: 48, width: 760, height: 392 },
    width: 760,
    delay: 16,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      // Hide every OTHER form field-wrapper on the page so only the markdown card shows. The New
      // form stacks Started / Users required above and File / Meta below the markdown card; if any
      // peek into the clip they read as bleed, not mat. Hiding them (visibility:hidden keeps layout
      // so the card's document position is stable) leaves clean mat above and below the card in
      // every frame, so a generous clip height can fully contain the TALLEST state (Preview, whose
      // rendered HTML is taller than the empty Write textarea) without catching a neighbour field.
      await page.addStyleTag({ content: `
        .field-wrapper:not(:has(.marksmith)) { visibility: hidden !important; }
        /* The breadcrumb bar is position:sticky (viewport ~52–88px, z-index 40) — it overlaps the
           top of the clip and renders OVER the card's top border + "Description" label, fading and
           slicing them. Hide it so the card's top mat is clean. (The fixed navbar above it is already
           excluded by the clip starting at y=48.) */
        nav.breadcrumbs, .breadcrumbs { display: none !important; }
        /* Bottom spacer: the markdown card is near the document end, so add scroll headroom below it
           so the page never hits max-scroll before pin() can seat the card top at clip-top + ~10px
           (1200px probed to leave the scroll un-clamped in every state). */
        body::after { content: ''; display: block; height: 1200px; }
      ` });
      await page.waitForTimeout(200);

      // Pin the markdown card so its TOP edge lands at a fixed viewport y (TARGET_TOP = clip-top 48
      // + 10px mat = 58), DETERMINISTICALLY: scroll, then read the card's real viewport top and
      // correct for any residual delta (a fixed navbar / sticky offset otherwise makes a single
      // `top - N` land a few px off, slicing the card's top border). Typing / focusing the textarea
      // auto-scrolls the page, so re-pin before every snap. The 1200px bottom spacer guarantees the
      // page can scroll far enough (un-clamped) for the correction to actually take effect.
      const TARGET_TOP = 58; // = clip.y (48) + 10px top mat
      const pin = async () => {
        await page.evaluate((target) => {
          const card = document.querySelector(".card:has(.marksmith)");
          // iterate: scroll so card top → target, re-measure, correct residual delta
          for (let i = 0; i < 4; i++) {
            const top = card.getBoundingClientRect().top;
            const delta = top - target;
            if (Math.abs(delta) <= 1) break;
            window.scrollBy(0, delta);
          }
        }, TARGET_TOP);
        await page.waitForTimeout(120);
      };
      await pin();

      const ta = page.locator(".marksmith-textarea").first();
      // start clean so the typing reads clearly (the field has a prefilled `default:`)
      await ta.fill("");
      await page.waitForTimeout(300);
      await pin();
      await snap(6); // empty editor, Write tab active — whole card in frame

      await ta.click();
      await page.keyboard.type("# Release notes\n\n", { delay: 35 });
      await pin();
      await snap(2);
      await page.keyboard.type("We shipped a **brand new** Markdown editor.\n\n", { delay: 28 });
      await pin();
      await snap(2);
      // list-continuation auto-inserts "- " after Enter, so only type the first marker
      await page.keyboard.type("- Live preview", { delay: 30 });
      await page.keyboard.press("Enter");
      await page.keyboard.type("File uploads", { delay: 30 });
      await page.keyboard.press("Enter");
      await page.keyboard.type("Media library", { delay: 30 });
      await page.waitForTimeout(300);
      await pin();
      await snap(9); // hold on the typed markdown source

      // toggle to Preview → rendered HTML
      await page.locator(".marksmith-preview-tab").first().click();
      await page.waitForTimeout(900);
      await pin();
      await snap(12); // hold on the rendered preview

      // back to Write
      await page.locator(".marksmith-write-tab").first().click();
      await page.waitForTimeout(600);
      await pin();
      await snap(6);
    },
    out: "docs/public/assets/img/4_0/fields/markdown/markdown-field.gif",
    alt: "The Avo Markdown field shown in its own card: typing Markdown in the Marksmith editor, then toggling the Preview tab to see the rendered HTML.",
    source: { file: "docs/4.0/fields/markdown.md", prompt: "the Marksmith markdown editor inside its own card — type markdown then toggle Preview" },
  },

  // nested-records-when-creating (guides/nested-records-when-creating.md) — creating nested has_many
  // records inline on the New form. The demo's Fish resource already wires the guide's setup: a
  // `tool Avo::ResourceTools::NestedFishReviews, only_on: :new` renders a "Reviews" panel with an
  // "Add another review" button; clicking it appends a review sub-form (a Trix body + a belongs_to
  // user select) via the stimulus-rails-nested-form controller. GIF: Fish New form, the empty
  // Reviews panel → click "Add another review" → one review form appears → click again → a second
  // appears. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Clip frames the nested Reviews panel
  // as it grows. Viewport tall enough to fit two review forms without the 2nd one clipping.
  {
    id: "guide-nested-records-when-creating-nested-records-demo",
    path: "/avo/resources/fish/new",
    viewport: { width: 1180, height: 1340 },
    settle: 1000,
    clip: { x: 15, y: 290, width: 1150, height: 648 },
    width: 920,
    delay: 24,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      // The Fish New form stacks other tool panels (FishInformation) and the has_many reviews
      // table right below the nested Reviews panel; hide everything except the Reviews panel so the
      // growing panel sits on clean mat (RULES 15j) and nothing bleeds into the bottom of the clip.
      await page.addStyleTag({ content: `
        [data-controller="nested-form"] { background: transparent; }
      ` });
      await page.evaluate(() => {
        const nf = document.querySelector('[data-controller="nested-form"]');
        const reviewsPanel = nf.closest('.panel') || nf.querySelector('.panel') || nf;
        // hide every panel that starts BELOW the reviews panel's top, so the growing reviews
        // panel sits on clean mat and nothing bleeds into the bottom of the clip.
        const top = reviewsPanel.getBoundingClientRect().top;
        document.querySelectorAll('.panel').forEach((p) => {
          if (p === reviewsPanel || reviewsPanel.contains(p) || p.contains(reviewsPanel)) return;
          if (p.getBoundingClientRect().top >= top + 5) p.style.visibility = 'hidden';
        });
      });
      await page.waitForTimeout(500);

      const addBtn = page.locator('[data-action="click->nested-form#add"]').first();
      await page.waitForTimeout(300);
      await snap(8); // hold on the empty Reviews panel + the "Add another review" button

      await addBtn.click();
      await page.waitForTimeout(900); // Trix editor + user select render
      await snap(9); // one review sub-form appeared (body + user)

      // type a short review body into the first Trix editor to show it's a real, fillable form
      const trix = page.locator('trix-editor').first();
      if (await trix.count()) {
        await trix.click();
        await page.keyboard.type('Great little fish!', { delay: 45 });
        await page.waitForTimeout(400);
        await snap(7);
      }

      await addBtn.click();
      await page.waitForTimeout(900);
      await snap(11); // a second review sub-form appended — hold longer at the end
    },
    out: "docs/public/assets/img/4_0/guides/nested-records-when-creating/nested-records-demo.gif",
    alt: "Creating nested review records inline on the Fish New form: clicking Add another review appends review sub-forms, each with a body editor and a user picker.",
    source: { file: "docs/4.0/guides/nested-records-when-creating.md", prompt: "creating nested has_many records inline on a New form" },
  },

  // action-link (actions/guides-and-tutorials.md "### `link_arguments`") — an Action rendered/
  // triggered as a LINK. The demo's City resource has a "name (click to edit)" field on the Index
  // whose cell is `link_to record.name, *Avo::Actions::Update.link_arguments(...)` — clicking it
  // opens the Update action MODAL (data-turbo-frame="modal_frame") with a prefilled `name` field;
  // running it updates the row. GIF: Cities TABLE index (view_type=table avoids the map, which needs
  // MAPBOX), hover+focus the "New York" name link (native ring marks the trigger, RULES 15a/15b),
  // click it → the action modal slides in with the name field, edit it, then Run → success toast +
  // the row's name updates. Sidebar closed + mat bg (RULES 12/19a); hideKbd. Clip frames the table
  // card + the modal that opens over it.
  {
    id: "action-link",
    path: "/avo/resources/cities?per_page=6&view_type=table",
    viewport: { width: 1120, height: 820 },
    settle: 1000,
    clip: { x: 8, y: 52, width: 1104, height: 509 }, // probed: breadcrumb y60, panel bottom 551; 8px mat top, 10px mat bottom
    width: 1104,
    delay: 24,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      const link = page.locator('[data-field-id="name"] a[data-turbo-frame="modal_frame"]').first();
      await link.scrollIntoViewIfNeeded();
      await link.hover();
      await link.focus(); // native :focus-visible ring marks the link trigger
      await snap(8); // hold ~2s on the index with the name link focused (the "action as a link")

      await link.click();
      // wait for the action modal to load inside the modal_frame
      await page.waitForSelector('#modal_frame form, [data-turbo-frame="modal_frame"] form, dialog form', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(900);
      await snap(8); // hold on the open action modal with the prefilled name field

      // Edit the name then run the action.
      const input = page.locator('#modal_frame input[type="text"], dialog input[type="text"]').first();
      if (await input.count()) {
        await input.click();
        await input.fill("");
        await input.type("New York City", { delay: 55 });
        await page.waitForTimeout(300);
        await snap(7); // hold on the edited value
      }
      const run = page.locator('#modal_frame button[type="submit"], dialog button[type="submit"], [data-turbo-frame="modal_frame"] button[type="submit"]').first();
      if (await run.count()) {
        await run.click();
        await page.waitForTimeout(1400); // action runs, modal closes, row updates + toast
        await snap(10); // hold on the success / updated row
      }
    },
    out: "docs/public/assets/img/4_0/actions/action-link.gif",
    alt: "An Avo Cities index where a record's name is a clickable link; clicking it opens an Update action modal with a prefilled name field, which when run updates the row.",
    source: { file: "docs/4.0/actions/guides-and-tutorials.md", prompt: "an Action rendered/triggered as a link" },
  },

  // select-all (select-all.md "## How does it work?") — selecting ALL records on an index including
  // the "select all across pages" affordance. Projects index (36 records, per_page=6). GIF:
  // unselected → header checkbox checked (red group box around header + row checkboxes) → banner
  // with "Select all matching" highlighted (red focus ring) → click → "36 records selected from all
  // pages". Dark-mode fix: the count spans use text-gray-700 which vanishes on bg-secondary —
  // injectCSS overrides in dark.
  {
    id: "select-all",
    path: "/avo/resources/projects?per_page=6",
    viewport: { width: 1160, height: 760 },
    settle: 1000,
    clip: { x: 4, y: 102, width: 1152, height: 600 },
    width: 1152,
    delay: 26,
    steps: async (page, snap) => {
      const checkboxColumnBox = () =>
        page.evaluate(() => {
          const boxes = [
            ...document.querySelectorAll(
              'input[name="Select all"][data-item-select-all-target="checkbox"], table tbody input[type="checkbox"]',
            ),
          ].map((el) => el.getBoundingClientRect());
          const x1 = Math.min(...boxes.map((b) => b.x));
          const y1 = Math.min(...boxes.map((b) => b.y));
          const x2 = Math.max(...boxes.map((b) => b.x + b.width));
          const y2 = Math.max(...boxes.map((b) => b.y + b.height));
          return { x: Math.round(x1), y: Math.round(y1), width: Math.round(x2 - x1), height: Math.round(y2 - y1) };
        });

      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await injectCSS(`
        @media (prefers-color-scheme: dark) {
          [data-item-select-all-target="unselectedMessage"] .text-gray-700,
          [data-item-select-all-target="selectedMessage"] .text-gray-700 {
            color: var(--color-content, oklch(0.95 0 0)) !important;
          }
        }
      `)(page);
      await page.waitForTimeout(400);

      await snap(8, false); // index, nothing selected

      const header = page.locator('input[name="Select all"][data-item-select-all-target="checkbox"]').first();
      await header.click();
      await page.waitForTimeout(500);
      const columnBox = await checkboxColumnBox();
      await snap(10, [{ box: columnBox, type: "highlight", color: "#ef4444" }]);

      const selectAll = page.locator('[data-item-select-all-target="unselectedMessage"] a[data-action="click->item-select-all#selectAll"]').first();
      await snap(8, [{ selector: '[data-item-select-all-target="unselectedMessage"] a[data-action="click->item-select-all#selectAll"]', type: "highlight", style: "focus", color: "#ef4444" }]);

      await selectAll.click();
      await page.waitForTimeout(700);
      await snap(12, false); // "36 records selected from all pages"
    },
    out: "docs/public/assets/img/4_0/select-all/select-all.gif",
    alt: "An Avo Projects index where checking the header Select all checkbox selects the page and offers a Select all matching link, which selects all 36 records across every page.",
    source: { file: "docs/4.0/select-all.md", prompt: "selecting all records on an index including the select all across pages affordance" },
  },

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

  // basic-filters-country-city GIF — Courses index: table (ID/Name/Country/City only) + Filters
  // panel. Annotate Filters button → open panel (empty_message) → annotate USA → tick → cities populate.
  {
    id: "basic-filters-country-city",
    path: "/avo/resources/courses?view_type=table&per_page=5",
    viewport: { width: 1440, height: 950 },
    settle: 900,
    clip: { x: 14, y: 184, width: 1412, height: 412 },
    width: 1412,
    delay: 20,
    steps: async (page, snap) => {
      const filterBtnMark = [{ selector: '[data-button="resource-filters"]', type: "highlight", style: "focus", color: "#ef4444" }];
      const usaMark = [{ selector: '.filters__panel label:has-text("USA")', type: "highlight", style: "focus", color: "#ef4444" }];

      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({
        content: `table thead th:nth-child(4), table tbody td:nth-child(4),
          table thead th:nth-child(5), table tbody td:nth-child(5) { display: none !important; }`,
      });
      await page.waitForTimeout(300);

      await snap(5, false); // index with table, panel closed
      await snap(8, filterBtnMark); // highlight Filters button
      await page.locator('[data-button="resource-filters"]').first().click();
      await page.waitForTimeout(900);
      await snap(12, false); // panel open: city filter empty_message over the table

      await snap(8, usaMark); // highlight USA checkbox
      await page.getByRole("checkbox", { name: "USA" }).check();
      await page.waitForLoadState("networkidle");
      await page.waitForSelector('.filters__panel label:has-text("New York"), .filters__panel label:has-text("Los Angeles")', { timeout: 15000 });
      await page.waitForTimeout(1200);
      await snap(16, false); // USA checked, US cities populated, first city auto-selected
    },
    out: "docs/public/assets/img/4_0/filters/country-city-filters.gif",
    alt: "An Avo Courses index with the table visible: the Filters button is highlighted, the panel opens showing the city filter empty message, USA is ticked, and US cities populate with the first one auto-selected.",
    source: { file: "docs/4.0/basic-filters.md", prompt: "single gif: filters panel over table, empty message, tick USA, cities populate" },
  },

  // TODO(screenshot→gif): parked — replace docs/public/assets/img/4_0/associations/has-many-linkable.png
  // with .gif once the 4-beat animation reads clearly. Static spec: SPECS `has-many-linkable`.
  {
    id: "has-many-linkable-gif",
    path: "/avo/resources/teams/1",
    viewport: { width: 1120, height: 760 },
    settle: 1200,
    clip: { x: 12, y: 78, width: 1080, height: 600 },
    width: 1080,
    delay: 22,
    steps: async (page, snap) => {
      const PIN_Y = 90;
      const CLIP = { x: 12, y: 78, width: 1080, height: 600 };
      const linkSel = '#has_many_field_show_memberships a[has-data-tippy="Open in a new tab"]';
      const iconMark = [{ selector: linkSel, type: "highlight", style: "focus" }];

      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({ content: `a[href^="cursor://"] { display: none !important; }` });

      // Lazy-load the Memberships frame, then scroll back to top so the clip shows Team context.
      await page.evaluate(() => document.getElementById("has_many_field_show_memberships")?.scrollIntoView({ block: "start" }));
      await page.locator("#has_many_field_show_memberships[complete]").waitFor({ timeout: 15000 });
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
      await snap(10, false, CLIP); // beat 1: Team show — breadcrumbs, "Apple", Memberships below

      await page.evaluate((py) => {
        const f = document.getElementById("has_many_field_show_memberships");
        window.scrollBy(0, f.getBoundingClientRect().top - py);
      }, PIN_Y);
      await page.waitForTimeout(700);
      await snap(6, false, CLIP); // beat 2: scrolled to the Memberships panel on the Team show page

      await snap(7, iconMark, CLIP); // beat 3: red highlight on the linkable icon

      const dest = await page.locator(linkSel).first().getAttribute("href");
      await page.goto(new URL(dest, page.url()).toString(), { waitUntil: "networkidle" });
      await page.waitForTimeout(1400);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({ content: `a[href^="cursor://"] { display: none !important; }` });
      await page.evaluate((py) => { const h = document.querySelector(".header"); if (h) window.scrollBy(0, h.getBoundingClientRect().top - py); }, PIN_Y);
      await page.waitForTimeout(600);
      await snap(12, false, CLIP); // beat 4: dedicated Memberships page (breadcrumbs visible)
    },
    out: "docs/public/assets/img/4_0/associations/has-many-linkable.gif",
    alt: "An Avo Team show view: the Memberships has_many association panel whose linkable title icon is clicked, opening the same Memberships table on its own dedicated page.",
    source: { file: "docs/4.0/associations/has_many.md", prompt: "linkable association title opens the same view on a new page" },
  },

  // has_many `attach_fields` (has_many.md) — 2-beat GIF from the static PNG pair: Team show with red
  // highlight on Attach team member → click → modal (Review attach field). Same scroll pin as SPECS.
  // Temp (revert after): team.rb attach_fields → review text; TeamPolicy view/attach/create_team_members.
  {
    id: "has-many-attach-fields-gif",
    path: "/avo/resources/teams/1",
    viewport: { width: 1120, height: 760 },
    settle: 1200,
    clip: { x: 12, y: 78, width: 1080, height: 600 },
    width: 1080,
    delay: 22,
    steps: async (page, snap) => {
      const attachSel = '#has_many_field_show_team_members a:has-text("Attach team member")';
      const modalSel = '.modal__card[data-modal-target="card"]';
      const attachMark = [{ selector: attachSel, type: "highlight", style: "focus" }];

      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({ content: `a[href^="cursor://"] { display: none !important; }` });

      await page.evaluate(() => document.getElementById("has_many_field_show_team_members")?.scrollIntoView({ block: "start" }));
      await page.locator(attachSel).first().waitFor({ state: "visible", timeout: 20000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(800);
      await snap(12, attachMark); // beat 1: Team show + Attach highlighted

      await page.locator(attachSel).first().click();
      await page.locator(modalSel).waitFor({ state: "visible", timeout: 10000 });
      await page.waitForTimeout(1200);
      await snap(16, false); // beat 2: attach modal open
    },
    out: "docs/public/assets/img/4_0/associations/has-many-attach-fields.gif",
    alt: "An Avo Team show view: clicking Attach team member on the Team members has_many through association opens a modal with the member dropdown and an extra Review text field from attach_fields.",
    source: { file: "docs/4.0/associations/has_many.md", prompt: "attach modal showing extra attach_fields on the join table" },
  },

  // sidebar-toggle-visible (customization.md "## Toggle the sidebar button visibility") — the navbar
  // toggle button (top-left hamburger) that collapses/expands the sidebar on desktop. This shows the
  // DEFAULT behaviour (the button IS visible, `sidebar_toggle_visible` left at its default true). GIF
  // on the Projects index: start with the sidebar OPEN, click the toggle (button[data-action=
  // "click->sidebar#toggleSidebarForViewport"]) → sidebar collapses + content reflows full-width;
  // click again → sidebar expands back. matBg + hideKbd; sidebar stays open at start (no closeSidebar —
  // the open→collapsed→open animation IS the subject). Clip frames the navbar toggle + sidebar +
  // left content so the collapse/expand reads clearly.
  {
    id: "sidebar-toggle-visible",
    path: "/avo/resources/projects?per_page=6",
    viewport: { width: 1280, height: 800 },
    settle: 900,
    clip: { x: 0, y: 0, width: 820, height: 720 },
    width: 820,
    delay: 14,
    steps: async (page, snap) => {
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(300);
      const toggle = page.locator('button[data-action="click->sidebar#toggleSidebarForViewport"]').first();

      await snap(10); // hold ~2s on the default state — sidebar open, toggle button visible

      await toggle.click(); // collapse the sidebar
      await page.waitForTimeout(500);
      await snap(12); // hold on the collapsed state — content reflowed full-width

      await toggle.click(); // expand it back
      await page.waitForTimeout(500);
      await snap(12); // hold on the re-expanded state
    },
    out: "docs/public/assets/img/4_0/customization/sidebar-toggle-visible.gif",
    alt: "An Avo resource index where clicking the navbar toggle button collapses the sidebar and clicking it again expands it.",
    source: { file: "docs/4.0/customization.md", prompt: "toggling the sidebar visibility with the navbar toggle button" },
  },

  // click-row-to-view-record (customization.md "`click_row_to_view_record`") — UserPanelsDemo
  // index (id + name) → red-annotate the name cell → click row → Show with panel/card DSL
  // (main panel + "User information" panel). click_row_to_view_record is on in demo avo.rb.
  {
    id: "click-row-to-view-record",
    path: "/avo/resources/user_panels_demos?per_page=6",
    viewport: { width: 1200, height: 900 },
    settle: 1000,
    clip: { x: 15, y: 52, width: 1170, height: 478 },
    width: 1170,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await injectCSS(
        'th[data-control="item-select-th"], td[data-control="item-select-td"] { display: none !important; }',
      )(page);
      await page.waitForTimeout(400);

      const clip = { x: 15, y: 52, width: 1170, height: 478 };
      const rowCell = 'table tbody tr:nth-child(3) td[data-field-id="name"]';
      const clickMark = [{ selector: rowCell, type: "highlight", color: "#ef4444", pad: 4, radius: 6 }];

      await snap(10, false, clip); // index — breadcrumbs + table

      const cell = page.locator(rowCell);
      await cell.scrollIntoViewIfNeeded();
      await cell.hover();
      await page.waitForTimeout(400);
      await snap(12, clickMark, clip); // hovered row — red ring on the name cell we click

      await cell.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(900);
      await matBg(page);
      await hideKbd(page);
      await snap(14, false, clip); // show — panel + named "User information" card
    },
    out: "docs/public/assets/img/4_0/customization/click-row-to-view-record.gif",
    alt: "An Avo resource index where a row name cell is highlighted, clicked, and navigates to the record show view with panel and card DSL layout.",
    source: { file: "docs/4.0/customization.md", prompt: "clicking a row navigates to its show view" },
  },

  // skip-show-view (customization.md "## Skip show view") — with resource_default_view = :edit
  // (demo avo.rb) creating a course redirects to Edit, not Show. GIF: new form → fill name +
  // check Availability → annotate Save → click → land on Edit (breadcrumb ends in /edit).
  {
    id: "skip-show-view",
    path: "/avo/resources/courses/new",
    viewport: { width: 1200, height: 900 },
    settle: 900,
    clip: { x: 15, y: 52, width: 1170, height: 412 },
    width: 1170,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      const clip = { x: 15, y: 52, width: 1170, height: 412 };
      const saveMark = [{ selector: '[data-resource-edit-target="saveButton"]', type: "highlight", color: "#ef4444", pad: 4, radius: 6 }];

      await snap(10, false, clip); // Create new course — empty form

      await page.locator('[data-field-id="name"] input').fill("Skip Show View");
      await page.locator('[data-field-id="has_skills"] input[type="checkbox"]').check();
      await page.waitForTimeout(400);
      await snap(10, false, clip); // name + Availability filled

      await snap(12, saveMark, clip); // Save button annotated

      await page.locator('[data-resource-edit-target="saveButton"]').click();
      await page.waitForURL(/\/avo\/resources\/courses\/\d+\/edit/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await matBg(page);
      await hideKbd(page);
      await snap(14, false, clip); // Edit view — skipped Show
    },
    out: "docs/public/assets/img/customization/skip_show_view.gif",
    alt: "An Avo create form for a course: after saving, Avo redirects to the Edit view instead of Show when skip_show_view is enabled.",
    source: { file: "docs/4.0/customization.md", prompt: "creating a record redirects to edit instead of show when skip_show_view is enabled" },
  },

  // custom-fields hidden_input_color (custom-fields.md "### Hidden input controller" → the
  // ColorPickerField example) — a custom color field on the SHOW view using Avo's `hidden-input`
  // Stimulus controller in the default INLINE field-wrapper layout (label "Color" on the left,
  // "Show content" link on the right). Clicking reveals the purple swatch pill with the hex value.
  // Temp files (removed after capture): ProgressShotDemo resource + ColorPickerField matching the
  // doc snippet exactly. Viewport 900px so the wrapper is side-by-side (760px stacks vertically).
  // Clip = the Color card sized for the revealed state + symmetric mat (RULES 10b/13).
  {
    id: "hidden_input_color",
    path: "/avo/resources/progress_shot_demos/1",
    viewport: { width: 900, height: 600 },
    settle: 1200,
    clip: { x: 8, y: 144, width: 884, height: 86 },
    width: 900,
    delay: 22,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.waitForTimeout(500);

      await snap(10); // inline row — "Color" label left, "Show content" link right
      await page.locator('[data-controller="hidden-input"] a').first().click();
      await page.waitForTimeout(350);
      await snap(16); // swatch pill revealed on the right
    },
    out: "docs/public/assets/img/4_0/stimulus/hidden_input_color.gif",
    alt: "A custom color field on an Avo Show view using the hidden-input controller: the Color label on the left and a Show content link on the right that, when clicked, reveals a colored swatch pill showing the hex value.",
    source: { file: "docs/4.0/custom-fields.md", prompt: "the hidden input controller revealing a color swatch on show" },
  },

  // custom-fields hidden_input_trix (custom-fields.md "### Hidden input controller" → the Trix field
  // example) — the built-in Trix show field uses the `trix-body` Stimulus controller (same hide/show
  // pattern as `hidden-input`): long HTML starts collapsed with a "More content" link; clicking it
  // reveals the rich text and swaps to "Less content". Temp edit (reverted after capture): the demo's
  // TrixDemo resource shows `field :body, as: :trix` on the SHOW view (`only_on: [:show, :edit]`
  // instead of `:forms`). Record id 1 has enough body HTML to trigger the link. Sidebar closed + mat
  // bg; clip = the Body card sized for the revealed (taller) state with symmetric mat (RULES 10b/13).
  {
    id: "hidden_input_trix",
    path: "/avo/resources/trix_demos/1",
    viewport: { width: 1000, height: 900 },
    settle: 1200,
    clip: { x: 8, y: 144, width: 984, height: 274 },
    width: 1000,
    delay: 22,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.addStyleTag({ content: "a[href^='cursor://']{display:none!important}" });
      await page.waitForTimeout(500);

      await snap(10); // Body card collapsed — "More content" link visible
      await page.locator('[data-trix-body-target="moreContentButton"] a').click();
      await page.waitForTimeout(350);
      await snap(16); // rich text revealed — "Less content" link visible
    },
    out: "docs/public/assets/img/4_0/stimulus/hidden_input_trix.gif",
    alt: "A Trix field on an Avo Show view with long content collapsed behind a “More content” link that, when clicked, reveals the rich text.",
    source: { file: "docs/4.0/custom-fields.md", prompt: "the Trix field hiding long content behind a more content link on show" },
  },

  // ── stimulus-integration.md (Stimulus JS & HTML attributes) ─────────────────────────────
  // Four GIFs of Stimulus controllers wired into Avo fields on the Course EDIT form. The demo's
  // Course resource (app/avo/resources/course.rb) already wires `self.stimulus_controllers =
  // "course-resource toggle-fields"` and the pre-made resource-edit methods on the relevant
  // fields, so these capture the REAL documented behaviour. Common framing for all four: the
  // edit form's field card on a narrow viewport (vw 900 → card ~868px CSS, displays ~1×, RULES
  // 9b); sidebar closed + mat bg (RULES 12/19a); hideKbd. Clip = the whole field card + ~10px
  // symmetric mat so every edge reads as mat and the component shows whole (RULES 10b/15y).

  // stimulus-country-city — `Custom Stimulus controllers` country→city dependent select. One red
  // highlight around BOTH Country + City rows; Country + City rows only (sibling fields hidden) with
  // a console readout below showing the real logged output on each country change (devtools can't be
  // screenshotted — same pattern as stimulus-debug). Closed single-line <select>s; values change via
  // selectOption after each country pick repopulates city (react_on: :country). GIF: Japan → USA +
  // New York → Spain + Barcelona.
  {
    id: "stimulus-country-city",
    path: "/avo/resources/courses/1/edit",
    viewport: { width: 900, height: 1000 },
    settle: 1000,
    clip: { x: 11, y: 201, width: 878, height: 244 },
    width: 878,
    delay: 24,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(600);

      // Country + City only — hide sibling rows; neutralize card border (RULES 15s).
      await page.addStyleTag({
        content:
          '[data-field-id]:not([data-field-id="country"]):not([data-field-id="city"]) { display: none !important; }' +
          ".card:not(.relative) { border-color: transparent !important; box-shadow: none !important; }",
      });

      // Console readout pinned below the City row — echoes genuine console.log lines (see logCountryAndCities).
      await page.evaluate(() => {
        const anchor = document.querySelector('[data-field-id="city"]');
        const box = document.createElement("div");
        box.id = "debug-console-readout";
        box.style.cssText =
          "margin:10px 5px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;" +
          "background:#0b0f19;color:#d1d5db;border-radius:8px;padding:10px 12px;" +
          "max-height:130px;overflow:hidden;border:1px solid rgba(255,255,255,.08);";
        const head = document.createElement("div");
        head.textContent = "// browser console";
        head.style.cssText = "color:#6b7280;margin-bottom:4px;";
        box.appendChild(head);
        const log = document.createElement("div");
        log.id = "debug-console-log";
        box.appendChild(log);
        anchor.parentElement.insertBefore(box, anchor.nextSibling);
        window.__pushConsole = (line) => {
          const el = document.getElementById("debug-console-log");
          if (!el) return;
          const row = document.createElement("div");
          row.innerHTML =
            '<span style="color:#34d399">&rsaquo;</span> ' +
            line.replace(/</g, "&lt;");
          el.appendChild(row);
          while (el.childElementCount > 4) el.removeChild(el.firstChild);
        };
      });

      page.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("onCountryChange") || t.startsWith("Cities:"))
          page.evaluate((s) => window.__pushConsole(s), t).catch(() => {});
      });

      const countrySel = '[data-field-id="country"] select';
      const citySel = '[data-field-id="city"] select';
      const pairMark = async () => {
        const box = await page.evaluate(() => {
          const country = document.querySelector('[data-field-id="country"]');
          const city = document.querySelector('[data-field-id="city"]');
          const cr = country.getBoundingClientRect();
          const cir = city.getBoundingClientRect();
          return {
            x: Math.min(cr.x, cir.x),
            y: cr.y,
            width: Math.max(cr.width, cir.width),
            height: cir.bottom - cr.y,
          };
        });
        return [{ box, type: "highlight", style: "focus", color: "#ef4444" }];
      };
      const logCountryAndCities = async () => {
        await page.evaluate(() => {
          const country = document.querySelector('[data-field-id="country"] select')?.value ?? "";
          console.log(`onCountryChange → ${country}`);
          const citySelect = document.querySelector('[data-field-id="city"] select');
          const cities = citySelect
            ? [...citySelect.options].map((o) => o.value).filter(Boolean)
            : [];
          console.log(`Cities: [${cities.join(", ")}]`);
        });
        await page.waitForTimeout(250);
      };

      await logCountryAndCities();
      await snap(8, await pairMark()); // Japan, city empty, console shows initial country + cities

      await page.locator(countrySel).selectOption("USA");
      await page.waitForTimeout(1100);
      await logCountryAndCities();
      await snap(10, await pairMark()); // USA selected, city repopulated + console updated

      await page.locator(citySel).selectOption("New York");
      await page.waitForTimeout(500);
      await snap(10, await pairMark()); // USA + New York

      await page.locator(countrySel).selectOption("Spain");
      await page.waitForTimeout(1100);
      await logCountryAndCities();
      await snap(10, await pairMark()); // Spain selected, city list swapped + console updated

      await page.locator(citySel).selectOption("Barcelona");
      await page.waitForTimeout(500);
      await snap(10, await pairMark()); // Spain + Barcelona
    },
    out: "docs/public/assets/img/4_0/stimulus/country-city-select.gif",
    alt: "An Avo Course edit form with Country and City highlighted together and a browser console readout below: picking USA repopulates the city select and logs the new options, then New York is chosen; switching to Spain swaps the city list and Barcelona is selected.",
    source: { file: "docs/4.0/stimulus-integration.md", prompt: "selecting a country repopulates a dependent city select" },
  },

  // stimulus-toggle — `resource-edit#toggle` pre-made method. The `has_skills` boolean carries
  // `action: "input->resource-edit#toggle"` + `resource_edit_toggle_target_param:
  // "skills_tags_wrapper"`, so toggling it shows/hides the `skills` field wrapper. GIF: start with
  // the checkbox on (skills visible) → uncheck (skills row hidden) → check again (skills row back).
  // Clip sized to the skills-VISIBLE (tallest) state so the hidden state just shows clean mat below.
  {
    id: "stimulus-toggle",
    path: "/avo/resources/courses/1/edit",
    viewport: { width: 900, height: 1000 },
    settle: 1000,
    clip: { x: 6, y: 196, width: 888, height: 274 },
    width: 888,
    delay: 26,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(600);

      const cb = page.locator('[data-field-id="has_skills"] input[type="checkbox"]').first();
      await snap(9); // checkbox on → Skills field visible

      await cb.click();
      await page.waitForTimeout(500);
      await snap(11); // checkbox off → Skills field hidden

      await cb.click();
      await page.waitForTimeout(500);
      await snap(10); // checkbox on again → Skills field back
    },
    out: "docs/public/assets/img/4_0/stimulus/toggle-method.gif",
    alt: "An Avo Course edit form where toggling the Availability boolean uses resource-edit#toggle to show and hide the Skills field.",
    source: { file: "docs/4.0/stimulus-integration.md", prompt: "a stimulus action toggling another field's visibility" },
  },

  // stimulus-disable — `resource-edit#disable` pre-made method. Like toggle, but DISABLES the target
  // field instead of hiding it. Requires a temp edit to the Course resource: switch the `has_skills`
  // boolean's html action to `input->resource-edit#disable` with
  // `resource_edit_disable_target_param: "name_text_input"`, per the doc's `### resource-edit#disable`
  // example. NOTE: the doc example names the COUNTRY select as the target, but Avo v4 applies NO
  // visible style to a disabled <select> (it only sets the DOM `disabled` attr — verified: identical
  // color/bg/cursor), so a select target produces a "nothing happens" animation. A disabled TEXT
  // input DOES grey out in v4 (text color oklch .20 → .53, cursor text → default), so we target the
  // Name text field — the same genuine resource-edit#disable method, on a field type whose disabled
  // state v4 actually renders, giving a faithful, legible animation. GIF: checkbox on → Name input
  // enabled (dark text) → uncheck → Name input disabled (greyed text) → check → enabled again. Temp
  // edit reverted after capture.
  {
    id: "stimulus-disable",
    path: "/avo/resources/courses/1/edit",
    viewport: { width: 900, height: 1000 },
    settle: 1000,
    clip: { x: 6, y: 196, width: 888, height: 274 },
    width: 888,
    delay: 26,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(600);

      const cb = page.locator('[data-field-id="has_skills"] input[type="checkbox"]').first();
      await snap(9); // checkbox on → Name input enabled (dark text)

      await cb.click();
      await page.waitForTimeout(500);
      await snap(11); // checkbox off → Name input disabled (greyed text)

      await cb.click();
      await page.waitForTimeout(500);
      await snap(10); // checkbox on again → Name input enabled
    },
    out: "docs/public/assets/img/4_0/stimulus/disable-method.gif",
    alt: "An Avo Course edit form where toggling the Availability boolean uses resource-edit#disable to disable and re-enable the Name field, greying it out.",
    source: { file: "docs/4.0/stimulus-integration.md", prompt: "a stimulus action disabling/enabling a field" },
  },

  // stimulus-debug — `resource-edit#debugOnInput` pre-made method. The `name` text field carries
  // `action: "input->resource-edit#debugOnInput"`, which logs the event + value to the browser
  // console on each keystroke (debugging only). A page screenshot can't show the devtools console,
  // so we render the controller's REAL emitted output into a small console-styled readout pinned
  // below the field: we listen to `page.on("console")` and echo each genuine `onInput …` line the
  // method logs (real data, not a faked component). To keep the shot a clean self-contained
  // fragment (Name field + console only), the sibling field rows are hidden and the card's own
  // border neutralized so the docs frame supplies the border (RULES 15s). GIF: type into the Name
  // field char-by-char; each keystroke appends the real logged line to the console readout.
  {
    id: "stimulus-debug",
    path: "/avo/resources/courses/1/edit",
    viewport: { width: 900, height: 1000 },
    settle: 1000,
    clip: { x: 6, y: 200, width: 888, height: 210 },
    width: 888,
    delay: 30,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(600);

      // Isolate the Name field: hide the other rows + neutralize the card border so the shot is a
      // clean Name+console fragment framed by the docs border (RULES 15s), not a sliced card.
      await page.addStyleTag({
        content:
          '[data-field-id]:not([data-field-id="name"]) { display: none !important; }' +
          ".card:not(.relative) { border-color: transparent !important; box-shadow: none !important; }",
      });

      // A console-styled readout pinned right under the Name field so the GIF can SHOW the real
      // console output the debugOnInput method emits (a page screenshot can't capture devtools).
      await page.evaluate(() => {
        const anchor = document.querySelector('[data-field-id="name"]');
        const box = document.createElement("div");
        box.id = "debug-console-readout";
        box.style.cssText =
          "margin:10px 5px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;" +
          "background:#0b0f19;color:#d1d5db;border-radius:8px;padding:10px 12px;" +
          "max-height:130px;overflow:hidden;border:1px solid rgba(255,255,255,.08);";
        const head = document.createElement("div");
        head.textContent = "// browser console";
        head.style.cssText = "color:#6b7280;margin-bottom:4px;";
        box.appendChild(head);
        const log = document.createElement("div");
        log.id = "debug-console-log";
        box.appendChild(log);
        anchor.parentElement.insertBefore(box, anchor.nextSibling);
        window.__pushConsole = (line) => {
          const el = document.getElementById("debug-console-log");
          if (!el) return;
          const row = document.createElement("div");
          row.innerHTML =
            '<span style="color:#34d399">&rsaquo;</span> ' +
            line.replace(/</g, "&lt;");
          el.appendChild(row);
          while (el.childElementCount > 5) el.removeChild(el.firstChild);
        };
      });

      // Forward the REAL controller console output into the readout.
      page.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("onInput")) page.evaluate((s) => window.__pushConsole(s), t).catch(() => {});
      });

      const name = page.locator('[data-field-id="name"] input').first();
      await name.click();
      await name.fill("");
      await page.waitForTimeout(300);
      await snap(6); // empty field + empty console readout

      for (const ch of "Stimulus".split("")) {
        await name.type(ch, { delay: 30 });
        await page.waitForTimeout(220); // let the console event round-trip into the readout
        await snap(3); // each keystroke logs the real onInput event + value
      }
      await snap(8); // hold on the final state
    },
    out: "docs/public/assets/img/4_0/stimulus/debug-on-input.gif",
    alt: "An Avo Course edit form Name field wired to resource-edit#debugOnInput; typing logs each input event and value, shown in a console readout below the field.",
    source: { file: "docs/4.0/stimulus-integration.md", prompt: "a debug controller logging input as you type" },
  },

  // guide-export-to-csv (guides/export-to-csv.md) — selecting records + running an Export-to-CSV
  // action. The demo registers `Avo::Actions::ExportCsv` (self.confirmation = true) on the Projects
  // resource, exactly the guide's action. GIF walks the real flow on the Projects table index: select
  // three rows (header/row checkboxes) → open the Actions dropdown → the "Export csv" item appears →
  // click it → the action's confirmation modal slides in ("Are you sure you want to run this action?")
  // with Cancel / Run → click Run → the CSV downloads and the index returns. (The browser's file-save
  // is OS-level and not part of the page surface, so the GIF ends on the action having run — RULES'
  // native-dialog limitation, same as basic-auth; the selectable flow up to Run is the documentable
  // part.) Sidebar closed + mat bg (RULES 12/19a); hideKbd. clip frames the Actions button → dropdown
  // → table card → the confirmation modal that opens over it (RULES 15a triggered-in-context).
  {
    id: "guide-export-to-csv-export-to-csv",
    path: "/avo/resources/projects?per_page=6&view_type=table",
    viewport: { width: 1200, height: 850 },
    settle: 1000,
    clip: { x: 12, y: 108, width: 1176, height: 540 },
    width: 1176,
    delay: 26,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      await snap(7); // index, nothing selected

      // select three rows
      const rows = page.locator('tbody tr input[type="checkbox"]');
      for (let i = 0; i < 3; i++) await rows.nth(i).click();
      await page.waitForTimeout(400);
      await snap(8); // three rows selected

      // open the Actions dropdown
      const actions = page.locator('button:has-text("Actions"), a:has-text("Actions")').first();
      await actions.click();
      await page.waitForTimeout(600);
      await snap(9); // dropdown open showing "Export csv"

      // click the Export csv action → confirmation modal
      await page.locator('a:has-text("Export csv"), button:has-text("Export csv")').first().click();
      await page.waitForSelector('text=Are you sure you want to run this action', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(700);
      await snap(10); // confirmation modal with Cancel / Run

      // run the action
      const run = page.locator('#modal_frame button[type="submit"], dialog button[type="submit"], [data-turbo-frame="modal_frame"] button[type="submit"]').first();
      if (await run.count()) {
        await run.click();
        await page.waitForTimeout(1400); // action runs (CSV downloads), modal closes, index returns
      }
      await snap(10); // hold on the index after the action ran
    },
    out: "docs/public/assets/img/4_0/guides/export-to-csv/export-to-csv.gif",
    alt: "An Avo Projects index where three records are selected, the Actions dropdown is opened, the Export csv action is chosen, and its confirmation modal is run to export the records to a CSV file.",
    source: { file: "docs/4.0/guides/export-to-csv.md", prompt: "selecting records + running an export-to-CSV action" },
  },

  // guide-act-as-taggable-on (guides/act-as-taggable-on-integration.md) — a tags field backed by the
  // acts-as-taggable-on gem, with the add-a-tag interaction. The guide's first line says Avo already
  // supports acts-as-taggable-on in the `tags` field; the demo's TagsDemo resource has a real
  // `field :tags, as: :tags, acts_as_taggable_on: :tags` (with suggestions one/two/three). GIF on the
  // TagsDemo NEW form: focus the tags input → type "one" → the suggestions dropdown appears → press
  // Enter to add the chip → type "two" → Enter to add a second chip — the live add-a-tag flow. The
  // field renders in its own real card (with Category/Notes/Reference siblings) so it reads in context
  // (RULES 10b/15z). A narrow 900px viewport keeps the card content-sized (~867px CSS) so it displays
  // near 1×. Sidebar closed + mat bg (RULES 12/19a); hideKbd. clip frames the form card + the
  // suggestions dropdown that opens inside it.
  // NOTE: the legacy 3.0 GIF showed BROWSING tags as RESOURCES (a taggings/tags resource index), which
  // the demo doesn't register; per the task this is resolved as the tags-FIELD add-a-tag interaction
  // (the feature the guide's intro names) instead.
  {
    id: "guide-act-as-taggable-on-act-as-taggable-on-integration",
    path: "/avo/resources/tags_demos/new",
    viewport: { width: 900, height: 760 },
    settle: 900,
    clip: { x: 7, y: 142, width: 887, height: 250 },
    width: 887,
    delay: 26,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await page.waitForTimeout(400);

      await snap(7); // empty tags field with placeholder + help text

      const editable = page.locator('[data-field-id="tags"] .tagify__input').first();
      await editable.click();
      await page.waitForTimeout(400);
      await page.keyboard.type("one", { delay: 110 });
      await page.waitForTimeout(600);
      await snap(9); // typed "one" + suggestions dropdown

      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await snap(8); // first chip added ("one")

      await page.keyboard.type("two", { delay: 110 });
      await page.waitForTimeout(500);
      await snap(7); // typed "two" + suggestion
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await snap(10); // both chips added ("one", "two")
    },
    out: "docs/public/assets/img/4_0/guides/act-as-taggable-on-integration/act-as-taggable-on-integration.gif",
    alt: "An Avo form with a tags field backed by acts-as-taggable-on; typing a tag shows a suggestions dropdown and pressing Enter adds it as a chip, building up a list of tags.",
    source: { file: "docs/4.0/guides/act-as-taggable-on-integration.md", prompt: "a tags field backed by acts-as-taggable-on; record the add-a-tag interaction" },
  },

  // per-page-pagination (customization.md "### Per-page pagination") — Comments index with 4 rows
  // (?per_page=4) and pagination bar. Temp config in comment.rb sets per_page=4 + per_page_steps=
  // [4, 12, 24, 48] (RULES 13). injectCSS forces the per-page popover to open upward so all
  // options stay in frame. GIF: closed picker → open listing 4/12/24/48 → close. Full table
  // card + pagination (RULES 10/10b/15a); sidebar closed + mat bg (RULES 12/19a); hideKbd.
  {
    id: "per-page-pagination",
    path: "/avo/resources/comments?per_page=4",
    viewport: { width: 900, height: 900 },
    settle: 900,
    clip: { x: 6, y: 224, width: 888, height: 280 },
    width: 888,
    delay: 20,
    steps: async (page, snap) => {
      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await injectCSS(
        `[data-component-name="avo/index/table_component"] [data-item-select-all-target="selectAllBanner"],
         .item-select-all-banner { display: none !important; }
         .pagination__per-page .popover-menu__panel {
           position-area: top span-left !important;
           position-try-fallbacks: none !important;
           margin-top: 0 !important;
           margin-bottom: 0.25rem !important;
         }`,
      )(page);
      await page.waitForTimeout(400);

      const clip = { x: 6, y: 224, width: 888, height: 280 };

      await snap(10, false, clip); // 4 rows, "4 per page" closed

      await page.locator(".pagination__per-page-input").click();
      await page.waitForTimeout(500);
      await snap(14, false, clip); // dropdown open above button: 4, 12, 24, 48

      await page.locator(".pagination__per-page-input").click();
      await page.waitForTimeout(500);
      await snap(8, false, clip); // closed again
    },
    out: "docs/public/assets/img/4_0/customization/per-page-pagination.gif",
    alt: "An Avo index table with four rows and a pagination bar; the per-page picker opens upward to list 4, 12, 24 and 48, then closes.",
    source: {
      file: "docs/4.0/customization.md",
      prompt: "index table with 4 rows and pagination bar; per-page picker opens listing 4, 12, 24, 48 then closes",
    },
  },

  // view-type-table-grid (customization.md "### Default view type") — Posts index with 6 records
  // per page (?per_page=6). GIF: table view → red-annotate grid toggle → switch to grid →
  // red-annotate table toggle → switch back to table. Native view-switcher chrome unchanged;
  // only ImageMagick highlight marks (no hover tooltips). Sidebar closed + mat bg; hideKbd.
  {
    id: "view-type-table-grid",
    path: "/avo/resources/posts?view_type=table&per_page=6",
    viewport: { width: 900, height: 1100 },
    settle: 900,
    clip: { x: 6, y: 170, width: 888, height: 650 },
    width: 888,
    delay: 20,
    steps: async (page, snap) => {
      const hideBanner = () =>
        injectCSS(
          `[data-component-name="avo/index/table_component"] [data-item-select-all-target="selectAllBanner"],
           .item-select-all-banner { display: none !important; }`,
        )(page);

      await closeSidebar(page);
      await matBg(page);
      await hideKbd(page);
      await hideBanner();
      await page.waitForTimeout(400);

      const clip = { x: 6, y: 170, width: 888, height: 650 };
      const gridToggle = '[data-control="view-type-toggle-grid"]';
      const tableToggle = '[data-control="view-type-toggle-table"]';
      const mark = (sel) => [{ selector: sel, type: "highlight", color: "#ef4444", pad: 3, radius: 6 }];
      const clearHover = async () => {
        await page.evaluate(() => document.activeElement?.blur());
        await page.mouse.move(400, 400);
        await page.waitForTimeout(150);
      };

      await snap(10, false, clip); // table view, 6 rows

      await clearHover();
      await snap(10, mark(gridToggle), clip); // grid toggle — red mark only

      await page.locator(gridToggle).click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(700);
      await matBg(page);
      await hideKbd(page);
      await hideBanner();
      await page.waitForTimeout(300);
      await snap(12, false, clip); // grid view, 6 cards

      await clearHover();
      await snap(10, mark(tableToggle), clip); // table toggle — red mark only

      await page.locator(tableToggle).click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(700);
      await matBg(page);
      await hideKbd(page);
      await hideBanner();
      await page.waitForTimeout(300);
      await snap(10, false, clip); // back to table view
    },
    out: "docs/public/assets/img/4_0/customization/view-type-table-grid.gif",
    alt: "An Avo Posts index with six records per page: the view switcher toggles between table rows and grid cards.",
    source: {
      file: "docs/4.0/customization.md",
      prompt: "Posts index with 4 per page; GIF toggling table and grid view with annotated view switcher",
    },
  },

  // act-as-taggable-on-integration (guides/act-as-taggable-on-integration.md) — the railsbytes
  // template adds Tag + Tagging Avo RESOURCES so you can browse the acts-as-taggable-on data as
  // first-class resources. The guide is about that, NOT the tags form field. Demo edits (v4
  // adaptation of the v2 template): Avo::Resources::Tag (model ActsAsTaggableOn::Tag, title :name,
  // fields id/name/taggings_count/created_at + has_many :taggings) and Avo::Resources::Tagging
  // (model ActsAsTaggableOn::Tagging, fields id/tag belongs_to/taggable polymorphic→Post/created_at)
  // + Avo::TagsController/Avo::TaggingsController + permissive ActsAsTaggableOn::Tag/TaggingPolicy
  // (the demo runs explicit_authorization). Seeded 6 realistic tags (rails, ruby, tutorial,
  // announcement, release, performance) onto Posts → non-zero taggings counts + 34 taggings.
  // NOTE: this Avo build does NOT render has_many panels inline on Show (verified: Post/Team show
  // pages drop their has_many panels too), so the "tag's taggings list" can't be shown ON the tag
  // show page. Tour instead surfaces the taggings as their OWN resource: Tags index → open a tag
  // (Show details) → Taggings index, where each tagging row links to its tag + the Post it tags.
  // RED CLICK MARKS (user request): before each navigational hop, an absolutely-positioned red
  // overlay (red-400 #f87171, 2px stroke, 2px pad, small radius — RULES 15d′, NOT the native blue
  // ring) is drawn hugging the element being "clicked" (the tag row on the Tags index; a tagging's
  // Tag link on the Taggings index), held for a few frames, then removed and the page advances. The
  // overlay is injected DOM so it renders identically in light + dark.
  // BALANCED CLIP (no dead space): per_page=3 makes both index tables ~218px tall (panel y160→378),
  // matching the Tag show details card (~205px, y160→365). The fixed clip frames the page title row
  // (H1+controls, y≈116) down to the table/pager bottom (~378) + ~10px mat — so all three screens
  // fill the frame with no half-empty band. Sidebar closed + mat bg + hideKbd (RULES 12/19a/15e).
  // width 2144 / display:"full" → fills the docs content column like resource-search.
  {
    id: "taggable-resources-tour",
    path: "/avo/resources/tags?per_page=3",
    viewport: { width: 1100, height: 1000 },
    settle: 1000,
    clip: { x: 14, y: 104, width: 1072, height: 286 },
    width: 2144,
    delay: 20,
    steps: async (page, snap) => {
      const BASE = process.env.AVO_BASE_URL || "http://localhost:3020";
      const frame = async () => {
        await closeSidebar(page);
        await matBg(page);
        await hideKbd(page);
        await page.waitForTimeout(400);
      };
      // Draw a red callout (red-400, 2px stroke, tight pad, small radius — RULES 15d′) hugging the
      // element matched by `selector`, then remove it. Injected DOM so it renders in light + dark.
      const showRedMark = async (selector) => {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return;
          const b = el.getBoundingClientRect();
          const pad = 2;
          const box = document.createElement("div");
          box.id = "__red_click_mark__";
          Object.assign(box.style, {
            position: "fixed",
            left: `${b.left - pad}px`,
            top: `${b.top - pad}px`,
            width: `${b.width + pad * 2}px`,
            height: `${b.height + pad * 2}px`,
            border: "2px solid #f87171",
            borderRadius: "4px",
            boxShadow: "0 0 0 1px rgba(248,113,113,0.35)",
            pointerEvents: "none",
            zIndex: "2147483647",
          });
          document.body.appendChild(box);
        }, selector);
      };
      const clearRedMark = async () => {
        await page.evaluate(() => document.getElementById("__red_click_mark__")?.remove());
      };

      await frame();

      // Beat 1 — the Tags index: tags browsed as a resource (id / name / taggings count / created at).
      await snap(12, false);

      // Mark the first tag row (the element we "click" to open the tag), hold, then advance to Show.
      await showRedMark("table tbody tr:first-child");
      await snap(9, false); // red callout on the tag row
      await clearRedMark();
      await page.goto(`${BASE}/avo/resources/tags/10`, { waitUntil: "networkidle" });
      await frame();

      // Beat 2 — that tag's Show page: its details (id / name / taggings count / created at).
      await snap(13, false);

      // Beat 3 — the Taggings index: the underlying tagging records, each linking to its tag + Post.
      await page.goto(`${BASE}/avo/resources/taggings?per_page=3`, { waitUntil: "networkidle" });
      await frame();
      await snap(12, false);

      // Mark a tagging's Tag link (the element we "click" to drill back to that tag), hold, advance.
      await showRedMark("table tbody tr:first-child a[href*='/avo/resources/tags/']");
      await snap(9, false); // red callout on the tagging's Tag link
      await clearRedMark();
      await page.goto(`${BASE}/avo/resources/tags/10`, { waitUntil: "networkidle" });
      await frame();
      await snap(13, false); // land on that tag's Show — closes the loop
    },
    out: "docs/public/assets/img/4_0/guides/act-as-taggable-on-integration/taggable-resources-tour.gif",
    display: "full",
    alt: "Browsing acts-as-taggable-on data as Avo resources: clicking a tag on the Tags index opens its details, and the Taggings index lists the underlying tagging records, each linking back to its tag and the post it tags.",
    source: {
      file: "docs/4.0/guides/act-as-taggable-on-integration.md",
      prompt: "tour the generated Tag + Tagging Avo resources with red click marks — Tags index, a Tag show, the Taggings index",
    },
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

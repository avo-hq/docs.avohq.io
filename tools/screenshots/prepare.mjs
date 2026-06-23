// Docs-screenshot pipeline — composable `prepare()` primitives.
//
// The resolve agent does NOT write arbitrary Playwright JS. It picks from this FIXED
// vocabulary and composes a spec's `prepare(page)` via `compose(...)`. Each primitive is a
// hard-won framing trick from the harness README lessons (15a–15v, 19a) — keep them here as
// the single source of truth so every generated shot inherits the same rules.
//
// Usage in a spec (what the writer emits):
//   import { compose, closeSidebar, matBg, hideKbd, hover, focus, wait } from "./prepare.mjs";
//   prepare: compose(closeSidebar, matBg, hideKbd, hover("table tbody tr:nth-child(3) a"), wait(1200), focus("table tbody tr:nth-child(3) a"))

// Run an ordered list of prepare steps as one prepare(page).
export const compose = (...steps) => async (page) => {
  for (const step of steps) await step(page);
};

// --- page-state primitives (no args) ---------------------------------------

// Close the sidebar the REAL way (cookie + reload) so content reflows full-width.
// (README lesson 12 — never crop the sidebar out; close it.)
export const closeSidebar = async (page) => {
  await page.context().addCookies([
    { name: "avo.sidebar.open", value: "0", url: new URL(page.url()).origin },
  ]);
  await page.reload({ waitUntil: "networkidle" });
};

// Force the page surface to the docs frame mat (#fff / #1b1b1f dark) and drop the
// closed-sidebar divider, so a clipped capture blends into the docs frame with no grey
// box or stray left line. (README lessons 19, 19a.)
export const matBg = async (page) => {
  await page.addStyleTag({
    content: `.main-content { border-left: 0 !important; }
      html, body, .main-content { background: #ffffff !important; }
      @media (prefers-color-scheme: dark) { html, body, .main-content { background: #1b1b1f !important; } }`,
  });
};

// Hide the persistent hotkey hint badges so control bars read like the legacy shots.
// (README customizable-controls notes.)
export const hideKbd = async (page) => {
  await page.addStyleTag({ content: ".hotkey-badge { display: none !important; }" });
};

// Neutralize structural wrapper borders so only the meaningful inner control border
// survives an element/clip capture. (README lesson 15u.)
export const neutralizeBorders = async (page) => {
  await page.addStyleTag({
    content: `.card:not(.relative), .card__body, .field-wrapper, .description-list {
      border-color: transparent !important; }`,
  });
};

// --- parameterized primitives (return a step) ------------------------------

export const wait = (ms) => async (page) => {
  await page.waitForTimeout(ms);
};

// Open a tippy/hover-triggered overlay by hovering its trigger.
export const hover = (selector) => async (page) => {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await el.hover();
};

// Focus a control so its native :focus-visible ring marks the trigger.
// (README lesson 15b — prefer the real ring over a drawn box.)
export const focus = (selector) => async (page) => {
  await page.locator(selector).first().focus();
};

export const click = (selector) => async (page) => {
  await page.locator(selector).first().click();
};

// Render a native <select> as an OPEN listbox so all its <option>s are visible at once.
// A native select's popup is OS-drawn and can't be screenshot, so to document a select's
// CHOICES we expand the REAL element to size=N (a legitimate HTML rendering of the same
// element — not a faked component): every option (e.g. currency codes) shows inline.
export const openSelect = (selector) => async (page) => {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await el.evaluate((s) => {
    s.setAttribute("size", String(s.options.length));
    s.style.width = "auto";
    s.style.position = "relative";
    s.style.zIndex = "50";
  });
};

export const scrollTo = (selector) => async (page) => {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
};

// Hide busy content sitting under an open popover/dropdown so the floating element gets an
// even mat all round. visibility:hidden keeps layout/borders. (README lesson 15j.)
export const hideUnder = (selector) => async (page) => {
  await page.addStyleTag({ content: `${selector} { visibility: hidden !important; }` });
};

// Escape hatch for a one-off rule (e.g. reproduce a purged Tailwind look, lesson 15n).
// Use sparingly — prefer a named primitive above.
export const injectCSS = (css) => async (page) => {
  await page.addStyleTag({ content: css });
};

// Hide index-table rows by Avo `data-record-id` and sync the pagination count label.
export const hideRecords = (...ids) => async (page) => {
  const hidden = ids.map(String);
  await page.addStyleTag({
    content: hidden
      .map((id) => `tr[data-record-id="${id}"] { display: none !important; }`)
      .join("\n"),
  });
  await page.evaluate((hiddenIds) => {
    const visible = [...document.querySelectorAll("table tbody tr[data-record-id]")].filter(
      (row) => !hiddenIds.includes(row.dataset.recordId),
    ).length;
    const info = document.querySelector(".pagination__info span");
    if (info) info.textContent = `${visible} records`;
  }, hidden);
};

// Hide summarizable chart icons in index column headers (summary popover triggers).
export const hideSummarizableIcons = async (page) => {
  await page.addStyleTag({
    content: `button[popovertarget^="summary-popover"] { display: none !important; }`,
  });
};

// Hide index-table columns by Avo field id (header + body cells).
export const hideIndexColumns = (...fieldIds) => async (page) => {
  const selectors = fieldIds.flatMap((id) => [
    `th[data-table-header-field-id="${id}"]`,
    `td[data-field-id="${id}"]`,
  ]);
  await page.addStyleTag({
    content: `${selectors.join(", ")} { display: none !important; }`,
  });
};

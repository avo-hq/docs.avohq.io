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

import { compose, closeSidebar, matBg, hideKbd, hover, focus, wait } from "./prepare.mjs";

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
export const SPECS = [];

// ---- GIF specs — animated demos; record-gif.mjs drives each spec's steps(page, snap) -------
// Same idea as SPECS, for GIFs. Append a spec here when a shot must animate. Starts empty.
export const GIF_SPECS = [];

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

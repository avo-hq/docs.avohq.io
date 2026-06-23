// Docs-screenshot pipeline — capture stage.
//
// Logs into the Avo demo app once, reuses the session, then for each spec:
//   - navigates to the UI4 page, sets a fixed retina viewport
//   - runs optional `prepare(page)` interactions (open a dropdown, focus search…)
//   - screenshots (full page, an element, or a clip region)
//   - records the boundingBox of every mark target into a `.boxes.json` sidecar
//
// The sidecar is what makes annotation deterministic: ImageMagick draws arrows /
// highlights at exact coordinates instead of us eyeballing them.
//
// Usage: node capture.mjs [specId ...]   (no args = all specs)

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SPECS } from "./specs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");

const BASE = process.env.AVO_BASE_URL || "http://localhost:3020";
const LOGIN_PATH = process.env.AVO_LOGIN_PATH || "/users/sign_in";
const EMAIL = process.env.AVO_ADMIN_EMAIL || "avo@cado.com";
const PASSWORD = process.env.AVO_ADMIN_PASSWORD || "secreto";
const DPR = Number(process.env.AVO_DPR || 2);
const SCHEME = process.env.AVO_COLOR_SCHEME === "dark" ? "dark" : "light";
const SUFFIX = SCHEME === "dark" ? "-dark" : ""; // dark variants get a -dark filename

async function login(context) {
  const page = await context.newPage();
  await page.goto(`${BASE}${LOGIN_PATH}`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="user[email]"]', EMAIL);
  await page.fill('input[type="password"], input[name="user[password]"]', PASSWORD);
  // Click the sign-in submit specifically (the page may also have a "Sign up" button).
  const submit = page.locator('form[action*="sign_in"] [type="submit"], input[type="submit"][value*="Sign in" i]').first();
  await (await submit.count() ? submit : page.locator('[type="submit"]').first()).click();
  // Wait until we've actually left the sign-in page before proceeding.
  await page.waitForURL((u) => !String(u).includes("sign_in"), { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  if (page.url().includes("sign_in")) throw new Error("Login failed — still on sign_in page");
  await page.close();
}

async function captureSpec(context, spec) {
  const page = await context.newPage();
  await page.setViewportSize(spec.viewport || { width: 1440, height: 900 });
  await page.goto(`${BASE}${spec.path}`, { waitUntil: "networkidle" });

  if (spec.prepare) await spec.prepare(page);
  await page.waitForTimeout(spec.settle ?? 400); // let transitions finish

  const pngPath = join(OUT, `${spec.id}${SUFFIX}.png`);
  await mkdir(dirname(pngPath), { recursive: true });

  const target = spec.selector ? page.locator(spec.selector).first() : null;
  if (target && spec.pad) {
    // Capture the element PLUS real surrounding page area (genuine breathing room,
    // not a tacked-on border). pad is in CSS px: {x, y}.
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    let b = await target.boundingBox();
    // Optional: span the clip to include a SECOND element (e.g. two stacked field rows).
    // `clipFrom` is the top-left anchor, `selector` the bottom-right — the clip is the
    // union of both boxes. Lets a shot frame a contrast pair without eyeballed pixel coords.
    if (spec.clipFrom) {
      const a = await page.locator(spec.clipFrom).first().boundingBox();
      if (a) {
        const x0 = Math.min(a.x, b.x);
        const y0 = Math.min(a.y, b.y);
        b = {
          x: x0,
          y: y0,
          width: Math.max(a.x + a.width, b.x + b.width) - x0,
          height: Math.max(a.y + a.height, b.y + b.height) - y0,
        };
      }
    }
    // pad in CSS px: {x} both sides; vertical via {top, bottom} (or {y} for both).
    const px = spec.pad.x ?? 0;
    const top = spec.pad.top ?? spec.pad.y ?? 0;
    const bottom = spec.pad.bottom ?? spec.pad.y ?? 0;
    const vp = spec.viewport || { width: 1440, height: 900 };
    const x = Math.max(0, b.x - px);
    const y = Math.max(0, b.y - top);
    await page.screenshot({
      path: pngPath,
      clip: {
        x,
        y,
        width: Math.min(vp.width - x, b.width + px * 2),
        height: Math.min(vp.height - y, b.height + top + bottom),
      },
    });
  } else if (target) {
    await target.screenshot({ path: pngPath });
  } else {
    await page.screenshot({ path: pngPath, fullPage: !!spec.fullPage, clip: spec.clip });
  }

  // Record mark-target boxes relative to the captured image's origin.
  const originBox = target ? await target.boundingBox() : (spec.clip || { x: 0, y: 0 });
  const boxes = [];
  for (const mark of spec.marks || []) {
    // A mark can target an element via `selector`, OR carry explicit viewport-relative
    // CSS-px coords via `box: { x, y, width, height }` (for groups that have no single
    // wrapping element, e.g. the scope tabs which only share the full-width `.tabs`).
    const box = mark.box
      ? mark.box
      : await page.locator(mark.selector).first().boundingBox();
    if (!box) {
      console.warn(`  ! mark selector not found: ${mark.selector}`);
      continue;
    }
    boxes.push({
      ...mark,
      x: (box.x - (originBox.x || 0)) * DPR,
      y: (box.y - (originBox.y || 0)) * DPR,
      width: box.width * DPR,
      height: box.height * DPR,
    });
  }
  await writeFile(`${pngPath.replace(/\.png$/, "")}.boxes.json`, JSON.stringify({ dpr: DPR, marks: boxes }, null, 2));

  await page.close();
  console.log(`  ✓ ${spec.id} → out/${spec.id}.png (${boxes.length} marks)`);
}

const wanted = process.argv.slice(2);
const specs = wanted.length ? SPECS.filter((s) => wanted.includes(s.id)) : SPECS;
if (!specs.length) {
  console.error("No matching specs.");
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: DPR, colorScheme: SCHEME });
console.log(`Logging in as ${EMAIL} @ ${BASE} …`);
await login(context);
for (const spec of specs) {
  console.log(`Capturing ${spec.id} …`);
  await captureSpec(context, spec);
}
await browser.close();
console.log("Done.");

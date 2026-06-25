// Docs-screenshot pipeline — GIF builder (generic, spec-driven).
//
// Playwright's bundled ffmpeg has no GIF muxer, so we capture key frames as PNGs during a
// scripted interaction and assemble them with ImageMagick. The interaction is inherently
// per-GIF, so a GIF spec supplies it as a `steps(page, snap)` callback — everything else
// (login, frame management, dark variant, assembly) is generic and reused.
//
// GIF spec shape (add to GIF_SPECS in specs.mjs; GIF_EXAMPLE there is a worked sample):
//   id        unique slug → out/<id>.gif (+ out/<id>-dark.gif)
//   path      Avo path to start on
//   viewport  { width, height }              (default 1440×900)
//   settle    ms after navigation            (default 700)
//   clip      { x, y, width, height }        the crop every frame uses
//   width     output GIF width in px         (default 900; source is captured larger)
//   delay     centiseconds per frame         (default 18)
//   marks?    same as capture.mjs — default marks for every snap(hold) unless overridden
//   steps     async (page, snap) => {}       drive the UI; call snap(hold[, marks]) to emit frames
//                                            marks: array → red-annotate that batch only;
//                                            false → no annotation; omit → use spec.marks
//   out?      "docs/public/assets/img/4_0/<page>/<name>.gif"  (destination; copy is manual)
//
// Usage:
//   node record-gif.mjs <id>                          # run the GIF spec from specs.mjs (GIF_SPECS)
//   AVO_COLOR_SCHEME=dark node record-gif.mjs <id>     # → out/<id>-dark.gif
//   import { recordGif } from "./record-gif.mjs"       # or drive it programmatically

import { chromium } from "playwright";
import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { promisify } from "node:util";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { annotateImage, computeMarkBoxes } from "./annotate.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");

const BASE = process.env.AVO_BASE_URL || "http://localhost:3020";
const LOGIN_PATH = process.env.AVO_LOGIN_PATH || "/users/sign_in";
const EMAIL = process.env.AVO_ADMIN_EMAIL || "avo@cado.com";
const PASSWORD = process.env.AVO_ADMIN_PASSWORD || "secreto";
const SCHEME = process.env.AVO_COLOR_SCHEME === "dark" ? "dark" : "light";
const SUFFIX = SCHEME === "dark" ? "-dark" : "";
const DPR = Number(process.env.AVO_DPR || 2); // retina, like capture.mjs — a 1× capture upscaled to `width` pixelates (RULES 3)

async function login(page) {
  await page.goto(`${BASE}${LOGIN_PATH}`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="user[email]"]', EMAIL);
  await page.fill('input[type="password"], input[name="user[password]"]', PASSWORD);
  await page.locator("input[type=submit], button[type=submit]").first().click();
  await page.waitForURL((u) => !String(u).includes("sign_in"), { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}

// The generic engine: drive any GIF spec → out/<id>(-dark).gif.
export async function recordGif(spec) {
  if (!spec?.id || !spec.path || !spec.clip || typeof spec.steps !== "function")
    throw new Error("GIF spec needs { id, path, clip, steps }");

  const frames = join(OUT, "frames", spec.id);
  const gifOut = join(OUT, `${spec.id}${SUFFIX}.gif`);
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: spec.viewport || { width: 1440, height: 900 },
    deviceScaleFactor: DPR,
    colorScheme: SCHEME,
  });
  const page = await context.newPage();
  await login(page);
  await page.goto(`${BASE}${spec.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(spec.settle ?? 700);

  let i = 0;
  let defaultMarkMeta = null;
  // snap(hold[, marks[, clip]]): emit `hold` identical frames. Optional per-batch marks and clip.
  const snap = async (hold = 1, marksForSnap = undefined, clipOverride = undefined) => {
    const clip = clipOverride ?? spec.clip;
    let meta = null;
    if (marksForSnap === false) {
      meta = null;
    } else if (Array.isArray(marksForSnap) && marksForSnap.length) {
      meta = await computeMarkBoxes(page, marksForSnap, clip, DPR);
    } else if (marksForSnap === undefined && spec.marks?.length) {
      if (!defaultMarkMeta) defaultMarkMeta = await computeMarkBoxes(page, spec.marks, spec.clip, DPR);
      meta = defaultMarkMeta;
    }
    for (let h = 0; h < hold; h++) {
      const framePath = join(frames, String(i++).padStart(3, "0") + ".png");
      await page.screenshot({ path: framePath, clip });
      if (meta?.marks?.length)
        await annotateImage(framePath, framePath, meta);
    }
  };

  await spec.steps(page, snap);
  await browser.close();

  await run("magick", [
    "-delay", String(spec.delay ?? 18), "-loop", "0",
    join(frames, "*.png"),
    // `>` = only ever SHRINK: at DPR 2 the frames are 2× the clip, so we downscale to `width`
    // (crisp) and never enlarge — upscaling a smaller capture pixelates the chart/table (RULES 3).
    "-resize", `${spec.width ?? 900}x>`,
    // No dithering: the 256-colour GIF palette otherwise speckles flat areas (the dark mat behind
    // a popover) into visible grain that reads as a "blurred"/noisy background (RULES 3).
    "-dither", "None", "-layers", "Optimize", "-coalesce",
    gifOut,
  ]);
  console.log(`✓ GIF → out/${spec.id}${SUFFIX}.gif (${i} frames)`);
  return gifOut;
}

// ---- CLI: node record-gif.mjs <id> (looks the spec up in specs.mjs GIF_SPECS) -------------
const invokedDirectly =
  process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const id = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!id) {
    console.error("Usage: node record-gif.mjs <id>   (the GIF spec must exist in specs.mjs GIF_SPECS)");
    process.exit(1);
  }
  const { GIF_SPECS } = await import("./specs.mjs");
  const spec = GIF_SPECS.find((s) => s.id === id);
  if (!spec) throw new Error(`GIF spec not found for id: ${id} (add it to GIF_SPECS in specs.mjs)`);
  await recordGif(spec);
}

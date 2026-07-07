// Docs-screenshot pipeline — NATIVE capture (headed + macOS screencapture).
//
// Some UI is drawn by the OS ON TOP of the web page — most notably a native <select>'s open
// dropdown popup. Headless Playwright `page.screenshot()` only grabs the page surface, so it
// physically can't see those popups. This runner solves that by:
//   1. launching Chromium HEADED, pinned at screen origin (so we know where it is),
//   2. driving the real element (open the <select>, arrow through its options),
//   3. grabbing the screen region with macOS `screencapture -R` — which captures whatever the
//      OS draws, popup included — one PNG per frame,
//   4. assembling the frames into a GIF with ImageMagick (same as record-gif.mjs).
//
// This is macOS-only and inherently less hermetic than the headless path (a real window appears
// and the captured region is taken over briefly). Use it ONLY for shots the headless pipeline
// cannot capture (native popups). For everything else use capture.mjs / record-gif.mjs.
//
// IMPORTANT — two host constraints:
//   • Screen Recording permission: the FIRST run prompts macOS to grant the terminal/node process
//     Screen Recording access. Until granted, screencapture returns the desktop/black, not the
//     window. The runner checks the first frame isn't blank and aborts with guidance if so.
//   • Native popup APPEARANCE follows the SYSTEM dark/light, not the page. So a light-mode popup
//     needs macOS in Light, a dark-mode popup needs macOS in Dark. Set `NATIVE_TOGGLE_APPEARANCE=1`
//     to let the runner flip system appearance to match (via osascript) and restore it after;
//     otherwise it captures with the current system appearance and logs a warning.
//
// NATIVE spec shape (add to NATIVE_SPECS in specs.mjs):
//   id        unique slug → out/<id>.gif (+ out/<id>-dark.gif)
//   path      Avo path to start on
//   viewport  { width, height }              (default 1280×900)
//   settle    ms after navigation            (default 700)
//   prepare   async (page) => {}             optional framing (closeSidebar/matBg/hideKbd)
//   clip      { x, y, width, height }        PAGE-coordinate region to grab; size it to include
//                                            where the popup will render (below/right of the field)
//   width     output GIF width in px         (default 900)
//   delay     centiseconds per frame         (default 22)
//   steps     async (page, snap) => {}       drive the native widget; call snap(hold) per frame
//   out?      "docs/public/assets/img/4_0/<page>/<name>.gif"
//
// Usage:
//   node record-native.mjs <id>                       # → out/<id>.gif
//   AVO_COLOR_SCHEME=dark node record-native.mjs <id>  # → out/<id>-dark.gif

import { chromium } from "playwright";
import { execFile } from "node:child_process";
import { mkdir, rm, readFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { promisify } from "node:util";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");

const BASE = process.env.AVO_BASE_URL || "http://localhost:3020";
const LOGIN_PATH = process.env.AVO_LOGIN_PATH || "/users/sign_in";
const EMAIL = process.env.AVO_ADMIN_EMAIL || "avo@cado.com";
const PASSWORD = process.env.AVO_ADMIN_PASSWORD || "secreto";
const SCHEME = process.env.AVO_COLOR_SCHEME === "dark" ? "dark" : "light";
const SUFFIX = SCHEME === "dark" ? "-dark" : "";
const TOGGLE = process.env.NATIVE_TOGGLE_APPEARANCE === "1";

async function login(page) {
  await page.goto(`${BASE}${LOGIN_PATH}`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="user[email]"]', EMAIL);
  await page.fill('input[type="password"], input[name="user[password]"]', PASSWORD);
  await page.locator("input[type=submit], button[type=submit]").first().click();
  await page.waitForURL((u) => !String(u).includes("sign_in"), { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}

// ---- macOS system appearance (so the native popup matches the page theme) -----------------
async function getSystemAppearance() {
  try {
    const { stdout } = await run("osascript", [
      "-e",
      'tell application "System Events" to tell appearance preferences to get dark mode',
    ]);
    return stdout.trim() === "true" ? "dark" : "light";
  } catch {
    return null; // can't read — proceed without toggling
  }
}
async function setSystemAppearance(dark) {
  await run("osascript", [
    "-e",
    `tell application "System Events" to tell appearance preferences to set dark mode to ${dark ? "true" : "false"}`,
  ]);
}

// ---- screen-coordinate mapping ------------------------------------------------------------
// Convert a page-coordinate rect → on-screen rect (points) for `screencapture -R`. The window is
// pinned near origin; we read its real screen position + chrome height live, so we don't guess.
async function pageRectToScreen(page, clip) {
  const m = await page.evaluate(() => ({
    sx: window.screenX,
    sy: window.screenY,
    outerW: window.outerWidth,
    innerW: window.innerWidth,
    outerH: window.outerHeight,
    innerH: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }));
  const sideBorder = Math.max(0, (m.outerW - m.innerW) / 2);
  const chromeTop = Math.max(0, m.outerH - m.innerH); // toolbar/tab strip height
  const rect = {
    x: Math.round(m.sx + sideBorder + clip.x - m.scrollX),
    y: Math.round(m.sy + chromeTop + clip.y - m.scrollY),
    width: Math.round(clip.width),
    height: Math.round(clip.height),
  };
  if (process.env.NATIVE_DEBUG)
    console.log("  [debug] window", JSON.stringify(m), "chromeTop", chromeTop, "→ screen rect", JSON.stringify(rect));
  return rect;
}

// Map a single page point → on-screen point (points), for cliclick OS-level clicks.
async function pagePointToScreen(page, px, py) {
  const m = await page.evaluate(() => ({
    sx: window.screenX, sy: window.screenY,
    outerW: window.outerWidth, innerW: window.innerWidth,
    outerH: window.outerHeight, innerH: window.innerHeight,
    scrollX: window.scrollX, scrollY: window.scrollY,
  }));
  return {
    x: Math.round(m.sx + Math.max(0, (m.outerW - m.innerW) / 2) + px - m.scrollX),
    y: Math.round(m.sy + Math.max(0, m.outerH - m.innerH) + py - m.scrollY),
  };
}

// a frame is blank if it's a single flat colour (permission denied → desktop/black, or off-screen)
async function frameLooksBlank(path) {
  try {
    const { stdout } = await run("magick", [path, "-format", "%[standard-deviation]", "info:"]);
    return parseFloat(stdout.trim()) < 2; // near-zero variance = flat image
  } catch {
    return false;
  }
}

export async function recordNative(spec) {
  if (process.platform !== "darwin")
    throw new Error("record-native.mjs is macOS-only (uses `screencapture`)");
  if (!spec?.id || !spec.path || !spec.clip || typeof spec.steps !== "function")
    throw new Error("native spec needs { id, path, clip, steps }");

  const frames = join(OUT, "frames", spec.id);
  const gifOut = join(OUT, `${spec.id}${SUFFIX}.gif`);
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });

  // match the OS popup appearance to the page theme (optional, restored after)
  let restoreAppearance = null;
  if (TOGGLE) {
    const before = await getSystemAppearance();
    if (before && before !== SCHEME) {
      await setSystemAppearance(SCHEME === "dark");
      restoreAppearance = before;
      console.log(`  system appearance: ${before} → ${SCHEME} (will restore)`);
    }
  } else {
    const cur = await getSystemAppearance();
    if (cur && cur !== SCHEME)
      console.warn(`  ⚠ system appearance is ${cur} but capturing ${SCHEME}: the native popup will look ${cur}. Set NATIVE_TOGGLE_APPEARANCE=1 to auto-match.`);
  }

  // headed + window pinned at origin so screen coords are knowable
  const browser = await chromium.launch({
    headless: false,
    args: ["--window-position=0,0", "--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    viewport: spec.viewport || { width: 1280, height: 900 },
    colorScheme: SCHEME,
  });
  const page = await context.newPage();
  await page.bringToFront();
  await login(page);
  await page.goto(`${BASE}${spec.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(spec.settle ?? 700);
  if (typeof spec.prepare === "function") await spec.prepare(page);
  await page.bringToFront();
  await page.waitForTimeout(250);

  // OS-level input (cliclick) — needed because Chromium only opens a native <select> popup on a
  // genuine hardware event, and only OS keystrokes reach the popup once it's modal/open.
  const os = {
    // click the centre of an element (resolve its screen point BEFORE the popup opens)
    click: async (selector) => {
      const b = await page.locator(selector).boundingBox();
      const p = await pagePointToScreen(page, b.x + b.width / 2, b.y + b.height / 2);
      await run("cliclick", [`c:${p.x},${p.y}`]);
    },
    key: async (name) => { await run("cliclick", [`kp:${name}`]); }, // e.g. arrow-down, return, esc
  };

  let i = 0;
  let cachedRect = null; // resolved on the first (pre-popup) snap, then reused — calling
  // page.evaluate while the native popup is open would deadlock (the popup blocks the renderer).
  // snap(hold): grab the screen region `hold` times (each = one GIF tick) to pause on a state.
  const snap = async (hold = 1) => {
    if (!cachedRect) {
      // clip may be a function (page) => rect, so a spec can size the region from the live element
      // box plus an allowance for where the OS popup drops (its extent isn't in the DOM).
      const clip = typeof spec.clip === "function" ? await spec.clip(page) : spec.clip;
      cachedRect = await pageRectToScreen(page, clip);
    }
    const r = cachedRect;
    for (let h = 0; h < hold; h++) {
      const file = join(frames, String(i).padStart(3, "0") + ".png");
      await run("screencapture", ["-x", "-t", "png", `-R${r.x},${r.y},${r.width},${r.height}`, file]);
      if (i === 0 && (await frameLooksBlank(file))) {
        throw new Error(
          "first frame is blank — macOS likely hasn't granted Screen Recording permission to this " +
            "terminal (System Settings → Privacy & Security → Screen Recording). Grant it and re-run."
        );
      }
      i++;
    }
  };

  try {
    await spec.steps(page, snap, os);
  } finally {
    await browser.close();
    if (restoreAppearance) await setSystemAppearance(restoreAppearance === "dark");
  }

  await run("magick", [
    "-delay", String(spec.delay ?? 22), "-loop", "0",
    join(frames, "*.png"),
    "-resize", `${spec.width ?? 900}x>`,
    "-dither", "None", "-layers", "Optimize",
    gifOut,
  ]);
  console.log(`✓ native GIF → out/${spec.id}${SUFFIX}.gif (${i} frames)`);
  return gifOut;
}

// ---- CLI ----------------------------------------------------------------------------------
const invokedDirectly =
  process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const id = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!id) {
    console.error("Usage: node record-native.mjs <id>   (the spec must exist in specs.mjs NATIVE_SPECS)");
    process.exit(1);
  }
  const { NATIVE_SPECS } = await import("./specs.mjs");
  const spec = (NATIVE_SPECS || []).find((s) => s.id === id);
  if (!spec) throw new Error(`native spec not found for id: ${id} (add it to NATIVE_SPECS in specs.mjs)`);
  await recordNative(spec);
}

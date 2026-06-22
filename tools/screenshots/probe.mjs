// Docs-screenshot pipeline — STAGE 2 helper: probe.
//
// A generic DOM inspector the RESOLVE agent drives to discover routes, selectors, and crop
// coordinates on the live demo — replacing the ~47 one-off `probe-*` scripts. It logs into
// the demo once (same env + login as capture.mjs), navigates to a path, and prints JSON:
//
//   node probe.mjs <path> [selector] [--scheme dark] [--viewport 1440x900]
//
//   • with a selector → match count + boundingBox + border/background/text/outerHTML of each
//   • without        → page landmarks (main content, headings, data-component/field/controller
//                      elements, tables, buttons) with candidate selectors + boxes
//
// The agent reads the boxes to author a spec's `selector`/`clip`/`pad`; it never eyeballs.

import { chromium } from "playwright";

const BASE = process.env.AVO_BASE_URL || "http://localhost:3020";
const LOGIN_PATH = process.env.AVO_LOGIN_PATH || "/users/sign_in";
const EMAIL = process.env.AVO_ADMIN_EMAIL || "avo@cado.com";
const PASSWORD = process.env.AVO_ADMIN_PASSWORD || "secreto";
const DPR = Number(process.env.AVO_DPR || 2);

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const path = positional[0];
const selector = positional[1] || null;
const scheme = argv.includes("--scheme") && argv[argv.indexOf("--scheme") + 1] === "dark" ? "dark" : "light";
let viewport = { width: 1440, height: 900 };
if (argv.includes("--viewport")) {
  const [w, h] = argv[argv.indexOf("--viewport") + 1].split("x").map(Number);
  viewport = { width: w, height: h };
}
if (!path) {
  console.error("Usage: node probe.mjs <path> [selector] [--scheme dark] [--viewport WxH]");
  process.exit(1);
}

async function login(context) {
  const page = await context.newPage();
  await page.goto(`${BASE}${LOGIN_PATH}`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="user[email]"]', EMAIL);
  await page.fill('input[type="password"], input[name="user[password]"]', PASSWORD);
  const submit = page.locator('form[action*="sign_in"] [type="submit"], input[type="submit"][value*="Sign in" i]').first();
  await ((await submit.count()) ? submit : page.locator('[type="submit"]').first()).click();
  await page.waitForURL((u) => !String(u).includes("sign_in"), { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  if (page.url().includes("sign_in")) throw new Error("Login failed — still on sign_in page");
  await page.close();
}

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: DPR, colorScheme: scheme });
await login(context);

const page = await context.newPage();
await page.setViewportSize(viewport);
await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

let result;
if (selector) {
  result = await page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)];
    return {
      selector: sel,
      count: els.length,
      matches: els.slice(0, 8).map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          box: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          classes: el.className?.toString().slice(0, 200) || null,
          border: `${cs.borderTopWidth} ${cs.borderColor}`,
          background: cs.backgroundColor,
          text: (el.textContent || "").trim().slice(0, 120),
          outerHTML: el.outerHTML.slice(0, 400),
        };
      }),
    };
  }, selector);
} else {
  result = await page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    };
    const list = (sel, label) =>
      [...document.querySelectorAll(sel)].slice(0, 12).map((el) => ({
        selector: el.id ? `#${el.id}` : sel,
        label,
        box: box(el),
        text: (el.textContent || "").trim().slice(0, 80),
      }));
    const main = document.querySelector("#main-content, .main-content, main");
    return {
      mainContent: main ? box(main) : null,
      headings: [...document.querySelectorAll("h1, h2, h3")].slice(0, 12).map((el) => ({
        level: el.tagName, text: (el.textContent || "").trim().slice(0, 80), box: box(el),
      })),
      dataComponents: list("[data-component-name]", "component"),
      fields: list("[data-field-type]", "field"),
      controllers: list("[data-controller]", "controller"),
      tables: list("table", "table"),
      buttons: list("button, a[role='button'], .button", "button"),
    };
  });
}

console.log(JSON.stringify({ meta: { path, base: BASE, scheme, viewport, title: await page.title() }, ...result }, null, 2));
await browser.close();

import { chromium } from "playwright";
const BASE = process.env.AVO_BASE_URL || "http://localhost:3020";
const EMAIL = process.env.AVO_ADMIN_EMAIL || "avo@cado.com";
const PASSWORD = process.env.AVO_ADMIN_PASSWORD || "secreto";

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });
const lp = await context.newPage();
await lp.goto(`${BASE}/users/sign_in`, { waitUntil: "networkidle" });
await lp.fill('input[type="email"], input[name="user[email]"]', EMAIL);
await lp.fill('input[type="password"], input[name="user[password]"]', PASSWORD);
const submit = lp.locator('form[action*="sign_in"] [type="submit"], input[type="submit"][value*="Sign in" i]').first();
await ((await submit.count()) ? submit : lp.locator('[type="submit"]').first()).click();
await lp.waitForURL((u) => !String(u).includes("sign_in"), { timeout: 15000 });
await lp.waitForLoadState("networkidle");
await lp.close();

const page = await context.newPage();
await page.setViewportSize({ width: 900, height: 700 });
await page.goto(`${BASE}/avo/resources/courses?per_page=4`, { waitUntil: "networkidle" });
await context.addCookies([{ name: "avo.sidebar.open", value: "0", url: new URL(page.url()).origin }]);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

const data = await page.evaluate(() => {
  const th = document.querySelector("thead th[data-table-header-field-id='has_skills']");
  if (!th) return { error: "no th", nths: document.querySelectorAll("thead th").length };
  // the text-bearing div inside the th (sortable=false → plain div)
  const div = th.querySelector("div[data-sortable], div");
  const card = document.querySelector(".card");
  const range = document.createRange();
  range.selectNodeContents(div);
  const rr = range.getBoundingClientRect();
  const db = div.getBoundingClientRect();
  const cb = card.getBoundingClientRect();
  return {
    text: div.textContent.trim(),
    divBox: { x: db.x, y: db.y, w: db.width, h: db.height },
    rangeBox: { x: rr.x, y: rr.y, w: rr.width, h: rr.height }, // tight glyph box
    cardBox: { x: cb.x, y: cb.y, w: cb.width, h: cb.height },
    // mark box (range) relative to card origin, in DPR-2 px (what boxes.json stores):
    markDPR2: {
      x: (rr.x - cb.x) * 2, y: (rr.y - cb.y) * 2,
      width: rr.width * 2, height: rr.height * 2,
    },
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();

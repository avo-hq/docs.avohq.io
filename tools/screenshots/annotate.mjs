// Docs-screenshot pipeline — annotate stage.
//
// Reads out/<id>.png + out/<id>.boxes.json (boxes recorded by capture.mjs at exact
// pixel coords) and draws marks with ImageMagick in one consistent house style:
//   highlight → rounded-rect outline around the element
//   badge     → numbered accent circle at the element's top-left corner
//   arrow     → accent arrow pointing at the element from `from` (n/s/e/w)
// Output: out/<id>.annotated.png
//
// Usage: node annotate.mjs <specId>

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");

const ACCENT = "#2563eb"; // Avo blue
const FOCUS_RING = "#60a5fa"; // Avo --color-info (blue-400) — matches the native :focus-visible ring
const FONT = process.env.ANNOTATE_FONT || "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
const id = process.argv[2];
if (!id) { console.error("Usage: node annotate.mjs <specId>"); process.exit(1); }
const SUFFIX = process.env.ANNOTATE_DARK ? "-dark" : ""; // annotate the -dark capture

const { dpr, marks } = JSON.parse(await readFile(join(OUT, `${id}${SUFFIX}.boxes.json`), "utf8"));
const s = (dpr || 2);              // scale stroke/badge sizes with DPR
const sw = 3 * s;                  // stroke width
const pad = 6 * s;                 // highlight padding around element
const draw = [];

for (const m of marks) {
  const x1 = Math.round(m.x - pad), y1 = Math.round(m.y - pad);
  const x2 = Math.round(m.x + m.width + pad), y2 = Math.round(m.y + m.height + pad);
  if (m.type === "highlight") {
    // `style: "focus"` mimics Avo's native :focus-visible ring — a thin (2px) blue-400
    // outline hugging the element with a ~2px gap. Default keeps the legacy chunky box.
    const focus = m.style === "focus";
    const hpad = (m.pad ?? (focus ? 2 : 6)) * s;
    const hsw = (m.stroke ?? (focus ? 2 : 3)) * s;
    const hradius = (m.radius ?? (focus ? 3 : 8)) * s;
    const hcolor = m.color ?? (focus ? FOCUS_RING : ACCENT);
    const fx1 = Math.round(m.x - hpad), fy1 = Math.round(m.y - hpad);
    const fx2 = Math.round(m.x + m.width + hpad), fy2 = Math.round(m.y + m.height + hpad);
    draw.push({ rect: `roundrectangle ${fx1},${fy1} ${fx2},${fy2} ${hradius},${hradius}`, color: hcolor, strokeWidth: hsw });
  } else if (m.type === "badge") {
    const r = 16 * s, cx = x1, cy = y1;
    // circle then number drawn separately via -annotate
    draw.push({ circle: [cx, cy, r], label: m.label, fontSize: 22 * s });
  } else if (m.type === "arrow") {
    // arrow comes FROM `from` (n/s/e/w) and points at the element. Default: n.
    const dir = m.from || "n";
    const L = 80 * s, gap = pad;
    const cx = Math.round(m.x + m.width / 2), cy = Math.round(m.y + m.height / 2);
    const left = Math.round(m.x), right = Math.round(m.x + m.width);
    const top = Math.round(m.y), bot = Math.round(m.y + m.height);
    let tip, tail;
    if (dir === "n") { tip = [cx, top - gap]; tail = [cx, top - gap - L]; }
    else if (dir === "s") { tip = [cx, bot + gap]; tail = [cx, bot + gap + L]; }
    else if (dir === "w") { tip = [left - gap, cy]; tail = [left - gap - L, cy]; }
    else { tip = [right + gap, cy]; tail = [right + gap + L, cy]; } // e
    draw.push({ arrow: [...tail, ...tip] });
  }
}

const src = join(OUT, `${id}${SUFFIX}.png`);
const dst = join(OUT, `${id}${SUFFIX}.annotated.png`);
const args = [src, "-strokewidth", String(sw), "-fill", "none", "-stroke", ACCENT];

// rectangles first — each carries its own stroke color/width
for (const d of draw) {
  if (d.rect) args.push("-stroke", d.color, "-strokewidth", String(d.strokeWidth), "-draw", d.rect);
}
// restore defaults for arrows/badges below
args.push("-stroke", ACCENT, "-strokewidth", String(sw));

// arrows + badges
for (const d of draw) {
  if (d.arrow) {
    const [x0, y0, x1, y1] = d.arrow; // tail -> tip
    args.push("-draw", `line ${x0},${y0} ${x1},${y1}`);
    const a = 9 * s;
    // arrowhead at the tip, oriented along (tip - tail)
    let head;
    if (x0 === x1) {
      head = y1 > y0 // pointing down vs up
        ? `${x1},${y1} ${x1 - a},${y1 - a} ${x1 + a},${y1 - a}`
        : `${x1},${y1} ${x1 - a},${y1 + a} ${x1 + a},${y1 + a}`;
    } else {
      head = x1 > x0 // pointing right vs left
        ? `${x1},${y1} ${x1 - a},${y1 - a} ${x1 - a},${y1 + a}`
        : `${x1},${y1} ${x1 + a},${y1 - a} ${x1 + a},${y1 + a}`;
    }
    args.push("-fill", ACCENT, "-stroke", ACCENT, "-draw", `polygon ${head}`, "-fill", "none");
  }
  if (d.circle) {
    const [cx, cy, r] = d.circle;
    args.push("-fill", ACCENT, "-stroke", "white",
      "-draw", `circle ${cx},${cy} ${cx + r},${cy}`,
      "-fill", "white", "-stroke", "none", "-font", FONT,
      "-pointsize", String(d.fontSize), "-gravity", "None",
      "-annotate", `+${cx - 7 * s}+${cy + 8 * s}`, String(d.label),
      "-fill", "none", "-stroke", ACCENT);
  }
}

args.push(dst);
await run("magick", args);
console.log(`✓ annotated → out/${id}.annotated.png (${marks.length} marks)`);

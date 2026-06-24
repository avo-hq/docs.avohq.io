// Docs-screenshot pipeline — STAGE 5b: apply.
//
// Given a captured spec `id`, this:
//   1. copies out/<id>.<ext> + out/<id>-dark.<ext> → the spec's `out:` path (+ `-dark` sibling),
//   2. rewrites the placeholder `<Image prompt=…/>` in its source doc to a finished
//      `<Image src dark-src width height alt prompt/>` — keeping `prompt`, emitting kebab
//      `dark-src`, dims read from the real asset.
//
// Works for both static PNG specs (SPECS, captured by capture.mjs) and animated GIF specs
// (GIF_SPECS, captured by record-gif.mjs). The asset extension is taken from the spec's
// `out:` path (.png or .gif); the rendered <Image> tag is identical either way — a .gif `src`
// animates natively in the browser, with the same dark-src swap.
//
// Leaves everything UNSTAGED (no git add / commit / push). Deterministic — no agent.
//
// The spec must carry, beyond the usual capture keys:
//   out:    "docs/public/assets/img/4_0/<page>/<name>.{png,gif}"  (light asset destination)
//   source: { file: "docs/4.0/<page>.md", prompt: "<the placeholder prompt text>" }
//   alt?:     accessible alt text (falls back to the prompt)
//   display?: "full" (default) | "half"  — half → width/height = pixel dims ÷ 2 (small/centered)
//
// Usage:
//   node apply.mjs <id>                 # look the spec up in specs.mjs
//   node apply.mjs <id> --spec-json p   # use a standalone spec JSON (testing / decoupled runs)
//   node apply.mjs <id> --dry           # print the rewrite, don't touch files

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const OUT = join(HERE, "out");

// ---- args -----------------------------------------------------------------
const argv = process.argv.slice(2);
const id = argv.find((a) => !a.startsWith("--"));
const dry = argv.includes("--dry");
let specJson = null;
const sj = argv.indexOf("--spec-json");
if (sj !== -1) specJson = resolve(argv[sj + 1]);
if (!id) {
  console.error("Usage: node apply.mjs <id> [--spec-json <path>] [--dry]");
  process.exit(1);
}

// ---- load the spec --------------------------------------------------------
let spec;
if (specJson) {
  spec = JSON.parse(readFileSync(specJson, "utf8"));
} else {
  const { SPECS, GIF_SPECS, NATIVE_SPECS } = await import("./specs.mjs");
  // look across all pools: SPECS (static PNGs), GIF_SPECS (headless GIFs), NATIVE_SPECS (OS-popup GIFs)
  spec =
    SPECS.find((s) => s.id === id) ||
    (GIF_SPECS || []).find((s) => s.id === id) ||
    (NATIVE_SPECS || []).find((s) => s.id === id);
}
if (!spec) throw new Error(`spec not found for id: ${id}`);
if (!spec.out) throw new Error(`spec ${id} has no out: path`);
if (!spec.source?.file || spec.source?.prompt == null)
  throw new Error(`spec ${id} needs source: { file, prompt } to locate its placeholder tag`);

// ---- read asset dimensions (no deps) --------------------------------------
// PNG: IHDR width/height are bytes 16..24, big-endian.
function pngSize(path) {
  const b = readFileSync(path);
  const sig = "\x89PNG\r\n\x1a\n";
  if (b.slice(0, 8).toString("latin1") !== sig) throw new Error(`not a PNG: ${path}`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}
// GIF: the logical-screen width/height are bytes 6..10, little-endian (every frame shares it).
function gifSize(path) {
  const b = readFileSync(path);
  if (b.slice(0, 3).toString("latin1") !== "GIF") throw new Error(`not a GIF: ${path}`);
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

// extension-aware paths: .png (capture.mjs) or .gif (record-gif.mjs)
const ext = spec.out.endsWith(".gif") ? ".gif" : ".png";
const isGif = ext === ".gif";
const darkSibling = (p) => p.replace(new RegExp(`\\${ext}$`), `-dark${ext}`);

// ---- copy captured assets → out: destinations -----------------------------
const lightSrc = join(OUT, `${spec.id}${ext}`);
const darkSrc = join(OUT, `${spec.id}-dark${ext}`);
for (const p of [lightSrc, darkSrc]) {
  if (!existsSync(p)) throw new Error(`captured asset missing: ${relative(REPO, p)} (run ${isGif ? "record-gif" : "capture"}.mjs ${spec.id} light + dark first)`);
}
const lightOut = join(REPO, spec.out);
const darkOut = join(REPO, darkSibling(spec.out));

// ---- compute the <Image> attributes ---------------------------------------
const { width: pxW, height: pxH } = isGif ? gifSize(lightSrc) : pngSize(lightSrc);
const half = spec.display === "half";
const w = half ? Math.round(pxW / 2) : pxW;
const h = half ? Math.round(pxH / 2) : pxH;

const toUrl = (outPath) => "/" + relative(join(REPO, "docs", "public"), join(REPO, outPath)).split(/[\\/]/).join("/");
const srcUrl = toUrl(spec.out);
const darkUrl = toUrl(darkSibling(spec.out));
const alt = (spec.alt || spec.source.prompt).replace(/"/g, "&quot;");
const promptAttr = spec.source.prompt.replace(/"/g, "&quot;");

const newTag =
  `<Image src="${srcUrl}" dark-src="${darkUrl}" ` +
  `width="${w}" height="${h}" alt="${alt}" prompt="${promptAttr}" />`;

// ---- locate + rewrite the placeholder tag in the source doc ---------------
function parsePrompt(tag) {
  const m = tag.match(/\b(?:prompt|promp)\s*=\s*("([^"]*)"|'([^']*)')/);
  return m ? (m[2] ?? m[3]) : null;
}
function hasSrc(tag) {
  const m = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/);
  return !!(m && (m[2] ?? m[3]).trim());
}

const srcFile = join(REPO, spec.source.file);
const content = readFileSync(srcFile, "utf8");
const tagRe = /<Image\b[^>]*?\/?>/gs;
const matches = [...content.matchAll(tagRe)].filter(
  (m) => !hasSrc(m[0]) && parsePrompt(m[0]) === spec.source.prompt
);
if (matches.length === 0) throw new Error(`no unresolved <Image prompt="${spec.source.prompt}"> found in ${spec.source.file}`);
if (matches.length > 1) throw new Error(`ambiguous: ${matches.length} placeholders with the same prompt in ${spec.source.file} — disambiguate before applying`);

const oldTag = matches[0][0];
const updated = content.replace(oldTag, newTag);

// ---- write (unless --dry) -------------------------------------------------
console.log(`apply ${spec.id}`);
console.log(`  ${relative(REPO, srcFile)}`);
console.log(`  - ${oldTag}`);
console.log(`  + ${newTag}`);
console.log(`  assets: ${spec.out}  +  ${darkSibling(spec.out)}  (${pxW}×${pxH} px → ${w}×${h})`);
if (dry) {
  console.log("  (dry run — nothing written)");
  process.exit(0);
}

mkdirSync(dirname(lightOut), { recursive: true });
copyFileSync(lightSrc, lightOut);
copyFileSync(darkSrc, darkOut);
writeFileSync(srcFile, updated);
console.log("  ✓ applied (unstaged — review, then stage yourself)");

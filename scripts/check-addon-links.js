#!/usr/bin/env node
// Verifies add-on links against avohq.io, the source of truth for add-on slugs.
//
// 1. Every 4.0 page with `license: addon`, and every inline
//    `<LicenseReq license="addon">`, must set `addon_link`. Without it the
//    License badge falls back to the generic pricing page.
// 2. Every https://avohq.io/addons/<slug> URL in the 4.0 docs (frontmatter or
//    body) must answer 200 with no redirect. HQ redirects an unknown slug to
//    /pricing (302) and a gem-name slug to the canonical one (301), so a
//    redirect means the link is wrong even though it "works" in a browser.
// 3. No add-on is linked through a pricing preselect URL
//    (avohq.io/pricing?add_ons[]=...). Link the add-on page instead.
//
// Usage: node scripts/check-addon-links.js [dir]   (default: docs/4.0)

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", process.argv[2] || "docs/4.0");
const ADDON_URL = /https:\/\/avohq\.io\/addons\/[a-z0-9-]+/g;
const PRICING_PRESELECT = /avohq\.io\/pricing[\w-]*\?add_ons/;

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([\w-]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.trim()])
  );
}

async function status(url) {
  const response = await fetch(url, { method: "GET", redirect: "manual" });
  return { code: response.status, location: response.headers.get("location") };
}

async function main() {
  const errors = [];
  const usages = new Map(); // url -> [file, ...]

  for (const file of markdownFiles(root)) {
    const source = fs.readFileSync(file, "utf8");
    const relative = path.relative(process.cwd(), file);
    const meta = frontmatter(source);

    if (meta.license === "addon" && !meta.addon_link) {
      errors.push(`${relative}: license: addon without addon_link`);
    }

    for (const tag of source.match(/<LicenseReq\b[^>]*>/g) || []) {
      if (/license="addon"/.test(tag) && !/addon_link=/.test(tag)) {
        errors.push(`${relative}: ${tag} without addon_link`);
      }
    }

    if (PRICING_PRESELECT.test(source)) {
      errors.push(`${relative}: links an add-on through pricing; use https://avohq.io/addons/<slug>`);
    }

    for (const url of new Set(source.match(ADDON_URL) || [])) {
      usages.set(url, [...(usages.get(url) || []), relative]);
    }
  }

  for (const [url, files] of usages) {
    const { code, location } = await status(url);
    if (code !== 200) {
      const target = location ? ` -> ${location}` : "";
      errors.push(`${url} answered ${code}${target}\n    used in: ${files.join(", ")}`);
    }
  }

  if (errors.length) {
    console.error(`Add-on link check failed (${errors.length}):\n`);
    errors.forEach((error) => console.error(`  ${error}`));
    console.error("\nValid slugs are the ones https://avohq.io/addons/<slug> serves with a 200.");
    process.exit(1);
  }

  console.log(`Add-on links OK: ${usages.size} URLs checked.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

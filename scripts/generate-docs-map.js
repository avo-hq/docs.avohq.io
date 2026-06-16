#!/usr/bin/env node

/**
 * Generate, per docs version:
 *   - docs/public/<version>/docs-map.md  — a hierarchical map of every page and
 *     its headings (groups → pages → headings), for easy LLM navigation.
 *   - docs/public/<version>/llms.txt     — a concise llmstxt.org-style index:
 *     a title, a short summary, pointers to the full text + map, then grouped
 *     links to every page.
 *
 * Both are derived from the VitePress sidebar in docs/.vitepress/config.js, so
 * they stay in sync with the published navigation. Run via:
 *   node scripts/generate-docs-map.js [version|latest|all]   (default: all)
 */

const path = require('path');
const fs = require('fs');

const { parseVitePressConfig } = require('../lib/vitepress-parser.js');

const SITE = 'https://docs.avohq.io';
const DOCS_DIR = path.resolve(__dirname, '..', 'docs');
const CONFIG_PATH = path.resolve(__dirname, '..', 'docs', '.vitepress', 'config.js');

// One-line summary used in the llms.txt header.
const SITE_SUMMARY =
  'Avo is a Ruby on Rails framework for building admin panels and internal tools. ' +
  'You configure resources, fields, actions, filters, dashboards, and more through ' +
  'familiar Ruby DSLs and extend anything with plain Rails code.';

/**
 * Resolve which versions to process from the CLI argument.
 */
function resolveVersions(arg, available) {
  const sorted = [...available].sort((a, b) => parseFloat(b) - parseFloat(a));
  if (!arg || arg === 'all') return sorted;
  if (arg === 'latest') return sorted.slice(0, 1);
  if (available.includes(arg)) return [arg];
  throw new Error(`Unknown version "${arg}". Available: ${sorted.join(', ')}`);
}

/**
 * Map a sidebar link (e.g. "/4.0/resources.html" or "/4.0/rest-api/") to the
 * markdown file that backs it.
 */
function linkToFile(link) {
  const clean = link.replace(/^https?:\/\/[^/]+/, '').split('#')[0];
  let rel;
  if (clean.endsWith('/')) rel = `${clean}index.md`;
  else if (clean.endsWith('.html')) rel = clean.replace(/\.html$/, '.md');
  else if (path.extname(clean)) rel = clean; // already has some extension
  else rel = `${clean}.md`; // extensionless link, e.g. /4.0/fields/avatar
  return path.join(DOCS_DIR, rel);
}

function absoluteUrl(link) {
  if (/^https?:\/\//.test(link)) return link;
  return `${SITE}${link}`;
}

/**
 * Pull h2–h4 headings out of a markdown file, skipping frontmatter and fenced
 * code blocks. Returns [{ level, text }].
 */
function extractHeadings(file) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    return null; // signal "file missing"
  }

  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const headings = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = line.match(/^(#{2,4})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;

    const text = m[2]
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) -> text
      .replace(/<[^>]+>/g, '') // strip inline HTML tags
      .replace(/[*_]/g, '')
      .trim();

    if (text) headings.push({ level: m[1].length, text });
  }

  return headings;
}

/**
 * Walk a sidebar section and collect its pages (DFS), deduped by link.
 * Returns [{ text, link }].
 */
function collectPages(section) {
  const pages = [];
  const seen = new Set();

  function walk(node) {
    if (node.link && !/^https?:\/\//.test(node.link) && !seen.has(node.link)) {
      seen.add(node.link);
      pages.push({ text: node.text, link: node.link });
    }
    if (Array.isArray(node.items)) node.items.forEach(walk);
  }

  walk(section);
  return pages;
}

/**
 * Build the docs-map.md body for one version.
 */
function buildDocsMap(version, sections) {
  const lines = [];
  lines.push(`# Avo ${version} documentation map`);
  lines.push('');
  lines.push(
    `A map of every Avo ${version} documentation page and its headings, designed for easy navigation by LLMs.`
  );
  lines.push('');
  lines.push(
    `For the concise index, see [llms.txt](${SITE}/${version}/llms.txt). ` +
      `For the full text of every page in one file, see [llms-full.txt](${SITE}/${version}/llms-full.txt).`
  );
  lines.push('');
  lines.push('> Auto-generated from the VitePress sidebar by `scripts/generate-docs-map.js`. Do not edit manually.');
  lines.push('');
  lines.push('## Document structure');
  lines.push('');
  lines.push("* **##** marks documentation groups (e.g. 'Resources')");
  lines.push('* **###** marks individual documentation pages');
  lines.push('* **Nested bullets** show the headings within each page');
  lines.push('* Each page title links to the full documentation');
  lines.push('');

  for (const section of sections) {
    const pages = collectPages(section);
    if (pages.length === 0) continue;

    lines.push(`## ${section.text}`);
    lines.push('');

    for (const page of pages) {
      lines.push(`### [${page.text}](${absoluteUrl(page.link)})`);
      lines.push('');

      const headings = extractHeadings(linkToFile(page.link));
      if (headings === null) {
        lines.push('* (Page source not found)');
      } else if (headings.length === 0) {
        lines.push('* (No headings found)');
      } else {
        for (const h of headings) {
          lines.push(`${'  '.repeat(h.level - 2)}* ${h.text}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

/**
 * Build the concise llms.txt index for one version.
 */
function buildLlmsTxt(version, sections) {
  const lines = [];
  lines.push(`# Avo for Ruby on Rails — v${version}`);
  lines.push('');
  lines.push(`> ${SITE_SUMMARY}`);
  lines.push('');
  lines.push(
    `This is the concise index. For the full text of every page in one file, see ` +
      `[llms-full.txt](${SITE}/${version}/llms-full.txt). For a map of every page and ` +
      `its headings, see [docs-map.md](${SITE}/${version}/docs-map.md).`
  );
  lines.push('');

  for (const section of sections) {
    const pages = collectPages(section);
    if (pages.length === 0) continue;

    lines.push(`## ${section.text}`);
    lines.push('');
    for (const page of pages) {
      lines.push(`- [${page.text}](${absoluteUrl(page.link)})`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

function write(version, filename, content) {
  const dir = path.join(DOCS_DIR, 'public', version);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, filename);
  fs.writeFileSync(out, content, 'utf8');
  return path.relative(path.resolve(__dirname, '..'), out);
}

async function main() {
  const arg = process.argv[2] || 'all';
  const { sidebar } = await parseVitePressConfig(CONFIG_PATH);
  const versions = resolveVersions(arg, Object.keys(sidebar));

  for (const version of versions) {
    const sections = sidebar[version] || [];
    const map = write(version, 'docs-map.md', buildDocsMap(version, sections));
    const idx = write(version, 'llms.txt', buildLlmsTxt(version, sections));
    console.log(`✓ ${version}: ${map}`);
    console.log(`✓ ${version}: ${idx}`);
  }
}

main().catch((err) => {
  console.error('Failed to generate docs map:', err.message);
  process.exit(1);
});

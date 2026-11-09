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
const markdown = require('markdown-it')({ html: true });

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

function headingText(text, preserveCode = false) {
  const label = text.replace(/\s+\{#[^}]+\}\s*$/, '');
  return markdown.parseInline(label, {})[0].children
    .filter((token) => token.type !== 'html_inline')
    .map((token) => preserveCode && token.type === 'code_inline' ? `\`${token.content}\`` : token.content)
    .join('')
    .trim();
}

/**
 * Pull Markdown and Option headings out of a page, skipping frontmatter and
 * code blocks. Option names are grouped under their section or parent option.
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
  const options = [];
  let sectionLevel = 1;
  const tokens = markdown.parse(body, {});

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'html_block') {
      for (const match of token.content.matchAll(/<\/?Option\b[^>]*>/g)) {
        if (match[0].startsWith('</')) {
          options.pop();
          continue;
        }
        const name = match[0].match(/\bname=(['"])(.*?)\1/);
        const size = match[0].match(/\bheadingSize=['"]([2-4])['"]/);
        const level = Math.max(Number(size?.[1] || 2), (options.at(-1) || sectionLevel) + 1);
        options.push(level);
        if (name) headings.push({ level, text: headingText(name[2], true), option: true });
      }
    } else if (token.type === 'heading_open' && /^h[2-4]$/.test(token.tag)) {
      const text = headingText(tokens[i + 1].content);
      if (options.length && /^(Default value|Possible values)$/i.test(text)) continue;
      const level = Math.max(Number(token.tag[1]), (options.at(-1) || 1) + 1);
      if (!options.length) sectionLevel = level;
      if (text) headings.push({ level, text });
    }
  }

  return headings;
}

/**
 * Read a page's `api_docs` frontmatter link (e.g. "./appearance-api.html") and
 * resolve it against the page's own link. Returns { text, link } or null.
 */
function apiDocsPage(pageLink) {
  let content;
  try {
    content = fs.readFileSync(linkToFile(pageLink), 'utf8');
  } catch {
    return null;
  }

  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) return null;

  const m = frontmatter[1].match(/^api_docs:\s*["']?(\S+?)["']?\s*$/m);
  if (!m) return null;

  const link = path.posix.join(path.posix.dirname(pageLink.split('#')[0]), m[1]);
  const apiContent = (() => {
    try {
      return fs.readFileSync(linkToFile(link), 'utf8');
    } catch {
      return '';
    }
  })();
  const h1 = apiContent.replace(/^---\n[\s\S]*?\n---\n/, '').match(/^#\s+(.+?)\s*$/m);

  return { text: h1 ? h1[1].replace(/`/g, '').trim() : 'API reference', link };
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
      `For the full text of every page in one file (large — high token count), see [llms-full.txt](${SITE}/${version}/llms-full.txt). ` +
      `For this map as raw markdown, see [docs-map.md](${SITE}/${version}/docs-map.md).`
  );
  lines.push('');
  lines.push('> Auto-generated from the VitePress sidebar by `scripts/generate-docs-map.js`. Do not edit manually.');
  lines.push('');
  lines.push('## Document structure');
  lines.push('');
  lines.push("* **##** marks documentation groups (e.g. 'Resources')");
  lines.push('* **###** marks individual documentation pages');
  lines.push('* **Nested bullets** show the headings within each page');
  lines.push('* Option names are grouped under their section; repeated pages link back without repeating their outline');
  lines.push('* Each page title links to the full documentation');
  lines.push('');

  const outlined = new Set();

  function pushPage(page) {
    const title = headingText(page.text);
    const pageLink = page.link.split('#')[0];
    if (outlined.has(pageLink)) {
      lines.push(`[${title}](${absoluteUrl(page.link)}) — outlined above.`);
      lines.push('');
      return;
    }
    outlined.add(pageLink);
    lines.push(`### [${title}](${absoluteUrl(pageLink)})`);
    lines.push('');

    if (page.link === '/4.0/upgrade.html' || page.link === '/4.0/avo-3-avo-4-upgrade.html') {
      lines.push(page.link === '/4.0/upgrade.html'
        ? 'Breaking changes and required actions by gem/version; fetch this page when upgrading.'
        : 'Avo 3 to Avo 4 migration steps and breaking changes; fetch this page when upgrading from Avo 3.');
      lines.push('');
      return;
    }

    const headings = extractHeadings(linkToFile(page.link));
    if (headings === null) {
      lines.push('* (Page source not found)');
    } else {
      let previous;
      for (const h of headings) {
        if (h.option && previous?.option && previous.level === h.level) {
          lines[lines.length - 1] += `, ${h.text}`;
        } else {
          lines.push(`${'  '.repeat(h.level - 2)}* ${h.text}`);
        }
        previous = h;
      }
    }
    lines.push('');
  }

  for (const section of sections) {
    const pages = collectPages(section);
    if (pages.length === 0) continue;

    const seen = new Set(pages.map((p) => p.link));

    lines.push(`## ${section.text}`);
    lines.push('');

    for (const page of pages) {
      pushPage(page);

      // Pages with an `api_docs` frontmatter link get their API reference
      // listed right after them, since API pages aren't in the sidebar.
      const api = apiDocsPage(page.link);
      if (api && !seen.has(api.link)) {
        seen.add(api.link);
        pushPage(api);
      }
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
    `This is the concise index. For the full text of every page in one file (large — high token count), see ` +
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

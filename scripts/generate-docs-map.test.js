const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname, 'generate-docs-map.js'), '4.0'], { cwd: root });
const map = fs.readFileSync(path.join(root, 'docs/public/4.0/docs-map.md'), 'utf8');
const pages = [...map.matchAll(/^### \[([^\n]+)\]\(([^\n]+)\)\n([\s\S]*?)(?=^###? |$(?![\s\S]))/gm)];

function pageBody(slug) {
  const page = pages.find((entry) => entry[2] === `https://docs.avohq.io/4.0/${slug}.html`);
  assert.ok(page, `Missing page: ${slug}`);
  return page[3];
}

test('lists option names under their sections and parents without boilerplate', () => {
  const area = pageBody('fields/area');
  for (const name of ['geometry', 'mapkick_options', 'datapoint_options']) {
    assert.ok(area.includes(`\`${name}\``));
  }
  assert.doesNotMatch(area, /Default value|Possible values/);
  assert.match(area, /Full example/);

  const layout = pageBody('fields-layout-api');
  assert.match(layout, /\* Panels\n  \* `panel`\n    \* `title`, `description`, `visible`\n  \* `card`/);
  assert.match(layout, /\* `tab`\n    \* `badge`, `lazy_load`, `loading`/);
  assert.match(pageBody('field-options-api'), /\* Visibility on views\n  \* `show_on`, `hide_on`, `only_on`, `except_on`, `visible`, `hide_if_blank`/);
  assert.match(pageBody('avo-current'), /`user`, `params`, `request`, `context`, `view_context`, `locale`, `tenant_id`, `tenant`/);
});

test('outlines each URL once while retaining cross-links in other groups', () => {
  const urls = pages.map((entry) => entry[2].split('#')[0]);
  assert.equal(new Set(urls).size, urls.length);
  for (const slug of ['ai', 'ai-what-you-can-ask', 'ai-agents-and-tools', 'mcp', 'mcp-api']) {
    assert.ok(urls.includes(`https://docs.avohq.io/4.0/${slug}.html`));
    assert.ok(map.includes(`](https://docs.avohq.io/4.0/${slug}.html) — outlined above.`));
  }
  assert.ok(map.includes('](https://docs.avohq.io/4.0/resources-api.html#index_slot) — outlined above.'));
});

test('preserves identifiers, cleans labels, and keeps upgrade pages concise', () => {
  assert.match(pageBody('resources'), /resource_parent_controller configuration option/);
  assert.doesNotMatch(map, /resourceparentcontroller|\{#|<\/?code>|\(No headings found\)/);
  assert.ok(pages.some((entry) => entry[1] === 'Avo::Current'));
  assert.match(pageBody('search'), /^\* Global search$/m);
  for (const slug of ['upgrade', 'avo-3-avo-4-upgrade']) {
    const body = pageBody(slug);
    assert.match(body, /fetch this page when upgrading/);
    assert.doesNotMatch(body, /^\s*\* /m);
  }
});

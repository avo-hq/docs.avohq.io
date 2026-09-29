<script setup lang="ts">
// Replaces VitePress's VPDocOutlineItem (aliased in config.js) so headings
// keep their inline `code` in the "On this page" outline instead of being
// flattened to plain text.
import type { DefaultTheme } from 'vitepress/theme'

defineProps<{
  headers: DefaultTheme.OutlineItem[]
  root?: boolean
}>()

// Same nodes VitePress drops from outline titles.
const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/

function titleHtml(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement
  for (const node of [...clone.children]) {
    if (ignoreRE.test(node.className)) node.remove()
  }
  // <Option> hides a "-> " marker in its heading for the outline; keep it
  // outside the code pill.
  for (const arrow of clone.querySelectorAll('code > .hidden')) {
    arrow.parentElement!.before(arrow)
  }
  return clone.innerHTML.trim()
}
</script>

<template>
  <ul class="VPDocOutlineItem" :class="root ? 'root' : 'nested'">
    <li v-for="{ children, link, title, element } in headers">
      <a v-if="element" class="outline-link" :href="link" :title v-html="titleHtml(element)" />
      <a v-else class="outline-link" :href="link" :title>{{ title }}</a>
      <template v-if="children?.length">
        <DocOutlineItem :headers="children" />
      </template>
    </li>
  </ul>
</template>

<style scoped>
.root {
  position: relative;
  z-index: 1;
}

.nested {
  padding-right: 0;
  padding-left: 8px;
}

.outline-link {
  display: block;
  line-height: 26px;
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s;
}

.outline-link:hover,
.outline-link.active {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.outline-link :deep(.hidden) {
  display: inline;
}

.outline-link :deep(code) {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  padding: 1px 4px;
  border-radius: 4px;
  background-color: var(--vp-code-bg);
  color: inherit;
}

.outline-link.nested {
  padding-left: 13px;
}
</style>

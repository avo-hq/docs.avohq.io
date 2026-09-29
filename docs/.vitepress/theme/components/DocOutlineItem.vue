<script setup lang="ts">
// Replaces VitePress's VPDocOutlineItem (aliased in config.js) so headings
// keep their inline `code` in the "On this page" outline instead of being
// flattened to plain text.
import { computed } from 'vue'
import type { DefaultTheme } from 'vitepress/theme'

const props = defineProps<{
  headers: DefaultTheme.OutlineItem[]
  root?: boolean
  grouped?: boolean
}>()

const isOption = (h: DefaultTheme.OutlineItem) => !!h.element?.querySelector('.hidden')

// <Option> headings default to h2, so they'd land at the top of the outline
// even when they document the section above them. Nest each one under the
// closest preceding non-option heading instead.
function groupOptions(headers: DefaultTheme.OutlineItem[]) {
  const flat: DefaultTheme.OutlineItem[] = []
  const walk = (hs: DefaultTheme.OutlineItem[]) => hs.forEach((h) => { flat.push(h); walk(h.children ?? []) })
  walk(headers)

  const root: DefaultTheme.OutlineItem[] = []
  const stack: DefaultTheme.OutlineItem[] = []
  for (const h of flat) {
    const node = { ...h, children: [] as DefaultTheme.OutlineItem[] }
    if (isOption(h)) {
      (stack.at(-1)?.children ?? root).push(node)
      continue
    }
    while (stack.length && stack.at(-1)!.level >= h.level) stack.pop()
    ;(stack.at(-1)?.children ?? root).push(node)
    stack.push(node)
  }
  return root
}

const items = computed(() => (props.grouped ? props.headers : groupOptions(props.headers)))

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
    <li v-for="{ children, link, title, element } in items">
      <a v-if="element" class="outline-link" :href="link" :title v-html="titleHtml(element)" />
      <a v-else class="outline-link" :href="link" :title>{{ title }}</a>
      <template v-if="children?.length">
        <DocOutlineItem :headers="children" grouped />
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
  padding-left: 16px;
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

/* Hang the <Option> arrow in the indent to the left of the row, so option
   names line up with the other headings. */
li {
  position: relative;
}

.outline-link :deep(.hidden) {
  display: inline;
  position: absolute;
  left: -16px;
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

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const VERSIONS = ['4', '3', '2']

// Derive the docs version (e.g. "2.0", "3.0", "4.0") from the current page path
// and render it as a short label like "v2" next to the logo.
const major = computed(() => {
  const match = page.value.relativePath.match(/(\d+)\.\d+\//)
  return match ? match[1] : null
})
const isOld = computed(() => major.value && major.value !== '4')

// ponytail: link to each version's index — same-page cross-version links 404 too often
const link = (v) => `/${v}.0/index.html`
</script>

<template>
  <span v-if="major" class="version-badge" :class="{ old: isOld }">
    <template v-for="v in VERSIONS" :key="v">
      <span v-if="v === major" class="current">v{{ v }}</span>
      <a v-else :href="link(v)" class="other">v{{ v }}</a>
    </template>
  </span>
</template>

<style scoped>
.version-badge {
  display: inline-flex;
  align-self: center;
  align-items: center;
  margin-left: 4px;
  margin-top: 0.5rem;
  margin-bottom: -0.3rem;
  padding: 3px 7px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  vertical-align: middle;
}

.version-badge.old {
  color: #c2410c;
  background-color: rgba(249, 115, 22, 0.16);
}

.version-badge > * {
  transition: max-width 0.25s ease, opacity 0.2s ease, margin 0.25s ease;
}

.version-badge .other {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  color: inherit;
  white-space: nowrap;
}

.version-badge:hover .other {
  max-width: 3em;
  opacity: 0.55;
}

/* space between items only while expanded, so collapsed links leave no gap */
.version-badge:hover > :not(:first-child) {
  margin-left: 7px;
}

.version-badge .other:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>

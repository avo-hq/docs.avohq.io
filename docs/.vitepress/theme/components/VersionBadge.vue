<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

// Derive the docs version (e.g. "2.0", "3.0", "4.0") from the current page path
// and render it as a short label like "v2" next to the logo.
const major = computed(() => {
  const match = page.value.relativePath.match(/(\d+)\.\d+\//)
  return match ? match[1] : null
})
const label = computed(() => (major.value ? `v${major.value}` : null))
const isOld = computed(() => major.value && major.value !== '4')
</script>

<template>
  <span v-if="label" class="version-badge" :class="{ old: isOld }">{{ label }}</span>
</template>

<style scoped>
.version-badge {
  display: inline-block;
  align-self: center;
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
</style>

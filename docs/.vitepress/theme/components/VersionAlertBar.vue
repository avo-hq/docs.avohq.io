<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

import TopBar from "./TopBar.vue"

const { page } = useData()

const major = computed(() => {
  const match = page.value.relativePath.match(/^(\d+)\.0\//)
  return match ? match[1] : null
})
</script>

<template>
  <TopBar>
    <p>You're viewing Avo {{ major }} docs — <a href="/4.0/">go to Avo 4</a></p>
  </TopBar>
</template>

<style scoped>
p {
  font-size: 13px;
}

a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: underline;
}

a:hover {
  text-decoration: none;
}
</style>

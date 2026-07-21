<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.documentElement.style.setProperty('--vp-layout-top-height', '2rem')
})

onUnmounted(() => {
  document.documentElement.style.removeProperty('--vp-layout-top-height')
})
</script>

<template>
  <section>
    <slot />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  height: var(--vp-layout-top-height);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-layout-top);
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}
</style>

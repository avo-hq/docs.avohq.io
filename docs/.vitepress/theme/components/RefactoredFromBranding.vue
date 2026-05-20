<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)

function dismiss() {
  show.value = false
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('from') !== 'branding') return

  show.value = true

  // Strip ?from=branding so a refresh doesn't keep showing the notice.
  params.delete('from')
  const query = params.toString()
  const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash
  window.history.replaceState({}, '', url)
})
</script>

<template>
  <div v-if="show" class="refactored-notice" role="status">
    <div class="refactored-notice__body">
      <strong>Branding has been refactored into Appearance.</strong>
      You've been redirected here from <code>/4.0/branding</code>.
      See the <a href="./avo-3-avo-4-upgrade.html#branding-renamed-to-appearance">upgrade guide</a> for migration
      details.
    </div>
    <button type="button" class="refactored-notice__close" aria-label="Dismiss" @click="dismiss">×</button>
  </div>
</template>

<style scoped>
.refactored-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0 0 1.5rem;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  background-color: rgb(239 246 255);
  border: 1px solid rgb(191 219 254);
  color: rgb(30 58 138);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 1rem;
}

.refactored-notice__body {
  flex: 1;
}

.refactored-notice code {
  background-color: rgb(219 234 254);
  padding: 0.05rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.85em;
}

.refactored-notice a {
  color: inherit;
  text-decoration: underline;
}

.refactored-notice__close {
  background: none;
  border: 0;
  color: inherit;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  opacity: 0.7;
}

.refactored-notice__close:hover {
  opacity: 1;
}

:global(.dark) .refactored-notice {
  background-color: rgba(30, 58, 138, 0.25);
  border-color: rgba(96, 165, 250, 0.4);
  color: rgb(191 219 254);
}

:global(.dark) .refactored-notice code {
  background-color: rgba(96, 165, 250, 0.2);
}
</style>

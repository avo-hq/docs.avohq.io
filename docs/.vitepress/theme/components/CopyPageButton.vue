<script setup>
import { ref } from 'vue'

const copied = ref(false)

function copyPage() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  navigator.clipboard.writeText(doc.innerText).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>

<template>
  <div class="mb-4">
    <button
      @click="copyPage"
      :class="[
        'flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
        copied
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
      ]"
      :title="copied ? 'Copied!' : 'Copy this page for LLM context'"
    >
      <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {{ copied ? 'Copied!' : 'Copy this page' }}
    </button>
  </div>
</template>

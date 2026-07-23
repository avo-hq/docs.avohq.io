<script setup>
import { ref } from 'vue'

const copiedPage = ref(false)
const copiedLink = ref(false)

function flash(flag) {
  flag.value = true
  setTimeout(() => { flag.value = false }, 2000)
}

// Published .md version of the current page (real markdown, includes the API reference notice).
function mdPath() {
  const p = window.location.pathname
  return (p.endsWith('/') ? `${p}index` : p.replace(/\.html$/, '')) + '.md'
}

function viewMarkdown() {
  window.open(mdPath(), '_blank')
}

async function copyPage() {
  // Prefer the published .md version of the page; fall back to the rendered text if unavailable.
  let text = null
  try {
    const res = await fetch(mdPath())
    if (res.ok && (res.headers.get('content-type') || '').includes('markdown')) {
      text = await res.text()
    }
  } catch {}

  if (text === null) {
    const doc = document.querySelector('.vp-doc')
    if (!doc) return
    text = doc.innerText
  }

  navigator.clipboard.writeText(text).then(() => flash(copiedPage))
}

function copyLink() {
  // ponytail: reuse VitePress's active outline highlight for the current section anchor
  const hash = document.querySelector('.VPDocAsideOutline .outline-link.active')?.getAttribute('href') || window.location.hash
  navigator.clipboard.writeText(window.location.origin + window.location.pathname + hash).then(() => flash(copiedLink))
}
</script>

<template>
  <div class="mb-4 flex flex-col gap-1.5">
    <div class="flex gap-1.5">
    <button
      @click="copyPage"
      :class="[
        'flex items-center justify-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
        copiedPage
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
      ]"
      :title="copiedPage ? 'Copied!' : 'Copy this page for LLM context'"
    >
      <svg v-if="!copiedPage" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {{ copiedPage ? 'Copied!' : 'Copy page' }}
    </button>
    <button
      @click="copyLink"
      :class="[
        'flex items-center justify-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
        copiedLink
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
      ]"
      :title="copiedLink ? 'Copied!' : 'Copy link to this page'"
    >
      <svg v-if="!copiedLink" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {{ copiedLink ? 'Copied!' : 'Copy link' }}
    </button>
    </div>
    <button
      @click="viewMarkdown"
      class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
      title="Open this page as Markdown"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      View as Markdown
    </button>
  </div>
</template>

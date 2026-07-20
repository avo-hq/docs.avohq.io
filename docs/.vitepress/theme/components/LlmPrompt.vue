<script setup>
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, page } = useData()
const copied = ref(false)

// Same canonical URL logic as transformPageData in config.js
const link = computed(() =>
  `https://docs.avohq.io/${page.value.relativePath}`
    .replace(/index\.md$/, '')
    .replace(/\.md$/, '.html')
)

const prompt = computed(() =>
  (frontmatter.value.prompt || '').replace(/\$\{link\}/g, link.value)
)

function copy() {
  navigator.clipboard.writeText(prompt.value).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<template>
  <button v-if="prompt" class="llm-prompt" @click="copy" :title="copied ? 'Copied!' : 'Click to copy this prompt'">
    <span class="llm-prompt__header">
      <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {{ copied ? 'Copied!' : 'Prompt for your AI agent' }}
    </span>
    <span class="llm-prompt__text">{{ prompt }}</span>
  </button>
</template>

<style scoped>
.llm-prompt {
  display: block;
  width: 100%;
  margin: 0.75rem 0 1.25rem;
  padding: 0.5rem 0.75rem;
  text-align: left;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.llm-prompt:hover {
  border-color: var(--vp-c-brand-1);
}

.llm-prompt__header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin-bottom: 0.25rem;
}

.llm-prompt:hover .llm-prompt__header {
  color: var(--vp-c-brand-1);
}

.llm-prompt__header svg {
  width: 0.75rem;
  height: 0.75rem;
}

.llm-prompt__text {
  display: block;
  font-size: 0.8125rem;
  font-family: var(--vp-font-family-mono);
  line-height: 1.5;
  color: var(--vp-c-text-2);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  /* Collapsed: one row, faded out at the bottom */
  max-height: 1.5em;
  mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
  transition: max-height 0.25s ease;
}

.llm-prompt:hover .llm-prompt__text {
  max-height: 12em;
  mask-image: none;
  -webkit-mask-image: none;
}
</style>

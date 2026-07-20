<script setup>
const props = defineProps({
  version: String,
})
const editors = ["vscode", "cursor", "zed", "windsurf", "claude", "codex", "opencode", "jetbrains", "chatgpt", "gemini", "grok"]
const names = {
  vscode: "VSCode",
  cursor: "Cursor",
  zed: "Zed",
  windsurf: "Windsurf",
  claude: "Claude",
  codex: "Codex",
  opencode: "OpenCode",
  jetbrains: "JetBrains IDEs",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
}
// Editors with a separate dark-mode logo ({editor}-dark.webp)
const darkVariants = ["opencode"]
</script>

<template>
  <div class="flex flex-wrap gap-8">
    <a :href="`/${props.version}/llm-support/${editor}`" v-for="editor in editors" :title="names[editor]" class="editor-link">
      <img :src="`/assets/img/llm-support/${editor}.webp`" class="h-16" :class="darkVariants.includes(editor) ? 'dark:hidden' : ''" :alt="names[editor]" />
      <img v-if="darkVariants.includes(editor)" :src="`/assets/img/llm-support/${editor}-dark.webp`" class="h-16 hidden dark:block" :alt="names[editor]" />
      <span class="editor-link__name">{{ names[editor] }}</span>
    </a>
  </div>
</template>

<style scoped>
.editor-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
}

.editor-link__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.editor-link:hover .editor-link__name {
  color: var(--vp-c-brand-1);
}
</style>

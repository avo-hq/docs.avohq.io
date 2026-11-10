<script setup>
import { computed } from "vue"

const props = defineProps({
  version: String,
})
const editors = computed(() => props.version === "4.0"
  ? ["claude", "cursor", "codex", "amp", "opencode", "vscode", "gemini", "jetbrains", "zed", "devin", "cline"]
  : ["vscode", "cursor", "zed", "windsurf", "claude", "codex", "opencode", "amp", "jetbrains", "chatgpt", "gemini", "grok"])
const names = {
  vscode: "VSCode",
  cursor: "Cursor",
  zed: "Zed",
  windsurf: "Windsurf",
  claude: "Claude",
  codex: "Codex",
  opencode: "OpenCode",
  amp: "Amp",
  jetbrains: "JetBrains IDEs",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
}
const agentNames = { ...names, claude: "Claude Code", vscode: "GitHub Copilot (VS Code)", gemini: "Gemini CLI", devin: "Devin Desktop", cline: "Cline" }
const labels = computed(() => props.version === "4.0" ? agentNames : names)
// Editors with a separate dark-mode logo ({editor}-dark.webp)
const darkVariants = ["opencode"]
</script>

<template>
  <div class="flex flex-wrap gap-8">
    <a :href="`/${props.version}/llm-support/${editor}`" v-for="editor in editors" :key="editor" :title="labels[editor]" class="editor-link">
      <img :src="`/assets/img/llm-support/${editor}.webp`" class="h-16" :class="darkVariants.includes(editor) ? 'dark:hidden' : ''" :alt="labels[editor]" />
      <img v-if="darkVariants.includes(editor)" :src="`/assets/img/llm-support/${editor}-dark.webp`" class="h-16 hidden dark:block" :alt="labels[editor]" />
      <span class="editor-link__name">{{ labels[editor] }}</span>
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
  max-width: 9rem;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.editor-link:hover .editor-link__name {
  color: var(--vp-c-brand-1);
}
</style>

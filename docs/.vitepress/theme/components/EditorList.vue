<script setup>
const editors = ["vscode", "cursor", "zed", "windsurf", "claude", "chatgpt", "gemini", "grok"]
</script>

<template>
  <div class="flex flex-wrap gap-8">
    <a :href="`/4.0/editor/${editor}`" v-for="editor in editors">
      <img :src="`/assets/img/editor/${editor}.webp`" class="h-16" :alt="editor" />
    </a>
  </div>
</template>

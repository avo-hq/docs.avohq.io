<script setup>
const props = defineProps({
  version: String,
})
const editors = ["vscode", "cursor", "zed", "windsurf", "claude", "chatgpt", "gemini", "grok"]

</script>

<template>
  <div class="flex flex-wrap gap-8">
    <a :href="`/${props.version}/llms/${editor}`" v-for="editor in editors">
      <img :src="`/assets/img/llms/${editor}.webp`" class="h-16" :alt="editor" />
    </a>
  </div>
</template>

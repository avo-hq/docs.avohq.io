# Code editors and LLM setup

Use `https://avohq.io/llms.txt` to setup your LLM integration in Cursor, VSCode, and other code editors.

It's a compact, text version of Avo's docs to help AI generate accurate Avo code based on your prompt.

```bash
https://avohq.io/llms.txt
```

## Pick your tool

<script setup>
const editors = ["vscode", "cursor", "zed", "windsurf", "claude", "chatgpt", "gemini", "grok"]
</script>

<div class="flex flex-wrap gap-8">
  <a :href="`/4.0/editor/${editor}`" v-for="editor in editors">
    <img :src="`/assets/img/editor/${editor}.webp`" class="h-16" :alt="editor" />
  </a>
</div>

<br>

> [!INFO] Thanks DaisyUI!
> We sourced most of the docs from [DaisyUI's excellent editors page](https://daisyui.com/docs/editor/)

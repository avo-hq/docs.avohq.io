<script setup>
const props = defineProps({
  content: String,
})
</script>

<template>
  <div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;" v-html="content"></span></span></code></pre></div>
</template>
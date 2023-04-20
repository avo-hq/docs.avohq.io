<script setup>
import { viewPath } from "./helpers";
</script>

<template>
  <a :href="viewPath(window, 'index')"><code>Index</code></a>
</template>

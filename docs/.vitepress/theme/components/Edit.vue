<script setup>
import { viewPath } from "./helpers";
</script>

<template>
  <a :href="viewPath(window, 'edit')"><code>Edit</code></a>
</template>

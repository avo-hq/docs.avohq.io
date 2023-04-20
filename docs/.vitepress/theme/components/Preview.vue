<script setup>
import {viewPath} from './helpers'
</script>

<template>
  <a :href="viewPath(window, 'preview')"><code>Preview</code></a>
</template>

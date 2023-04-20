<script setup>
import {viewPath} from './helpers'
</script>

<template>
  <a :href="viewPath(window, 'new')"><code>New</code></a>
</template>

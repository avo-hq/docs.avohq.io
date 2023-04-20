<script setup>
import {viewPath} from './helpers'
</script>

<template>
  <a :href="viewPath(window, 'show')"><code>Show</code></a>
</template>

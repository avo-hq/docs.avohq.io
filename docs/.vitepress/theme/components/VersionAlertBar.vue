<script setup>
import TopBar from "./TopBar.vue"
</script>

<template>
  <TopBar>
    <p>You are browsing docs for Avo 2: go to <a href="/3.0/">Avo 3</a></p>
  </TopBar>
</template>

<style scoped>
  a {
    font-weight: bold;
    text-decoration: underline;
  }

  a:hover {
    text-decoration: none;
  }
</style>

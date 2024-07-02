<script setup>
const props = defineProps({
  href: String,
})
</script>

<template>
  <li>
    <a :href="props.href"><slot></slot></a>
  </li>
</template>

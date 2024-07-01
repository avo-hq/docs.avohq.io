<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: String,
  height: String,
  alt: String,
  src: String,
})


const width = computed(() => parseInt(props.width) || 0)
const height = computed(() => parseInt(props.height) || 0)
const alt = computed(() => props.alt || 'Avo')
const src = computed(() => props.src || '')
const style = computed(() => `padding-bottom: calc(${height.value}/${width.value} * 100%);`)
</script>

<template>
  <div class="aspect-ratio-box" :style="style">
    <img :src="src" :alt="alt" loading="lazy" class="aspect-ratio-box-inside">
  </div>
</template>

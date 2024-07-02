<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: Number,
  height: Number,
  alt: String,
  src: String,
  size: String, // WIDTHxHEIGHT as a string
})

let widthSize, heightSize

if (props.size) {
  const sizes = props.size.toString().split('x')
  widthSize = sizes[0]
  heightSize = sizes[1]
}
const width = computed(() => parseInt(widthSize) || props.width || 0)
const height = computed(() => parseInt(heightSize) || props.height || 0)

const alt = computed(() => props.alt || 'Avo')
const src = computed(() => props.src || '')
const style = computed(() => `padding-bottom: calc(${height.value}/${width.value} * 100%);`)
</script>

<template>
  <div class="aspect-ratio-box" :style="style">
    <img :src="src" :alt="alt" loading="lazy" class="aspect-ratio-box-inside">
  </div>
</template>

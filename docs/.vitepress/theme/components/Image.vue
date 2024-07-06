<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  width: String,
  height: String,
  alt: String,
  src: String,
  size: String, // WIDTHxHEIGHT as a string
})

const imageIsSmallerThanParent = ref(false)

let widthSize = ref(null)
let heightSize = ref(null)

if (props.size) {
  const sizes = props.size.toString().split('x')
  widthSize.value = sizes[0]
  heightSize.value = sizes[1]
}

const width = computed(() => parseInt(widthSize.value) || parseInt(props.width) || 0)
const height = computed(() => parseInt(heightSize.value) || parseInt(props.height) || 0)

const alt = computed(() => props.alt || 'Avo')
const src = computed(() => props.src || '')
const style = computed(() => {
  if (imageIsSmallerThanParent.value) {
    return `width: ${width.value}px; height: ${height.value}px;`
  }
  return `padding-bottom: calc(${height.value}/${width.value} * 100%);`
})
const parent = ref(null)

onMounted(() => {
  checkParentWidth()
})

const checkParentWidth = () => {
  const parentWidth = parent.value.parentNode.getBoundingClientRect().width
  const imageWidth = width

  imageIsSmallerThanParent.value = parentWidth > imageWidth.value
}
</script>

<template>
  <div class="aspect-ratio-box" :width="width" :height="height" :style="style" ref="parent">
    <img :src="src" :alt="alt" loading="lazy" class="aspect-ratio-box-inside">
  </div>
</template>

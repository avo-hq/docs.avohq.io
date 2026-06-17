<script setup>
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const props = defineProps({
  width: String,
  height: String,
  alt: String,
  src: String,
  darkSrc: String, // optional dark-theme variant; used when the docs are in dark mode
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
const src = computed(() => (isDark.value && props.darkSrc) ? props.darkSrc : (props.src || ''))
const style = computed(() => {
  if (imageIsSmallerThanParent.value) {
    // content-box so the declared width/height describe the image area itself;
    // the 12px mat border (4_0 framing) then sits OUTSIDE and can't distort the
    // image's aspect ratio. (Default border-box would shrink the inner image
    // unevenly, stretching wide/short shots like control bars.)
    return `box-sizing: content-box; width: ${width.value}px; height: ${height.value}px;`
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

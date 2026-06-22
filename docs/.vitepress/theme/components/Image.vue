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
  prompt: String, // screenshot-pipeline placeholder: what the image should show (kept as provenance once resolved)
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

// A tag carrying a `prompt` but no image source yet is an unresolved screenshot
// placeholder — the automated pipeline fills it in. Render a visible TODO box instead
// of a broken <img>. Once `src`/`dark-src` are set, `prompt` is ignored for rendering.
const isPlaceholder = computed(() => !props.src && !props.darkSrc && !!props.prompt)

const style = computed(() => {
  if (imageIsSmallerThanParent.value) {
    return `width: ${width.value}px; height: ${height.value}px;`
  }
  return `padding-bottom: calc(${height.value}/${width.value} * 100%);`
})
const parent = ref(null)

onMounted(() => {
  if (!isPlaceholder.value && parent.value) checkParentWidth()
})

const checkParentWidth = () => {
  const parentWidth = parent.value.parentNode.getBoundingClientRect().width
  const imageWidth = width

  imageIsSmallerThanParent.value = parentWidth > imageWidth.value
}
</script>

<template>
  <div
    v-if="isPlaceholder"
    class="image-prompt-placeholder"
    role="img"
    :aria-label="`Screenshot pending: ${prompt}`"
  >
    <span class="image-prompt-placeholder__badge">📸 screenshot pending</span>
    <span class="image-prompt-placeholder__text">{{ prompt }}</span>
  </div>
  <div v-else class="aspect-ratio-box" :width="width" :height="height" :style="style" ref="parent">
    <img :src="src" :alt="alt" loading="lazy" class="aspect-ratio-box-inside">
  </div>
</template>

<style scoped>
.image-prompt-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1.5rem;
  text-align: center;
  border: 2px dashed var(--vp-c-border, #d1d5db);
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f6f6f7);
  color: var(--vp-c-text-2, #60676f);
}
.image-prompt-placeholder__badge {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--vp-c-text-1, #1f2329);
}
.image-prompt-placeholder__text {
  font-size: 0.95rem;
  font-style: italic;
  max-width: 42rem;
}
</style>

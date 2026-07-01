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

// Has both variants → can be flipped on its own.
const hasBothVariants = computed(() => !!props.src && !!props.darkSrc)

// null = follow the page; true/false = pin this image.
const localDark = ref(null)
const effectiveDark = computed(() => localDark.value === null ? isDark.value : localDark.value)

const setLocalDark = (value) => {
  localDark.value = value
}

const src = computed(() => (effectiveDark.value && props.darkSrc) ? props.darkSrc : (props.src || ''))

// Recolor the mat/hairline to match a flipped image (frame reads these vars).
const frameVars = computed(() => {
  if (!hasBothVariants.value) return {}
  return effectiveDark.value
    ? { '--vp-c-bg': '#1b1b1f', '--vp-c-divider': '#2e2e32' }
    : { '--vp-c-bg': '#ffffff', '--vp-c-divider': '#e2e2e3' }
})

// A tag carrying a `prompt` but no image source yet is an unresolved screenshot
// placeholder — the automated pipeline fills it in. Render a visible TODO box instead
// of a broken <img>. Once `src`/`dark-src` are set, `prompt` is ignored for rendering.
const isPlaceholder = computed(() => !props.src && !props.darkSrc && !!props.prompt)

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
  <div v-else class="image-figure">
    <!-- Switch above the image, never overlapping it. -->
    <div v-if="hasBothVariants" class="image-toolbar">
      <div class="image-theme-switch" role="group" aria-label="Preview this image in light or dark mode">
        <button
          type="button"
          class="image-theme-switch__option"
          :class="{ 'image-theme-switch__option--active': !effectiveDark }"
          :aria-pressed="!effectiveDark"
          @click="setLocalDark(false)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <span>Light</span>
        </button>
        <button
          type="button"
          class="image-theme-switch__option"
          :class="{ 'image-theme-switch__option--active': effectiveDark }"
          :aria-pressed="effectiveDark"
          @click="setLocalDark(true)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span>Dark</span>
        </button>
      </div>
    </div>
    <div class="aspect-ratio-box" :width="width" :height="height" :style="[style, frameVars]" ref="parent">
      <img :src="src" :alt="alt" loading="lazy" class="aspect-ratio-box-inside">
    </div>
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

/* Per-image light/dark switch. */
.image-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.image-theme-switch {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--vp-c-border, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f6f6f7);
}
.image-theme-switch__option {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2, #60676f);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}
.image-theme-switch__option:hover {
  color: var(--vp-c-text-1, #1f2329);
}
/* Active = shown mode. */
.image-theme-switch__option--active {
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-brand-1, #3451b2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
</style>

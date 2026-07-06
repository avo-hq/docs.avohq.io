<script setup>
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

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
const parentWidth = ref(0)

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

// Start light to match SSR, then follow the theme after mount — otherwise the
// hydration mismatch leaves production images stuck on light.
const mounted = ref(false)

const effectiveDark = computed(() => {
  if (localDark.value !== null) return localDark.value
  return mounted.value ? isDark.value : false
})

const src = computed(() => (effectiveDark.value && props.darkSrc) ? props.darkSrc : (props.src || ''))

// custom.css recolors the frame + switch off this attribute, so a flipped
// image never shows a mismatched seam.
const imageTheme = computed(() => hasBothVariants.value ? (effectiveDark.value ? 'dark' : 'light') : null)

// A tag carrying a `prompt` but no image source yet is an unresolved screenshot
// placeholder — the automated pipeline fills it in. Render a visible TODO box instead
// of a broken <img>. Once `src`/`dark-src` are set, `prompt` is ignored for rendering.
const isPlaceholder = computed(() => !props.src && !props.darkSrc && !!props.prompt)

// Rendered height in px: full-width images scale to the column (padding-bottom
// ratio), smaller images render at their natural height. Used to decide when the
// overlaid switch would crowd a short frame.
const renderedHeight = computed(() => {
  if (!width.value || !height.value) return 0
  if (imageIsSmallerThanParent.value) return height.value
  return parentWidth.value ? parentWidth.value * (height.value / width.value) : 0
})
// Below this, the ~28px switch overlaid inside the corner covers too much of the
// image — pop it out above the frame on hover instead (see scoped CSS).
const isShort = computed(() => hasBothVariants.value && renderedHeight.value > 0 && renderedHeight.value < 120)

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
  mounted.value = true
  if (!isPlaceholder.value && parent.value) checkParentWidth()
})

const checkParentWidth = () => {
  const measuredWidth = parent.value.parentNode.getBoundingClientRect().width
  parentWidth.value = measuredWidth

  imageIsSmallerThanParent.value = measuredWidth > width.value
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
  <div
    v-else
    class="aspect-ratio-box"
    :width="width"
    :height="height"
    :style="style"
    :data-image-theme="imageTheme"
    :data-short="isShort ? '' : null"
    ref="parent"
  >
    <img :src="src" :alt="alt" loading="lazy" class="aspect-ratio-box-inside">
    <!-- Overlaid on the image so it takes no vertical space; revealed on hover
         (always visible, icons only, on touch devices). -->
    <div v-if="hasBothVariants" class="image-theme-switch" role="group" aria-label="Preview this image in light or dark mode">
      <button
        type="button"
        class="image-theme-switch__option"
        :class="{ 'image-theme-switch__option--active': !effectiveDark }"
        :aria-pressed="!effectiveDark"
        aria-label="Light"
        @click="localDark = false"
      >
        <SunIcon class="image-theme-switch__icon" />
        <span class="image-theme-switch__label">Light</span>
      </button>
      <button
        type="button"
        class="image-theme-switch__option"
        :class="{ 'image-theme-switch__option--active': effectiveDark }"
        :aria-pressed="effectiveDark"
        aria-label="Dark"
        @click="localDark = true"
      >
        <MoonIcon class="image-theme-switch__icon" />
        <span class="image-theme-switch__label">Dark</span>
      </button>
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

/* Per-image light/dark switch, overlaid on the image's top-end corner. */
.image-theme-switch {
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  z-index: 1;
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  /* No var() fallbacks here: the switch only renders inside a
     [data-image-theme] frame, which always defines these (custom.css). */
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
/* Hover-capable devices on md+ (Tailwind md = 768px) viewports: keep the image
   clean until pointed at (or focused via keyboard). */
@media (hover: hover) and (min-width: 768px) {
  .image-theme-switch {
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .aspect-ratio-box:hover .image-theme-switch,
  .image-theme-switch:focus-within {
    opacity: 1;
  }
  /* Short frames: the overlaid corner switch would cover too much of the image.
     On hover, lift it out above the frame (overflow: visible lets it escape) and
     float it over whatever sits above via a high z-index — no reserved space, so
     idle short images stay clean. */
  .aspect-ratio-box[data-short] {
    overflow: visible;
  }
  .aspect-ratio-box[data-short] .image-theme-switch {
    top: auto;
    bottom: calc(100% + 9px);
    inset-inline-end: 0;
    z-index: 10;
  }
}
/* Touch devices and sub-md viewports: always visible, compact (icons only),
   and moved off the screenshot into the widened top mat (custom.css grows the
   frame's top border to make room — its media query mirrors this one; keep
   them in sync). Anchored to the image's top edge, so vertical placement
   holds regardless of the mat's exact height — but the mat must still be
   tall enough to contain the switch (see the clearance note in custom.css). */
@media (hover: none), (max-width: 767px) {
  .image-theme-switch__label {
    display: none;
  }
  .image-theme-switch {
    top: auto;
    bottom: calc(100% + 9px);
    inset-inline-end: 0;
  }
}
.image-theme-switch__icon {
  width: 15px;
  height: 15px;
}
.image-theme-switch__option {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}
.image-theme-switch__option:hover {
  color: var(--vp-c-text-1);
}
/* Active = shown mode. */
.image-theme-switch__option--active {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
</style>

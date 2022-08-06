<script setup>
import sample from 'lodash/sample'

const props = defineProps({
  href: String,
  title: String,
  src: String,
  alt: String,
  blank: Boolean,
})
let title = props.title
let href = props.href
let src = props.src
let alt = props.alt

if (props.blank) {
  title = "Sponsor Avo"
  href = "https://github.com/sponsors/adrianthedev"
  src = sample(["/img/sponsors/your-logo-here.png", "/img/sponsors/sponsor.png"])
  alt = "Sponsor Avo"
}


      // <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
      //   <a href="https://github.com/sponsors/adrianthedev"
      //     target="_blank"
      //     title="Sponsor Avo"
      //   >
      //     <img class="max-h-12 opacity-30" src="/img/sponsors/your-logo-here.png" alt="Sponsor Avo">
      //   </a>
      // </div>
</script>

<template>
  <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
    <a :href="href"
      target="_blank"
      :title="title"
    >
      <img class="max-h-12" :src="src" :alt="alt" :class="{
        'opacity-30 dark:opacity-50 dark:invert': blank
      }">
    </a>
  </div>
</template>

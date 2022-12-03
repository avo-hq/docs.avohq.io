<script setup>
import {computed} from 'vue'
import WrenchScrewdriverIcon from './WrenchScrewdriverIcon.vue'

const props = defineProps({
  link: String,
})
</script>

<template>
  <a :href="link"
    target="_blank"
    v-if="link"
    class="text-sm inline-flex items-center rounded hite no-underline px-2 py-1 leading-none border dark:border-white border-gray-900 hover:bg-gray-900 !text-gray-900 dark:!text-white hover:!text-white dark:hover:bg-white dark:hover:!text-gray-900"
  >
    <WrenchScrewdriverIcon class="h-4 inline mr-1 dark:stroke-white hover:dark:stroke-white" /> Experience the demo
  </a>
</template>

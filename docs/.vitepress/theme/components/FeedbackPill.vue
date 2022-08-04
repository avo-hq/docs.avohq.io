<script setup>
import {AnnotationIcon} from '@heroicons/vue/outline'

const props = defineProps({
  href: String,
  label: String
})
const label = props.label || "Provide feedback"
</script>

<template>
  <a :href="href" target="_blank" class="inline-flex items-center rounded bg-purple-600 hover:bg-purple-500 !text-white no-underline px-2 py-1 leading-none mt-2"><AnnotationIcon class="h-4 inline mr-1" /> {{label}}</a>
</template>
<script setup>
import {AnnotationIcon} from '@heroicons/vue/outline'

const props = defineProps({
  feedbackId: String,
  href: String,
  label: String
})

const feedbackId = props.feedbackId || 832
const href = props.href || `https://github.com/avo-hq/avo/discussions/${943}`
const label = props.label || "Send feedback about this feature"
</script>

<template>
  <a :href="href" target="_blank" class="inline-flex items-center rounded bg-purple-600 hover:bg-purple-500 !text-white no-underline px-2 py-1 leading-none"><AnnotationIcon class="h-4 inline mr-1" /> {{label}}</a>
</template>
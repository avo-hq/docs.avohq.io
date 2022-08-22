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
  <a :href="href" target="_blank" class="text-sm inline-flex items-center rounded bg-[#055085] hover:bg-[#033c63] !text-white no-underline px-2 py-1 leading-none"><AnnotationIcon class="h-4 inline mr-1" /> {{label}}</a>
</template>

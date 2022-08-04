<script setup>
import {computed} from 'vue'
import { InformationCircleIcon } from '@heroicons/vue/outline'

const props = defineProps({
  demoVideo: String,
})
// const license = computed(() => props.license || 'community')
// console.log('license->', license)
const links = {
  community: "https://avohq.io/pricing#comparison-heading",
  pro: "https://avohq.io/subscriptions/new?plan=2"
}
const labels = {
  community: "Community",
  pro: "Pro"
}
// const href = computed(() => links[license.value])
// const label = computed(() => labels[license.value])
// console.log('label->', license.value, label.value)
// const label = "This is a pro feature"
</script>

<template>
  <a :href="demoVideo"
    target="_blank"
    v-if="demoVideo"
    class="inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none bg-red-600 hover:bg-red-500"
  >
    <InformationCircleIcon class="h-4 inline mr-1" /> Demo video
  </a>
</template>
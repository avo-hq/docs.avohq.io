<script setup>
import {computed} from 'vue'

const props = defineProps({
  demoVideo: String,
})
const links = {
  community: "https://avohq.io/pricing#comparison-heading",
  pro: "https://avohq.io/subscriptions/new?plan=2"
}
const labels = {
  community: "Community",
  pro: "Pro"
}
</script>

<template>
  <a :href="demoVideo"
    target="_blank"
    v-if="demoVideo"
    class="inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none bg-red-600 hover:bg-red-500"
  >
    <PlayIcon class="h-4 inline mr-1" /> Demo video
  </a>
</template>
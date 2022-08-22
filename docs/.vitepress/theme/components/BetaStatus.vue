<script setup>
import {computed} from 'vue'

const props = defineProps({
  label: String,
})
const label = computed(() => props.label || 'Beta')
const href = null
</script>

<template>
  <a :href="href" target="_blank"
    class="text-sm inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none bg-gray-700" title="This feature is not stable yet and the API might suffer changes until a stable version is published.">
    <BeakerIcon class="h-4 inline mr-1" /> {{label}}
  </a>
</template>

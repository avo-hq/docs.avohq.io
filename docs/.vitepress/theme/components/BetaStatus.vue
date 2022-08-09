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
    class="inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none bg-blue-600 hover:bg-gray-500">
    <BeakerIcon class="h-4 inline mr-1" /> {{label}}
  </a>
</template>

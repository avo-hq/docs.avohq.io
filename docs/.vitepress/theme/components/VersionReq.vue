<script setup>
import {computed} from 'vue'
import { InformationCircleIcon } from '@heroicons/vue/outline'

const props = defineProps({
  version: String,
})
const version = computed(() => props.version || '2.0')
const href = null
const label = computed(() => version.value === "unreleased" ? "Unreleased yet" : `Since: Avo v${version.value}`)
</script>

<template>
  <a :href="href" target="_blank"
    class="inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none bg-gray-600 hover:bg-gray-500">
    <InformationCircleIcon class="h-4 inline mr-1" /> {{label}}
  </a>
</template>

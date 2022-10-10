<script setup>
import {computed} from 'vue'

const props = defineProps({
  version: String,
})
const version = computed(() => props.version || '2.0')
const fullVersion = computed(() => {
  if (!props.version) {
    return "2.0.0"
  }

  const matchesPatchVersion = props.version.match(/\d*\.\d*\.\d*/g)
  if (matchesPatchVersion) {
    return props.version

  } else {
    return `${props.version}.0`
  }
})
const href = computed(() => `https://avohq.io/releases/${fullVersion.value}`)
const label = computed(() => version.value === "unreleased" ? "Unreleased yet" : `Since v${version.value}`)
const title = computed(() => version.value === "unreleased" ? "This feature hasn't been released yet." : `You must run at least Avo v${version.value} to enjoy this feature.`)
</script>

<template>
  <a :href="href"
    target="_blank"
    :title="title"
    class="text-sm inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none bg-gray-500">
    <InformationCircleIcon class="h-4 inline mr-1" /> {{label}}
  </a>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  version: String,
})
const version = computed(() => {
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
const href = computed(() => `https://avohq.io/releases/${version.value}`)
const title = computed(() => `Avo version ${version.value} – Ruby on Rails admin panel framework.`)
</script>

<template>
  <a :href="href"
    target="_blank"
    :title="title"
    class="">
    {{version}}
  </a>
</template>

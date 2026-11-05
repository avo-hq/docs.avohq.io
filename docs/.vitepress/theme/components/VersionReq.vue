<script setup>
import {computed} from 'vue'

const props = defineProps({
  // Every gem has its own version numbers, so a bare version doesn't say whose it is.
  package: {type: String, default: 'avo'},
  version: String,
})
const version = computed(() => props.version || '2.0')
const fullVersion = computed(() => {
  if (!props.version) {
    return "2.0.0"
  }

  const matchesPatchVersion = props?.version?.toString()?.match(/\d*\.\d*\.\d*/g)
  if (matchesPatchVersion) {
    return props.version

  } else {
    return `${props.version}.0`
  }
})
const unreleased = computed(() => version.value === "unreleased")
const requirement = computed(() => `${props.package} >= v${version.value}`)
const href = computed(() => unreleased.value ? null : `https://avohq.io/releases/${props.package}/${fullVersion.value}`)
const title = computed(() => unreleased.value ? "This feature hasn't been released yet." : `You must run at least ${props.package} v${version.value} to enjoy this feature.`)
</script>

<template>
  <a :href="href"
    target="_blank"
    :title="title"
    class="version-req text-sm inline-flex items-center rounded !text-white !no-underline px-2 py-1 leading-none bg-gray-500">
    <InformationCircleIcon class="h-4 inline mr-1" />
    <span v-if="unreleased">Unreleased yet</span>
    <span v-else class="version-req__since">Since <code>{{ requirement }}</code></span>
  </a>
</template>

<style scoped>
.version-req__since {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.version-req code {
  padding: 1px 4px;
  color: inherit;
  background-color: rgb(255 255 255 / 0.18);
}
</style>

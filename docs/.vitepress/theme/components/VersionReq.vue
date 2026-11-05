<script setup>
import {computed} from 'vue'

const props = defineProps({
  // Left out on the 2.0 and 3.0 pages, where a bare version can be Avo's or a paid package's, such as avo-pro.
  package: String,
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
const namesPackage = computed(() => props.package && !unreleased.value)
const requirement = computed(() => `${props.package} >= v${version.value}`)
const href = computed(() => {
  if (unreleased.value) return null

  return `https://avohq.io/releases/${props.package ? `${props.package}/` : ""}${fullVersion.value}`
})
const label = computed(() => unreleased.value ? "Unreleased yet" : `Since v${version.value}`)
const title = computed(() => unreleased.value ? "This feature hasn't been released yet." : `You must run at least ${props.package || "Avo"} v${version.value} to enjoy this feature.`)
</script>

<template>
  <a :href="href"
    target="_blank"
    :title="title"
    class="version-req text-sm inline-flex items-center rounded !text-white !no-underline px-2 py-1 leading-none bg-gray-500">
    <InformationCircleIcon class="h-4 inline mr-1" />
    <span v-if="namesPackage" class="version-req__since">Since <code>{{ requirement }}</code></span>
    <template v-else>{{ label }}</template>
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

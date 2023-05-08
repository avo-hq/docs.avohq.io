<script setup>
import { onMounted, ref } from 'vue'
import { viewPath } from "./helpers";
import capitalize from 'lodash/capitalize'
const props = defineProps(['view'])

const path = ref("")
const prettyName = capitalize(props.view)

onMounted(() => {
  path.value = viewPath(window, props.view)
})
</script>

<template>
  <a :href="path"><code>{{prettyName}}</code></a>
</template>

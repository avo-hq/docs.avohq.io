<script setup>
import {computed} from 'vue'
import { InformationCircleIcon } from '@heroicons/vue/outline'

const props = defineProps({
  license: String,
  title: String,
})
const license = computed(() => props.license || 'community')
const links = {
  community: "https://avohq.io/pricing#comparison-heading",
  pro: "https://avohq.io/subscriptions/new?plan=2"
}
const labels = {
  community: "Community",
  pro: "Pro"
}
const href = computed(() => links[license.value])
const label = computed(() => labels[license.value])
</script>

<template>
  <a :href="href"
    target="_blank"
    :title="title"
    class="inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none"
    :class="{
      'bg-green-600 hover:bg-green-500': license == 'community',
      'bg-orange-600 hover:bg-orange-500': license == 'pro'
    }">
    <InformationCircleIcon class="h-4 inline mr-1" /> License: {{label}}
  </a>
</template>
<script setup>
import {computed} from 'vue'
import { BadgeCheckIcon } from '@heroicons/vue/outline'

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
    class="text-sm inline-flex items-center rounded !text-white no-underline px-2 py-1 leading-none"
    :class="{
      'bg-blue-500 hover:bg-blue-600': license == 'community',
      'bg-green-500 hover:bg-green-600': license == 'pro'
    }">
    <BadgeCheckIcon class="h-4 inline mr-1" /> License: {{label}}
  </a>
</template>

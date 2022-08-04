<script setup>
import {withBase} from 'vitepress'
const props = defineProps({
  type: {
    default: 'info',
    type: String
  },
  text: String,
  detailsLink: String,
  detailsLabel: {
    default: 'Details',
    type: String
  },
})
</script>

<template>
  <div class="rounded-md p-4" :class="{
      'bg-blue-50': type === 'info',
      'bg-orange-50': type === 'warning'
    }">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <!-- Heroicon name: solid/information-circle -->
        <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="{
            'text-blue-400': type === 'info',
            'text-orange-400': type === 'warning',
          }">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3 flex-1 md:flex md:items-center md:justify-between">
        <div class="text-sm text-blue-700" :class="{
            'text-blue-700': type === 'info',
            'text-orange-700': type === 'warning',
          }">
          <div v-if="text">{{text}}</div>
          <div v-else><slot /></div>
        </div>
        <div class="mt-3 text-sm md:mt-0 md:ml-6" v-if="detailsLink">
          <a :href="withBase(detailsLink)" class="whitespace-nowrap font-medium" :class="{
            '!text-blue-700 !hover:text-blue-600': type === 'info',
            '!text-orange-700 !hover:text-orange-600': type === 'warning',
          }">{{detailsLabel}} <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </div>
  </div>
</template>
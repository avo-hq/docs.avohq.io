<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

import VersionAlertBar from "./VersionAlertBar.vue"

const { page } = useData();

const showVersionAlertBar = computed(() => page.value.relativePath.includes('2.0'));
</script>

<template>
  <VersionAlertBar v-if="showVersionAlertBar" />
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

import VersionAlertBar from "./VersionAlertBar.vue"

const { page } = useData();

const showVersionAlertBar = computed(() => /^(2|3)\.0\//.test(page.value.relativePath));
</script>

<template>
  <VersionAlertBar v-if="showVersionAlertBar" />
</template>

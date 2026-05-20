<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

const target = '/4.0/appearance.html?from=branding'
const router = useRouter()

onMounted(() => {
  router.go(withBase(target))
})
</script>

<template>
  <p>
    Redirecting to <a :href="target">Appearance</a>…
  </p>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  frontmatter: String,
})

const { frontmatter } = useData()
const feedbackId = computed(() => frontmatter.value.feedbackId)
const license = computed(() => frontmatter.value.license)
const version = computed(() => frontmatter.value.version)
const demoVideo = computed(() => frontmatter.value.demoVideo)
const betaStatus = computed(() => frontmatter.value.betaStatus)

console.log('id, license, version, demoVideo, betaStatus->', feedbackId.value, license.value, version.value, demoVideo.value, betaStatus.value)
const shoudHide = computed(() => [feedbackId, license, version, demoVideo, betaStatus].every((i) => i.value === undefined))
</script>

<template>
  <div class="grid grid-cols-2 gap-2 mb-6" v-if="!shoudHide">
    <VersionReq :version="version" v-if="version" />
    <FeedbackPill :feedback-id="feedbackId" v-if="feedbackId" />
    <LicenseReq :license="license" v-if="license" />
    <DemoVideo :demo-video="demoVideo" v-if="demoVideo" />
    <BetaStatus :label="betaStatus" v-if="betaStatus" />
  </div>
</template>
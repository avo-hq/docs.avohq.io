<script setup>
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  frontmatter: String,
})

const { frontmatter, page } = useData()
const feedbackId = computed(() => frontmatter.value.feedbackId)
const license = computed(() => frontmatter.value.license)
const version = computed(() => frontmatter.value.version)
const demoVideo = computed(() => frontmatter.value.demoVideo)
const demo = computed(() => frontmatter.value.demo)
const betaStatus = computed(() => frontmatter.value.betaStatus)
const add_on = computed(() => frontmatter.value.add_on)

const shouldHide = computed(() => [feedbackId, license, version, demoVideo, demo, betaStatus].every((i) => i.value === undefined))
</script>

<template>
  <div class="grid grid-cols-2 gap-2 mb-6" v-if="!shouldHide">
    <VersionReq :version="version" v-if="version" />
    <FeedbackPill :feedback-id="feedbackId" v-if="feedbackId" />
    <LicenseReq :license="license" :add_on="add_on" v-if="license" />
    <DemoVideo :demo-video="demoVideo" v-if="demoVideo" />
    <Demo :link="demo" v-if="demo" />
    <BetaStatus :label="betaStatus" v-if="betaStatus" />
  </div>
  <div class="hidden">
    {{ page.title }} - {{ page.relativePath }}
  </div>
</template>

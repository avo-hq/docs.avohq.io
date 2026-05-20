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
const api = computed(() => frontmatter.value.api)
const guide = computed(() => frontmatter.value.guide)

const shouldHide = computed(() => [feedbackId, license, version, demoVideo, demo, betaStatus, api, guide].every((i) => i.value === undefined))
</script>

<template>
  <div class="grid grid-cols-2 gap-2 mb-6" v-if="!shouldHide">
    <VersionReq :version="version" v-if="version" />
    <FeedbackPill :feedback-id="feedbackId" v-if="feedbackId" />
    <LicenseReq :license="license" :add_on="add_on" v-if="license" />
    <DemoVideo :demo-video="demoVideo" v-if="demoVideo" />
    <Demo :link="demo" v-if="demo" />
    <BetaStatus :label="betaStatus" v-if="betaStatus" />
    <a v-if="api" :href="api" class="page-header-link" title="View the per-option API reference">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 inline mr-1" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      See API
    </a>
    <a v-if="guide" :href="guide" class="page-header-link" title="See the guides">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 inline mr-1" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      See the guides
    </a>
  </div>
  <div class="hidden">
    {{ page.title }} - {{ page.relativePath }}
  </div>
</template>

<style scoped>
.page-header-link {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  line-height: 1;
  text-decoration: none !important;
  background-color: rgb(55 65 81);
  color: rgb(255 255 255) !important;
}

.page-header-link:hover {
  background-color: rgb(31 41 55);
}
</style>

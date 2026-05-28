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
const add_on_link = computed(() => frontmatter.value.add_on_link)
const apiDocs = computed(() => frontmatter.value.api_docs)
const guide = computed(() => frontmatter.value.guide)

const shouldHide = computed(() => [feedbackId, license, version, demoVideo, demo, betaStatus].every((i) => i.value === undefined))
</script>

<template>
  <div class="grid grid-cols-2 gap-2 mb-6" v-if="!shouldHide">
    <VersionReq :version="version" v-if="version" />
    <FeedbackPill :feedback-id="feedbackId" v-if="feedbackId" />
    <LicenseReq :license="license" :add_on="add_on" :add_on_link="add_on_link" v-if="license" />
    <DemoVideo :demo-video="demoVideo" v-if="demoVideo" />
    <Demo :link="demo" v-if="demo" />
    <BetaStatus :label="betaStatus" v-if="betaStatus" />
  </div>
  <a v-if="apiDocs" :href="apiDocs" class="api-docs-callout" title="View the per-option API reference">
    <div class="api-docs-callout__icon" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    </div>
    <div class="api-docs-callout__body">
      <span class="api-docs-callout__title">Looking for every option?</span>
      <span class="api-docs-callout__subtitle">See the full API reference &rarr;</span>
    </div>
  </a>
  <a v-if="guide" :href="guide" class="api-docs-callout api-docs-callout--back" title="See the guides">
    <div class="api-docs-callout__icon" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </div>
    <div class="api-docs-callout__body">
      <span class="api-docs-callout__title">Task-oriented docs and worked examples</span>
      <span class="api-docs-callout__subtitle">&larr; See the guides</span>
    </div>
  </a>
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

.api-docs-callout {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin: 0 0 1.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 0.375rem;
  background-color: color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
  color: var(--vp-c-text-1) !important;
  text-decoration: none !important;
  transition: background-color 0.15s ease;
}

.api-docs-callout:hover {
  background-color: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
}

.api-docs-callout__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  background-color: var(--vp-c-brand-1);
  color: white;
}

.api-docs-callout__icon svg {
  width: 0.875rem;
  height: 0.875rem;
}

.api-docs-callout__body {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  line-height: 1.3;
}

.api-docs-callout__title {
  font-weight: 600;
}

.api-docs-callout__subtitle {
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
}
</style>

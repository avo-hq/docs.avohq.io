<script setup>
import { computed } from "vue"
import { useData } from "vitepress"

const { site, page } = useData()

function findFieldTypesItems(sidebar) {
  for (const section of sidebar ?? []) {
    if (section.text === "Field types" && section.items) return section.items
    for (const item of section.items ?? []) {
      if (item.text === "Field types" && item.items) return item.items
    }
  }
  return []
}

const fields = computed(() => {
  const version = page.value.relativePath.split("/")[0] || "4.0"
  const sidebar = site.value.themeConfig.sidebar[`/${version}/`] ?? []
  return findFieldTypesItems(sidebar).map((item) => ({
    text: item.text,
    link: item.link.replace(/\.md$/, ".html"),
  }))
})
</script>

<template>
  <ul>
    <li v-for="field in fields" :key="field.link">
      <a :href="field.link">{{ field.text }}</a>
    </li>
  </ul>
</template>

<script setup>
import { computed } from "vue"
import { useData } from "vitepress"

const { page, site } = useData()

// Render the items of the "Internals" sidebar group so this list stays in sync
// with the nav automatically — new pages added to the group show up here.
const items = computed(() => {
  const version = page.value.relativePath.split("/")[0] || "4.0"
  const sidebar = site.value.themeConfig.sidebar[`/${version}/`] || []
  const group = sidebar.find((g) => g.text === "Internals")
  if (!group) return []

  const self = "/" + page.value.relativePath.replace(/\.md$/, ".html")
  // Drop the group's own "Overview" entry, which links back to this page.
  return (group.items || []).filter((item) => item.link !== self)
})
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.text || item.link">
      <a v-if="item.link" :href="item.link" v-html="item.text"></a>
      <span v-else v-html="item.text"></span>
      <ul v-if="item.items && item.items.length">
        <li v-for="child in item.items" :key="child.link">
          <a :href="child.link" v-html="child.text"></a>
        </li>
      </ul>
    </li>
  </ul>
</template>

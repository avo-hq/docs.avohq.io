<script setup>
import { computed } from "vue"
import { useData } from "vitepress"
import { data } from "./../../fieldTypes.data.js"

const { page } = useData()

const fields = computed(() => {
  const version = page.value.relativePath.split("/")[0] || "4.0"
  return data[version] ?? data["4.0"]
})
</script>

<template>
  <table tabindex="0">
    <thead>
      <tr>
        <th>Field</th>
        <th>Description</th>
        <th>Tags</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="field in fields" :key="field.link">
        <td class="whitespace-nowrap">
          <a :href="field.link">{{ field.text }}</a>
          <span
            v-if="field.betaStatus"
            class="VPBadge"
            :class="field.betaStatus === 'Deprecated' ? 'danger' : 'warning'"
          >{{ field.betaStatus }}</span>
        </td>
        <td>{{ field.description }}</td>
        <td>
          <span v-for="tag in field.tags" :key="tag" class="VPBadge info field-tag">{{ tag }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.field-tag {
  margin-right: 4px;
  white-space: nowrap;
}
</style>

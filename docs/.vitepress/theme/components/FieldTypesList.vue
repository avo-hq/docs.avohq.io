
<script setup>
  import {useData} from 'vitepress'
  const {site} = useData()
  const fields = site.value.themeConfig.sidebar['/3.0/']
    .find((item) => item.text === 'Field types')
    .items
    .map((item) => ({
      text: item.text,
      link: item.link.replace('.md', '.html')
    }))
</script>

<template>
  <ul>
    <li v-for="field in fields">
      <a :href="field.link">
        {{field.text}}
        </a>
    </li>
</ul>
</template>
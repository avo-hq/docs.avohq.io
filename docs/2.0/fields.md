---
feedbackId: 834
---

# Fields

<script setup>
  import {useData} from 'vitepress'
  const {site} = useData()
  const fields = site.value.themeConfig.sidebar['/2.0/']
    .find((item) => item.text === 'Fields')
    .items
    .map((item) => ({
      text: item.text,
      link: item.link.replace('.md', '.html')
    }))
</script>

<ul>
  <li v-for="field in fields">
    <a :href="field.link">{{field.text}}</a>
  </li>
</ul>

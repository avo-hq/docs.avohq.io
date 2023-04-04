<script setup>
import { useData } from 'vitepress'
// import page from './../allData.js'

const data = useData()

const recursivelyGetItemsFromSidebar = (items) => {
  const result = []
  // console.log(items)
  items.forEach((item) => {
    if (item.items) {
      item.items
        result.push(recursivelyGetItemsFromSidebar(item.items))
      // item.items.forEach((i) => {
      //   // result.push(recursivelyGetItemsFromSidebar(i))
      // })
    } else {
      result.push(item.link)
    }
  })

  return result
}

const sidebar = data.site.value.themeConfig.sidebar['/2.0/']
const result = recursivelyGetItemsFromSidebar(sidebar).flat(Infinity)

</script>

<template>
    <!-- <template>
      <h1>{{ theme.footer.copyright }}</h1>
    </template> -->

    <pre>
    {{page}}
    {{result}}
    {{sidebar}}

    </pre>123
</template>


<script setup>
  import { data } from './../../../.vitepress/recipes.data.js'

  // add guides written on the blog
  const articles = [{
    title: "Override the field method to add default values to field options",
    link: "https://avohq.io/blog/override-the-field-method-to-add-default-values-to-field-options"
  }]
</script>

<template>
  <ul>
    <li v-for="recipe in data.v3"><a :href="recipe.link">{{recipe.text.replace('avo ', 'Avo ').replace('urls', 'URLs')}}</a></li>
    <li v-for="guide in articles">
      <a :href="guide.link" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 h-4 inline mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
        {{guide.title}}
      </a>
    </li>
  </ul>
</template>

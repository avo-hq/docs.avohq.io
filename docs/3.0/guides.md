# Guides

These are various guides on how to build some things with Avo or how to integrate with different pieces of tech.
Some guides have been written by us, and some by our community members.

<script setup>
  import { data } from './../.vitepress/recipes.data.js'
</script>

<ul>
  <li v-for="recipe in data.v3"><a :href="recipe.link">{{recipe.text.replace('avo ', 'Avo ')}}</a></li>
</ul>

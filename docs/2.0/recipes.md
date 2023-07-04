# Recipes & guides for Avo 2

These guides have been submitted by our community members.

<script setup>
  import { data } from './../.vitepress/recipes.data.js'
</script>

<h3 v-for="recipe in data.v2"><a :href="recipe.link">{{recipe.text}}</a></h3>

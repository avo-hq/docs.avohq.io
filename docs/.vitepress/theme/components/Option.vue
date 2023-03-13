<script>
export default {
  props: ['name'],
  setup(props, {slots}) {
    const name = (props.name || "");
    const anchor = name.replace(/\?|{|}|!/g, '')
    const anchorName = `#${anchor}`

    // expose to template and other options API hooks
    return {
      name,
      anchor,
      anchorName
    }
  },
}
</script>

<template>
  <h2 :id="anchor" tabindex="-1"><code><span class="hidden">-> </span><span v-html="name" /></code><a class="header-anchor" :href="anchorName" aria-hidden="true">#</a></h2>
  <div class="pl-8">
    <slot></slot>
  </div>
</template>

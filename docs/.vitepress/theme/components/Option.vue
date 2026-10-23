<script>
export default {
  props: ['name', 'since', 'headingSize', 'id'],
  setup(props) {
    const name = props.name || ""
    const anchor = props.id || name.replace(/\?|{|}|!|`/g, '')

    return {
      // Backticked segments render as inline code, the way a markdown heading does.
      html: name.replace(/`([^`]+)`/g, '<code>$1</code>'),
      anchor,
      anchorName: `#${anchor}`,
      headingSize: props.headingSize || 2,
    }
  },
}
</script>

<template>
  <component :is="`h${headingSize}`" :id="anchor" tabindex="-1">
    <span class="hidden">-> </span>
    <span v-html="html" />
    <a class="header-anchor" :href="anchorName" aria-hidden="true"></a>
  </component>
  <div class="pl-8">
    <slot></slot>
  </div>
</template>

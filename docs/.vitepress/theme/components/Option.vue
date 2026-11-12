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
      // VitePress slugifies the hash of markdown links: `#self.icon` arrives as `#self-icon`, `#1-x` as `#_1-x`.
      // The heading keeps its original id for URLs already shared.
      slug: anchor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/^(\d)/, '_$1'),
      headingSize: props.headingSize || 2,
    }
  },
}
</script>

<template>
  <component :is="`h${headingSize}`" :id="anchor" tabindex="-1">
    <span v-if="slug !== anchor" :id="slug" class="option-anchor"></span>
    <span class="hidden">-> </span>
    <span v-html="html" />
    <a class="header-anchor" :href="anchorName" aria-hidden="true"></a>
  </component>
  <div class="pl-8">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['name', 'since', 'headingSize'],
  setup(props, { slots }) {
    let name = (props.name || "")
    // let since = (props.since || "")
    const isCode = name.includes('`')
    name = name.replace(/`/g, '');
    // const prettyName =
    const anchor = name.replace(/\?|{|}|!|`/g, '')
    const anchorName = `#${anchor}`

    // expose to template and other options API hooks
    return {
      name,
      // since,
      isCode,
      anchor,
      anchorName,
      headingSize: props.headingSize || 2,
    }
  },
}
</script>

<template>
  <component :is="`h${headingSize}`"
    :id="anchor"
    tabindex="-1"
    :class="{'!text-lg': !isCode}"
  >
    <code v-if="isCode">
      <span class="hidden">-> </span>
      <span v-html="name" />
    </code>
    <div v-else>
      <span class="hidden">-> </span>
      <span v-html="name" />
    </div>
    <a class="header-anchor" :href="anchorName" aria-hidden="true"></a>
    <!-- <span v-if="since" class="text-sm text-gray-500 ml-2 on-outline:hidden">Since <Version version="3.10" /></span> -->
  </component>
  <div class="pl-8">
    <slot></slot>
  </div>
</template>

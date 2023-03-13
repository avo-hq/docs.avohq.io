<script>
import { ref, defineProps } from 'vue'
import { useData } from "vitepress";

// TODO: work in progress

export default {
  props: ['name'],
  setup(props, {slots}) {
    const count = ref(0)
    // const props = defineProps({
    //   name: String,
    // });
    const d = useData();
    console.log('d.page.value.headers->', d.page.value.headers)

    // d.page.value = {
    //   ...d.page.value,
    //   headers: [
    //     ...d.page.value.headers,
    //     {
    //       level: 2,
    //       title: 'lalala',
    //       slug: 'lslsls',
    //       link: '#lslsls',
    //     }
    //   ]
    // }
    // d.page.value.headers = [
    //   // ...d.page.value,
    //   // headers: [
    //     ...d.page.value.headers,
    //     {
    //       level: 2,
    //       title: 'lalala',
    //       slug: 'lslsls',
    //       link: '#lslsls',
    //     }
    //   // ]
    //   ]
    // console.log('d.page.value.headers->', d.page.value.headers)

    // d.page.value.headers.push({
    //   level: 1,
    //   title: 'lalala',
    //   link: '#lslsls',
    // })
    console.log('props->', props)
    console.log('slots->', slots.default())
    // const name = md.render(props.name || "");
    const name = (props.name || "");
    const anchorName = `#${name}`

    // expose to template and other options API hooks
    return {
      count,
      name,
      anchorName
    }
  },

  mounted() {
    console.log(this.name) // 0
  }
}
// console.log(this.$slots)
</script>

<template>

  <h2 id="heheh"><code v-html="name" /><a class="header-anchor" :href="anchorName" aria-hidden="true">#</a></h2>
  11
  name: {{ name }}
  title: {{ title }}
  <slot></slot>
  2
</template>

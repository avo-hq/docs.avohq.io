---
layout: home
markdownStyles: false

title: Avo documentation
titleTemplate: Build your company's command center on Rails
---

<script setup>
import { onMounted } from 'vue'

// Easter egg: clicking the hero eyebrow 5 times jumps to the (unlinked) Contributing section.
onMounted(() => {
  const name = document.querySelector('.grove-home__eyebrow')
  if (!name) return
  name.style.cursor = 'default'

  let count = 0
  let timer = null
  name.addEventListener('click', () => {
    count += 1
    clearTimeout(timer)
    if (count >= 5) {
      count = 0
      window.location.href = '/contributing/'
      return
    }
    // Reset the streak if the next click doesn't land within 1.5s.
    timer = setTimeout(() => { count = 0 }, 1500)
  })
})
</script>

<GroveHome />

<div class="container-md max-w-[64rem] mx-auto mt-16 px-6">
<!-- @include: ./2.0/common/sponsors_common.md-->
</div>

<script setup>
// Filters the upgrade timeline by gem. Each entry is an h2 with data-gems="avo avo-api";
// an entry runs from its h2 to the next one. The selection lives in ?gems= so it can be shared.
import { ref, onMounted, onUnmounted, watch } from 'vue'

const gems = ref([])
const selected = ref([])
const shown = ref(0)
let entries = []
let since = null // { at: index of the reader's release, marker, label }

const style = typeof document !== 'undefined' ? document.createElement('style') : null

function apply() {
  const on = selected.value
  const hidden = []
  for (const { h2, nodes, gems: g } of entries) {
    const show = !on.length || g.some((x) => on.includes(x))
    for (const n of [h2, ...nodes]) n.style.display = show ? '' : 'none'
    if (!show) hidden.push(h2.id)
  }
  shown.value = entries.length - hidden.length
  if (since) {
    const newer = entries.slice(0, since.at).filter((e) => !hidden.includes(e.h2.id)).length
    since.marker.textContent = `You're here: ${since.label}. The ${newer} ${newer === 1 ? 'entry' : 'entries'} above ${newer === 1 ? 'is' : 'are'} newer. Work up from here.`
  }
  // The outline is rendered by VitePress; hide its rows with CSS instead of touching its state.
  style.textContent = hidden.map((id) => `.VPDocAsideOutline li:has(> a[href="#${CSS.escape(id)}"])`).join(',') + (hidden.length ? '{display:none}' : '')
  const url = new URL(location.href)
  on.length ? url.searchParams.set('gems', on.join(',')) : url.searchParams.delete('gems')
  history.replaceState(history.state, '', url)
}

function toggle(gem) {
  selected.value = selected.value.includes(gem) ? selected.value.filter((g) => g !== gem) : [...selected.value, gem]
}


onMounted(() => {
  document.head.appendChild(style)
  for (const h2 of document.querySelectorAll('.vp-doc h2[data-gems]')) {
    const nodes = []
    for (let n = h2.nextElementSibling; n && n.tagName !== 'H2'; n = n.nextElementSibling) nodes.push(n)
    entries.push({ h2, nodes, gems: h2.dataset.gems.split(' ') })
  }
  gems.value = [...new Set(entries.flatMap((e) => e.gems))].sort((a, b) => (a === 'avo' ? -1 : b === 'avo' ? 1 : a.localeCompare(b)))
  const params = new URL(location.href).searchParams
  selected.value = (params.get('gems') || '').split(',').filter((g) => gems.value.includes(g))
  markSince(params.get('since'))
  apply()
})

// ?since=2026-10-14 or ?since=avo@4.3.2 — the release you're on. Draws a "you are here" line
// above the first entry at or before it and scrolls there; everything above the line is newer.
function markSince(param) {
  if (!param) return
  let date = /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : null
  if (!date && param.includes('@')) {
    const [gem, version] = param.split('@')
    date = entries.find((e) => e.gems.includes(gem) && e.h2.dataset.version === version)?.h2.dataset.date
  }
  if (!date) return
  const mine = entries.find((e) => e.h2.dataset.date && e.h2.dataset.date <= date)
  const marker = document.createElement('div')
  marker.className = 'since-marker'
  since = { at: mine ? entries.indexOf(mine) : entries.length, marker, label: param.includes('@') ? param.replace('@', ' ') : 'releases up to ' + date }
  const anchor = mine ? mine.h2 : entries.at(-1).nodes.at(-1)?.nextSibling
  anchor ? anchor.before(marker) : document.querySelector('.vp-doc > div').append(marker)
  requestAnimationFrame(() => window.scrollTo({ top: marker.getBoundingClientRect().top + window.scrollY - 96 }))
}

watch(selected, apply)
onUnmounted(() => style.remove())
</script>

<template>
  <div class="upgrade-filter">
    <div class="label">Show entries for <span class="count">({{ shown }} shown)</span></div>
    <div class="chips">
      <button :class="{ on: !selected.length }" @click="selected = []">All gems</button>
      <button v-for="gem in gems" :key="gem" :class="{ on: selected.includes(gem) }" @click="toggle(gem)">{{ gem }}</button>
    </div>
  </div>
</template>

<style scoped>
.upgrade-filter { margin: 16px 0 24px; }
.label { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.count { font-weight: 400; color: var(--vp-c-text-3); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
button {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
button:hover { border-color: var(--vp-c-brand-1); }
button.on { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
</style>

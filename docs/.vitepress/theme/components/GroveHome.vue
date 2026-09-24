<script setup>
// The docs homepage, in the grove style of avohq.io (docs/visual-blueprint.md
// in the avohq.io repo): the nursery scene as a compact full-bleed band, the
// copy on a paper ellipse to its left, and three ways in below it.
// The scene's prompt sits next to it in public/img/grove/.
const paths = [
  {
    href: "/4.0/",
    eyebrow: "New to Avo",
    title: "Get your first resource running",
    body: "Add the gem, describe one model in a few lines of Ruby, and your team can browse, search and edit its records the same afternoon.",
    cta: "Getting started",
  },
  {
    href: "/4.0/agentic-engineering.html",
    eyebrow: "Building with agents",
    title: "Hand your agents the manual",
    body: "Point Claude Code, Cursor or your agent of choice at the docs map and the skills that ship inside the gem, pinned to the version you run.",
    cta: "Set up your agent",
  },
  {
    href: "/4.0/ai-overview.html",
    eyebrow: "AI for your team",
    title: "Let your team ask the app",
    body: "Support, ops and finance ask in plain words, from the chat bar or their own AI client over MCP. They see only what their permissions allow, and nothing changes unless a person said it could.",
    cta: "AI in your Avo app",
  },
]
</script>

<template>
  <section class="grove-home">
    <div class="grove-home__scenery" aria-hidden="true">
      <img class="grove-home__scene" src="/img/grove/nursery.webp" alt="" width="1536" height="1024" fetchpriority="high">
    </div>

    <div class="grove-home__copy">
      <p class="grove-home__eyebrow">Avo documentation</p>
      <h1 class="grove-home__title">Build the app your team <em>runs the business from</em>.</h1>
      <a class="grove-home__tag" href="/4.0/agentic-engineering.html">Yes, your agents can read these too.</a>
      <p class="grove-home__lead">
        With Avo, your Rails app is your company's command center. Describe your data in a few Ruby files and
        your team gets the screens, actions, dashboards and search they run the day from. Your policies decide
        who sees what, in the app and everywhere your agents reach it.
      </p>
      <div class="grove-home__actions">
        <a class="grove-home__button" href="/4.0/">Start with Avo 4</a>
        <a class="grove-home__link" href="https://github.com/avo-hq/avo">Star it on GitHub</a>
      </div>
      <p class="grove-home__proof">Still on Avo 3? <a href="/3.0/">Its docs are here</a>.</p>
    </div>
  </section>

  <section class="grove-paths" aria-label="Where to start">
    <a v-for="path in paths" :key="path.href" class="grove-paths__card" :href="path.href">
      <span class="grove-paths__eyebrow">{{ path.eyebrow }}</span>
      <span class="grove-paths__title">{{ path.title }}</span>
      <span class="grove-paths__body">{{ path.body }}</span>
      <span class="grove-paths__cta">{{ path.cta }} <span aria-hidden="true">→</span></span>
    </a>
  </section>
</template>

<style scoped>
.grove-home {
  --paper: 246, 249, 252;
  --ink: #16181b;
  --ink-soft: #3f454d;
  --ink-mute: #5e646e;
  --accent: #0886de;
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: clamp(30rem, 38vw, 44rem);
  padding: 3rem max(1.5rem, 50% - 38rem);
  background: #e6eef4;
  color: var(--ink);
  overflow: hidden;
}
.grove-home__scenery {
  position: absolute;
  inset: 0;
  z-index: -1;
}
/* Paper behind the copy, leaning left and away from Avo at the bench. */
.grove-home__scenery::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(
    ellipse 38rem 24rem at max(50% - 22rem, 14rem) 52%,
    rgba(var(--paper), 0.96) 0%,
    rgba(var(--paper), 0.9) 50%,
    rgba(var(--paper), 0.55) 78%,
    rgba(var(--paper), 0) 100%
  );
}
.grove-home__scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 80%;
}
.grove-home__copy {
  max-width: 34rem;
}
.grove-home__eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.grove-home__title {
  margin-top: 0.5rem;
  font-family: "Bricolage Grotesque", var(--vp-font-family-base);
  font-size: clamp(2.1rem, 3.4vw, 3.4rem);
  font-weight: 700;
  line-height: 1.04;
  letter-spacing: -0.03em;
  text-wrap: balance;
}
.grove-home__title em {
  font-style: normal;
  color: var(--accent);
}
/* A cream paper tag, pinned a little off level. The site's homepage tag hangs on strings;
   this one is only pinned, since the docs are a reference, not a show. */
.grove-home__tag {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.35rem 0.75rem 0.35rem 1.6rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
  background:
    radial-gradient(circle at 0.8rem 50%, #c9bfae 0 0.2rem, transparent 0.22rem),
    #fbf5e8;
  border-radius: 0.25rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 4px 10px -4px rgba(22, 24, 27, 0.25);
  transform: rotate(-1.5deg);
  transition: transform 0.2s ease;
}
.grove-home__tag:hover,
.grove-home__tag:focus-visible {
  transform: rotate(0deg);
}
.grove-home__lead {
  margin-top: 1rem;
  max-width: 52ch;
  font-size: clamp(0.98rem, 1.1vw, 1.08rem);
  line-height: 1.65;
  color: var(--ink-soft);
  text-wrap: pretty;
}
.grove-home__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
  margin-top: 1.5rem;
}
.grove-home__button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 1.25rem;
  border-radius: 0.5rem;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.grove-home__button:hover {
  background: #0672bd;
}
.grove-home__link {
  color: var(--ink);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: rgba(22, 24, 27, 0.3);
  text-underline-offset: 0.2em;
}
.grove-home__link:hover {
  text-decoration-color: currentColor;
}
.grove-home__proof {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--ink-mute);
}
.grove-home__proof a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
.grove-home a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

/* Phones: the copy goes on plain paper and the scene becomes a strip under it,
   framed on Avo at the bench, so the copy never covers the subject. */
@media (max-width: 639.98px) {
  .grove-home {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    padding: 2rem 1rem 0;
    background: rgb(var(--paper));
  }
  .grove-home__scenery {
    position: relative;
    order: 2;
    z-index: 0;
    height: 15rem;
    margin: 1.5rem -1rem 0;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 2.5rem);
    mask-image: linear-gradient(180deg, transparent 0, #000 2.5rem);
  }
  .grove-home__scenery::before {
    display: none;
  }
  .grove-home__scene {
    object-position: 72% 85%;
  }
}

/* Dark: the same scene at dusk-dim, a navy paper behind the copy. */
.dark .grove-home {
  --paper: 15, 27, 45;
  --ink: #f4f6f8;
  --ink-soft: #c9d1db;
  --ink-mute: #9aa6b4;
  --accent: #6cc0f5;
  background: #0f1b2d;
}
.dark .grove-home__scene {
  filter: brightness(0.72) saturate(0.9);
}
.dark .grove-home__tag {
  color: #16181b;
}
.dark .grove-home__button {
  background: #fff;
  color: #0f1b2d;
}
.dark .grove-home__button:hover {
  background: #e6eef4;
}
.dark .grove-home__link {
  text-decoration-color: rgba(244, 246, 248, 0.35);
}

.grove-paths {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
  max-width: 76rem;
  margin: 3rem auto 0;
  padding: 0 1.5rem;
}
.grove-paths__card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: border-color 0.2s ease;
}
.grove-paths__card:hover,
.grove-paths__card:focus-visible {
  border-color: var(--vp-c-brand-1);
}
.grove-paths__card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.grove-paths__eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
.grove-paths__title {
  font-family: "Bricolage Grotesque", var(--vp-font-family-base);
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}
.grove-paths__body {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.grove-paths__cta {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
@media (max-width: 639.98px) {
  .grove-paths {
    margin-top: 2rem;
    padding: 0 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .grove-home__tag,
  .grove-home__button,
  .grove-paths__card {
    transition: none;
  }
}
</style>

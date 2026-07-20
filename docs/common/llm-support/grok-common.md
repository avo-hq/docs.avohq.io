---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/grok.webp" alt="Grok" class="no-border h-8 -mt-2 inline-block self-center"> Grok

Setup Grok to correctly generate Avo code based on your prompt.

## Quick use

Paste the docs link before your prompt in a normal chat and Grok will fetch the page (no DeepSearch needed — that's a multi-step research agent, overkill for reading one file):

<CustomCode :content="$frontmatter.llmLink" />

For example:

<CustomCode :content="`${$frontmatter.llmLink} create an Avo resource for a product model`" />

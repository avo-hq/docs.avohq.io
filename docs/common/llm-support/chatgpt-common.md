---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/chatgpt.webp" alt="ChatGPT" class="no-border h-8 -mt-2 inline-block self-center"> ChatGPT

Setup ChatGPT to correctly generate Avo code based on your prompt.

## Quick use

ChatGPT searches the web automatically. Add this before your prompt (if it doesn't fetch the page, force web search from the tools menu in the message composer):

<CustomCode :content="$frontmatter.llmLink" />

For example:

<CustomCode :content="`${$frontmatter.llmLink} create an Avo resource for a product model`" />

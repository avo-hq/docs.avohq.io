---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/amp.webp" alt="Amp" class="no-border h-8 -mt-2 inline-block self-center"> Amp

Setup [Amp](https://ampcode.com/) to correctly generate Avo code based on your prompt.

## Quick use

Paste the docs link in your prompt and ask Amp to read it before generating code.

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Permanent setup

Amp reads the `AGENTS.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `AGENTS.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

## Skills

For Avo 4 apps, run `rails g avo:skills` and choose `.agents/skills` to install the Avo skills loader where Amp can find it. See [Skills](/4.0/agentic-engineering.html#skills) for the full setup.

## MCP server

Connect the [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) so Amp can query Avo's docs while building features.

Run this command to add it to your local Amp CLI:

<CustomCode content="amp mcp add context7 -- npx -y @upstash/context7-mcp" />

If you use Amp in an orb, configure the server in the repository or in Amp's MCP settings instead. See [Amp's MCP documentation](https://ampcode.com/docs/customize/mcp) for those options.

Now you can ask Amp anything about Avo, and write `use context7` at the end of your prompt.

For example:

```text
create a new Avo resource for a product model. use context7
```

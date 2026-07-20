# Code editors and LLM setup

Use <code><a :href="$frontmatter.llmLink" target="_blank">{{$frontmatter.llmLink}}</a></code> to setup your LLM integration in Cursor, VSCode, and other code editors.

It's a map of every Avo docs page and its headings, with links, so AI can fetch the exact pages it needs to generate accurate Avo code based on your prompt.

<CustomCode :content="$frontmatter.llmLink" />

## Pick your tool

<EditorList :version="$params.version" />

<br>

> [!INFO] Thanks DaisyUI!
> We sourced most of these docs from [DaisyUI's excellent editors page](https://daisyui.com/docs/editor/)

---
license: community
betaStatus: Beta
outline: [2, 3]
---

# WebMCP

[WebMCP](https://developer.chrome.com/docs/ai/webmcp) is the web standard that lets a page hand structured tools to the AI agent running in the visitor's **own browser** — Chrome's built-in agent, an extension, or anything else that reads `document.modelContext`. Instead of guessing which input is the title and where the save button is, the agent gets a named tool with a schema, fills it in, and the person reviews the result.

Avo supports it out of the box. There is no gem to install and nothing is sent anywhere: the agent runs in the browser, under the signed-in person's own session and permissions. Browsers without the API see the same pages with a few extra attributes.

:::info Not the same as the remote MCP server
WebMCP is browser-side, for the page a person has open. Connecting Claude or ChatGPT to your panel over HTTP is a different feature, the `avo-mcp_server` gem, and the in-app assistant is `avo-ai`. The three can be used together.
:::

:::warning Early standard
WebMCP ships in Chrome behind `chrome://flags/#enable-webmcp-testing` and as an origin trial from Chrome 149. The API is still moving, so what an agent sees may change between browser releases.
:::

## What Avo announces

### Every resource form

The new and edit forms are tools, named after the resource — `create_user`, `update_user`, `update_accounts_invoice`. The browser derives the parameters from the inputs (`user[first_name]`, `user[roles]`, …), and Avo fills each parameter's description from the field's label and help text, so the schema explains the form the way the page does.

Forms are **never auto-submitted**. The agent fills the form in; the person sees what changed and clicks Save — the same review step Avo's assistant gives its writes.

### `search_records`

Available on every page, so an agent can find a record before opening it:

| Parameter  | Meaning                                                                          |
| ---------- | -------------------------------------------------------------------------------- |
| `resource` | Which resource to search — an enum of the resources the viewer may index that define `self.search` |
| `q`        | The text to search for                                                           |

It returns the search endpoint's JSON: each hit's `_id`, `_label` and `_url`. The tool is read-only and marked as returning untrusted content (the labels are whatever people typed into the records).

Actions, filters and association attach forms are not announced yet.

## Turn it off

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.webmcp = {
    enabled: false
  }
end
```

That removes every announcement — the form attributes, the search tool, and any tool a plugin registers through Avo. To switch WebMCP off for the whole origin at the browser level, send the `Permissions-Policy: tools=()` header from your app.

## Add your own tools

Tools belong to a page. Under Turbo a Stimulus controller's `connect`/`disconnect` is exactly that lifecycle, and an `AbortSignal` passed at registration is what removes the tool, so both ways below are Stimulus-shaped.

### A read-only tool over a GET endpoint

No JavaScript needed. Render this wherever the tool applies — a custom tool page, a resource tool partial, a plugin view:

```erb
<div hidden data-controller="webmcp-tool"
  data-webmcp-tool-url-value="<%= root_path_without_url %>/avo_api/{resource}/search"
  data-webmcp-tool-definition-value="<%= {
    name: "search_records",
    description: "Search one resource's records by text.",
    inputSchema: {
      type: "object",
      properties: {
        resource: {type: "string", enum: %w[users posts]},
        q: {type: "string"}
      },
      required: %w[resource q]
    },
    annotations: {readOnlyHint: true}
  }.to_json %>"></div>
```

`{resource}` is filled from the tool's input; every other input goes on the query string. The response body comes back to the agent as text. Because it can only `GET`, whatever the endpoint authorizes is what the tool can see.

### Anything else, from your own Stimulus controller

```js
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.abortController = new AbortController()

    window.Avo.webmcp.registerTool({
      name: 'move_card',
      description: 'Move a card to another column of this board.',
      inputSchema: {
        type: 'object',
        properties: { card_id: { type: 'string' }, column_id: { type: 'string' } },
        required: ['card_id', 'column_id'],
      },
      // Return a string, a plain object, or a ready `{ content: [...] }`.
      execute: async ({ card_id, column_id }) => this.move(card_id, column_id),
    }, { signal: this.abortController.signal })
  }

  disconnect() {
    this.abortController?.abort()
  }
}
```

`registerTool` resolves to `false` — and registers nothing — when the browser has no WebMCP or `config.webmcp` is off, so the controller needs no feature detection of its own.

### Your own forms

A form is already a tool once its tag carries `toolname` and `tooldescription`. Add `data-controller="webmcp-form"` to get the label-derived parameter descriptions Avo's forms have.

## Guidelines

- Keep names under 30 characters and descriptions under 500; agents truncate past that.
- A tool that writes should leave the person a review step, as Avo's forms do.
- Return the least the agent needs. What a tool returns is model-facing text.
- Read through Avo's endpoints so the endpoint's authorization is the tool's — don't re-implement it in JavaScript.

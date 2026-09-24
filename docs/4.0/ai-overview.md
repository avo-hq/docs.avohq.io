---
outline: [2, 3]
---

# AI in your Avo app

Your team can ask the Avo app about your data in plain words: "which orders shipped late this week", "extend Ada's trial by three days". They get an answer, not a ticket in your queue. They can ask from the chat bar on every Avo page, or from Claude, ChatGPT or Cursor over MCP. Either way it runs inside your Rails app, as the person who asked, with that person's permissions.

This section is about AI your team uses. For coding agents that write Avo code with you, see [Agentic engineering](./agentic-engineering.html).

## Two ways in

| | [The chat](./ai.html) | [The MCP server](./mcp.html) |
| --- | --- | --- |
| Where your team asks | A chat bar on every Avo page, full-page chats, chats attached to a record | Their own AI client: Claude, ChatGPT, Cursor, anything that speaks remote MCP |
| Who it acts as | The signed-in user | The person who authorized the connection |
| Changes to records | Updates and deletes wait on a card until someone clicks **Confirm** | Off unless the person grants write access when they connect |
| Add-on | `avo-ai` | `avo-mcp_server`, with [Authorization](./authorization.html) |

Pick the chat when your team lives in the Avo app already. Pick MCP when they'd rather ask from the assistant they use all day. Nothing stops you running both.

## What holds on both

The same rules apply wherever the question comes from. You write them once, in the places you already have.

- **It sees what that person can see.** Every read and write goes through your [policies](./authorization.html) for the person asking, per resource and per field. A field you hide with [`visible:`](./field-options-api.html#visible) is hidden from their AI too. Change someone's permissions and it applies on their next question.
- **A person decides on changes.** In the chat, updates, deletes and action runs wait on a card for **Confirm**. Over MCP, the person chooses at connect time whether their client may write or run actions at all, and both start switched off.
- **Every change leaves a trail.** With [Audit Logging](./audit-logging.html), each write is recorded against the person it acted for, marked with where it came from. In the chat, most writes can be undone from the same card.
- **It runs inside your app.** The tools run in your Rails process, against your database. What leaves is what the model needs to answer: in the chat, the conversation with the provider you configured; over MCP, the results the person's own client asked for.

## Where to go next

- [The chat](./ai.html): install it, choose models, teach it your app, and decide who can do what.
- [What you can ask](./ai-what-you-can-ask.html): example requests your team can copy, from finding a record to importing a CSV. Good to hand to the people who'll use it.
- [Skills](./ai.html#attach-a-skill-with-a-message): saved instructions your team drops into a chat with `/`, such as "summarize as changelog" or "draft the refund email".
- [Agents and tools](./ai-agents-and-tools.html): reference for every tool the chat assistant can call.
- [The MCP server](./mcp.html): connect a client, choose what a connection can do, review and revoke connections.
- [MCP API](./mcp-api.html): reference for the MCP tools, scopes and error codes.

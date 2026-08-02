---
license: addon
betaStatus: Beta
outline: [2, 3]
---

# Agents and tools

Avo Intelligence is built from two kinds of pieces. **Agents** are the model-facing side: each one pairs a system prompt with a set of tools and drives a conversation with the provider. **Tools** are the Rails-facing side: typed abilities that run inside your application, against your policies, and report back to the model.

This page is the reference for both — which agents exist, what every tool does, and how conversations get their names. For the narrative of how a chat turn unfolds (inspect-first, confirmation cards, authorization), see [How the assistant works](./intelligence.html#how-the-assistant-works).

## The agents

### The chat agent

The chat agent powers every conversation — the floating bar, full-page chats, and chats attached to a record. On every message it rebuilds its system prompt from the ERB files under `app/prompts/` (which is what keeps the current date, signed-in user, and attached record fresh) and assembles its tool roster for the signed-in user who owns the chat.

The roster is built per run, not baked in: what the assistant can do in a conversation always reflects your current policies and configuration.

### The conversation renamer

A second, much smaller agent does exactly one job: reading a conversation's messages and giving the chat a short, specific title. It runs in the background, on the same model the conversation itself uses, and applies its title through the same rename tool the chat agent carries — so a generated title and a user-requested one take the same path to your database and screens.

It runs on three occasions:

- automatically, after the first message of a new conversation
- when you pick **Rename again with AI** from the chat page's menu
- when you ask the assistant to rename the conversation without giving it a name

## The tools

Tool names below are how calls appear in the Tool calls resource and in the chat's debug view (see [Debug levels](./intelligence.html#debug-levels)).

| Tool                         | What it does                                                                                                        | Writes apply      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `ask_user`                   | Asks you one clarifying question, optionally with clickable answer options, then ends the turn                       | —                 |
| `schema_inspector`           | Reports the database structure — scoped to the resources the signed-in user is allowed to see                        | read-only         |
| `resource_inspector`         | Reads one resource's real columns, associations, and scopes; unlocks querying and writing that resource              | read-only         |
| `active_record_query`        | Runs read-only, paginated, policy-scoped queries against a resource                                                  | read-only         |
| `active_storage_insights`    | Storage reports — totals, orphans, duplicates, growth, biggest files — and finding/showing files                     | read-only         |
| `active_storage_attachment`  | Attaches or detaches a Media Library blob on a record's attachment                                                   | immediately       |
| `create_record`              | Creates a record                                                                                                     | immediately       |
| `update_record`              | Changes a record's attributes                                                                                        | after you confirm |
| `delete_record`              | Deletes a record                                                                                                     | after you confirm |
| `run_action`                 | Lists the [actions](./actions.html) a resource registers, and proposes running one on the records you name           | after you confirm |
| `write_history`              | Lists the writes made earlier in the conversation and proposes undoing one                                           | after you confirm |
| `rename_conversation`        | Renames the current conversation — with your exact title, or by regenerating one                                     | immediately       |

"After you confirm" means the tool call produces a card describing the pending change; your click applies it, not the model. "Immediately" is reserved for actions that are reversible (a detached file can be re-attached, a conversation can be renamed again) or additive (creating a record).

### Where tools get their context

A tool only accepts from the model the arguments listed in its schema — a resource name, attributes, a title. Everything sensitive is injected server-side when the roster is built: the acting user and the current conversation are set on each tool instance in Ruby, and are not parameters the model can pass.

That is a deliberate security boundary. There is no argument the model could invent to act as a different user, and no id it could pass to rename or read a conversation other than the one it is speaking in. Combined with [authorization at the tool layer](./intelligence.html#how-the-assistant-works), it means a prompt-injection attempt riding in on your data has no lever to reach beyond what the chat's owner could already do in the Avo UI.

### The inspection gate

The query and write tools refuse to touch a resource until `resource_inspector` has run for it in the conversation. The gate is enforced in the tools — not merely requested in the prompt — and is what makes the assistant work from your real columns and scopes instead of guessed ones.

`run_action` sits behind the same gate, and adds two of its own: the resource's `act_on?` policy method and the action's `self.authorize` block, both checked when the run is proposed and again when you confirm it. See [What it's allowed to run](./intelligence.html#what-it-s-allowed-to-run).

## Renaming conversations

A new conversation starts without a name and gets one automatically after your first message — the renamer reads the opening of the conversation and titles it.

After that, renaming is a chat feature like any other:

- **"rename this conversation to 'Q3 invoices'"** — the assistant passes your exact wording to `rename_conversation` and the title applies immediately.
- **"rename this conversation"** — with no name given, the assistant triggers the renamer agent instead of inventing a title itself. The regenerated title reflects where the conversation actually went, not just how it started.
- **Rename again with AI** in the chat page's menu does the same regeneration without involving the assistant.

Wherever the conversation's name is on screen, it updates live when a rename lands — the chat's tab in the floating bar, the breadcrumb on its full-page view, and the title, name field, and breadcrumb on its resource page.

:::info
Titles are generated by the conversation's own model. If that model doesn't support tool calling, the renamer falls back to reading the title from the model's plain-text reply — renaming keeps working, the mechanics just degrade gracefully.
:::

## Seeing a conversation's roster

The Chats resource's show page has an **Agent tools** field listing exactly the tools the assistant will get on that conversation's next run. It's computed live — owner-scoped and model-aware — so it's the quickest way to see the effect of a policy change, or why a roster is empty (some provider/model combinations reject tools while extended thinking is enabled).

For per-call detail — which tools ran, with which arguments, and what they returned — set the viewer's [debug level](./intelligence.html#debug-levels) to `:tools`.

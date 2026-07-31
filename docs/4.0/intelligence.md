---
license: addon
betaStatus: Beta
outline: [2, 3]
---

# Intelligence

Avo Intelligence adds an AI assistant to your admin panel. It ships a floating chat bar on every Avo page, a set of tools the assistant uses to query, create, update, and delete records on your behalf, and admin resources for browsing chats, messages, tool calls, and models.

:::warning
The feature and docs are both work in progress.
:::

## Requirements

- Avo 4
- An API key for an LLM provider supported by [RubyLLM](https://rubyllm.com) (OpenAI, Anthropic, Gemini, and others)
- PostgreSQL

## Installation

### 1. Install the gem

Add the gem to your application's `Gemfile`:

```ruby
gem "avo-intelligence", source: "https://packager.dev/avo-hq/"
```

Then run:

```bash
bundle install
```

### 2. Run the installer

```bash
bin/rails generate avo:intelligence install
bin/rails db:migrate
```

This creates the `avo_intelligence_*` tables and writes `config/initializers/ruby_llm.rb` (skipped if it already exists).

:::warning Already installed an earlier alpha?
The installer only ever writes the initial migration, so a schema created by an earlier version won't pick up columns added since. `avo_intelligence_chats.attached_context` is the current one — it's where a chat stores [the record it was started from](#the-record-you-start-from). Add it by hand:

```bash
bin/rails generate migration AddAttachedContextToAvoIntelligenceChats attached_context:jsonb
bin/rails db:migrate
```

Without it, starting a chat raises on the unknown attribute.
:::

### 3. Set your provider API key

The generated `config/initializers/ruby_llm.rb` reads `OPENAI_API_KEY` by default and pins `model_registry_class` to `Avo::Intelligence::Model` — that setting is required, don't remove it.

```ruby
RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch("OPENAI_API_KEY", nil) # [!code focus]
  # config.anthropic_api_key = ENV.fetch("ANTHROPIC_API_KEY", nil)
  # config.gemini_api_key = ENV.fetch("GEMINI_API_KEY", nil)

  config.model_registry_class = "Avo::Intelligence::Model"
end
```

Store the key in your environment or `Rails.application.credentials` — never hardcode it in the initializer.

### 4. Add the admin resources to the menu

In `config/initializers/avo.rb`, inside the `config.main_menu` block:

```ruby
section "Intelligence", icon: "heroicons/outline/sparkles" do
  resource "avo_intelligence/chats"
  resource "avo_intelligence/messages"
  resource "avo_intelligence/tool_calls"
  resource "avo_intelligence/models"
end
```

The resources and controllers ship inside the gem — there's nothing to generate into your app.

### 5. Verify

```bash
bin/rails runner "puts Avo::Intelligence::Chat.count"
```

Expect `0` and no error. Restart your server and the chat bar appears on every Avo page, with an **Intelligence** section in the sidebar.

## Configuration

Avo Intelligence registers its settings on Avo's own configuration, so everything lives in `config/initializers/avo.rb` under the `intelligence` namespace:

```ruby
Avo.configure do |config|
  # Reasoning effort for thinking-capable models ("low", "medium", "high").
  # Only sent to models that support reasoning; ignored otherwise.
  config.intelligence.thinking_effort = "medium"

  # Token budget for the model's thinking trace (positive integer).
  config.intelligence.thinking_budget = 2048
end
```

Each option falls back to an environment variable when unset, so you can configure through the environment instead:

| Option | Environment variable | Default |
| ----------------- | ---------------------------------- | ------- |
| `thinking_effort` | `AVO_INTELLIGENCE_THINKING_EFFORT` | unset |
| `thinking_budget` | `AVO_INTELLIGENCE_THINKING_BUDGET` | unset |

When both are unset, no thinking parameters are sent to the provider.

## How the assistant works

Every message you send starts a fresh turn against the provider, built from three things: a system prompt, the conversation so far, and a set of tools. The model can't see your database — it only ever learns about your data by calling a tool and reading what comes back.

**The system prompt is rebuilt on every turn.** It's assembled from the ERB files under `app/prompts/`, so it always reflects the current date, the signed-in user, the record the chat is attached to, and any instructions you've added. Nothing about your schema is baked in ahead of time.

**It inspects before it queries.** The first time a conversation touches a resource, the assistant asks for that resource's real columns, associations, and scopes, then builds its query from the answer. This is enforced by the tools, not merely requested in the prompt: the query and write tools refuse to run against a resource that hasn't been inspected in this conversation. It's why the first question about a resource takes an extra beat, and why the assistant uses your scopes — `cancelled`, `published` — instead of guessing at column filters.

**Reading.** Query results are paginated, and the assistant is told to answer "how many" from the result's total count rather than by counting rows, so a capped result set doesn't become a wrong number. When a query returns exactly one record, the UI renders a card for it — title and a link — and the assistant is told not to repeat the fields in prose.

**Writing.** Updates and deletes show you a card describing the change and run only when you click Confirm; the click applies the change, not the model. Those two work one record at a time — ask for a bulk change and the assistant will say so and ask you to pick. Creates apply immediately, since there's nothing to preview for a record that doesn't exist yet, and creating is the one write it will repeat: "add 15 cities" creates fifteen without stopping between them. Every executed write is recorded in an audit log, and the assistant can undo one through the same confirmation card.

**Authorization is enforced at the tool layer, on every call.** Each read and write goes through your Avo policies for the signed-in user who owns the chat — per-resource and per-field. Instructions are guidance for the model; your policies are what actually decides. A resource the user can't list is invisible to the assistant rather than refused, so it can't be used to probe for what exists.

## Customize the assistant's instructions

The assistant's system prompt is built from ERB files that ship inside the gem, under `app/prompts/`. They resolve like Rails views: a file in your application at the same relative path replaces the gem's copy. If you configure nothing, the shipped prompt is used as is.

:::warning
Instructions are guidance for the model, not a security boundary. What the assistant can actually read and write is enforced by its tools and your Avo authorization policies — never rely on prompt text to hide or protect data.
:::

### Add your own instructions

To add rules on top of the shipped prompt, eject the `extra_instructions` file:

```bash
bin/rails generate avo:intelligence:eject extra_instructions
```

This creates `app/prompts/avo/intelligence/chat_agent/extra_instructions.txt.erb` in your application. Whatever you write in it is appended to the end of the chat assistant's system prompt. The gem's own copy is empty, so until you edit the file nothing changes.

This is the place for the things the assistant can't learn from your schema:

```erb
<%# app/prompts/avo/intelligence/chat_agent/extra_instructions.txt.erb %>
Domain vocabulary:
- "Churned" customers are those with a cancelled subscription — use the
  Customer resource's cancelled scope, not a column filter.
- When the user says "orders", they mean the Purchase resource.

Style:
- Amounts are stored in cents. Always display them as EUR.
- Answer in the same language the user writes in.
```

The file is ERB, so you can interpolate anything your app knows — `Rails.application.credentials`, `ENV`, your own configuration. Two locals are also available: `user`, the signed-in user the chat belongs to, and `chat`, the `Avo::Intelligence::Chat` record. That makes per-role instructions a conditional:

```erb
<%# app/prompts/avo/intelligence/chat_agent/extra_instructions.txt.erb %>
<% if user.support_agent? %>
Only suggest read-only queries; never offer to change records.
<% end %>
```

Interpolate specific attributes — `<%= user.first_name %>` — never the whole object; only what you interpolate ends up in the prompt.

### Rename the assistant

Out of the box the assistant introduces itself as Avo. Its name and one-line role live in a prompt file of their own, so you can rebrand it without replacing the rest of the instructions. Create the file at the same relative path in your application:

```erb
<%# app/prompts/avo/intelligence/chat_agent/identity.txt.erb %>
You are Ada, an assistant embedded in the Acme admin panel. You answer questions
about the application's data using the tools available to you. If the user asks
your name or who you are, say you are Ada.
```

Your copy replaces the shipped one entirely. Keep the "answer using your tools" sentence in some form — it anchors the assistant to the app's data — and change the name freely.

The avocado next to the name is a view, not a prompt — see [Replace the assistant's icon](#replace-the-assistant-s-icon).

### Replace the shipped prompts

For full control, eject every prompt file the gem ships:

```bash
bin/rails generate avo:intelligence:eject instructions
```

This copies all prompt files — the chat assistant's instructions and sub-prompts, plus the conversation-renamer's — into `app/prompts/avo/intelligence/`, where your copies take over completely. Edit the ones you want to change and delete the rest: a deleted file falls back to the gem's copy, so you keep receiving prompt improvements for everything you didn't touch.

The shipped `instructions.txt.erb` ends with an `<%= extra_instructions %>` slot. If you replace it, your copy decides whether to keep that slot — remove the line and the `extra_instructions` file is ignored.

## Replace the assistant's icon

The avocado is a single partial, rendered everywhere the assistant appears: the **Agent** button, the collapsed bar, the empty state on new and full-page chats, and the *Open in assistant bar* button on a chat's record page. Create the same path in your application and all of them change at once:

```erb
<%# app/views/avo/intelligence/_avocado_icon.html.erb %>
<%= svg "tabler/outline/robot", class: local_assigns.fetch(:classes, "size-4") %>
```

An image file works the same way:

```erb
<%# app/views/avo/intelligence/_avocado_icon.html.erb %>
<%= image_tag "assistant-mark.svg", class: local_assigns.fetch(:classes, "size-4") %>
```

Each place that renders the icon passes a `classes` local, because the sizes differ — `size-4` in the bar, `size-6` on the empty states. Pass it through to whatever you render, as both examples do, or the icon comes out the wrong size in half of them.

The icon on the chat pages' breadcrumb isn't part of the partial and stays an avocado.

## The record you start from

Start a conversation from a record's page and the assistant already knows which record you mean. You can ask "who owns this?", "what is this?", or "rename this to Q3 pricing" without naming the record or waiting for a lookup.

A ribbon above the composer names the record, so it's never a guess: the resource and the record's title, sitting behind the message box. On pages that aren't a single record — an index, a dashboard, a new-record form — there is no ribbon and no button, because there is nothing to attach.

**The record stays attached for the whole conversation.** It's the record the chat was *started from*, so you're asked once, when the chat begins — that's why the ribbon is on the new-chat composer only. Every later message still resolves "this record", "it", or a question with no subject at all against the same record. Ask "what is this?" as the fifth message and it works exactly as it does as the first.

Dismiss the ribbon with the ✕ at its end and the chat starts without it. The button next to send toggles it back on, and lights up whenever the record is attached, so the ribbon and the button always agree about what the chat will carry. Every fresh compose view offers the record again: the ✕ applies to the chat you're writing, not to the feature.

It respects your policies, on every message. Only a reference is kept — the resource name and the record id, never the title or any field value. That reference is resolved again on each turn, through the same authorization the assistant's other tools use (`index?` plus your Pundit scope), and the record's title is read fresh at that moment. So a record the user loses access to, or that gets deleted mid-conversation, simply drops out of the prompt instead of lingering as a stale copy of something they can no longer see. The attachment is only a starting point either way — every read and write the assistant then performs is authorized on its own.

The wording lives in a prompt file like the rest, so you can change how the assistant treats it:

```bash
bin/rails generate avo:intelligence:eject instructions
```

Then edit `app/prompts/avo/intelligence/chat_agent/attached_context.txt.erb`. It receives an `attached_record` local — `{resource:, record_id:, label:}`, or `nil` when the conversation wasn't started from a record — and rendering nothing is a valid way to turn the feature off.

## Open the chat

The chat bar sits at the bottom of every Avo page. **Cmd+J** (or **Ctrl+J**) opens it from anywhere, including from inside a field you're typing in — that's the point, so you can pull the assistant up mid-edit without losing your place. Clicking **Agent** does the same.

Every chat you open becomes a pill in the dock, newest first, so several conversations can stay open at once and you can switch between them without losing any. Drag a pill to reorder them. The chat window lines its end edge up with the pill it was opened from and slides across when you switch, so it's always clear which conversation you're looking at. The chevron at the bar's end collapses the whole dock down to that one button when you want the page to yourself; click it again to bring the bar back. The open chats, their order, and the collapsed state are all remembered per device.

Clicking the window's own title bar minimizes it — the conversation stays in the dock, it just gets out of your way.

To give a conversation the whole window, use **Open in full page** in the title bar. It's a normal link, so cmd-click opens it in a new tab. From that page, **Back to chat window** hands the conversation back to the floating bar and returns you to the page you opened it from. It only appears when there's somewhere to go back to — open a chat page directly, from a link or a bookmark, and there's no back control.

A new conversation opens with a short greeting and a few suggested prompts. Clicking a suggestion types it into the composer and submits it — it takes exactly the same path as a typed message.

:::info
Cmd/Ctrl+J follows Avo's own hotkey setting. If you've set `config.hotkeys = {enabled: false}` in `config/initializers/avo.rb`, the shortcut is off along with the rest — the Agent button still works.
:::

## Full-page chats

Chats are also real pages, at `/chats` under your Avo mount point (`/avo/chats` with the default mount). The list shows every chat you own — its model, message count, and age — and links to the conversation. It's the same chat as in the bar: same messages, same tools, same streaming, with room to read.

The list is scoped to the signed-in user. It's not an admin view of everyone's conversations — for that, browse the `Avo::Intelligence::Chat` resource from the sidebar.

## Dictate a message

The microphone in every composer — the bar, the new-chat page, and open conversations — transcribes speech into the message box: click to start, click to stop. Pauses don't end the session, and the text lands on top of whatever draft is already there, so you can type half a message and speak the rest.

Minimizing the chat window ends an open session, so the mic never keeps listening behind a closed window.

It uses the browser's built-in speech recognition, so it needs no API key and sends nothing to your provider. The button only appears in browsers that support the Web Speech API — Chrome, Edge, and Safari today; in Firefox there's no microphone in the toolbar.

## Copy a message

Hover any message and a copy button appears beneath it. It copies the raw text the assistant produced — the markdown it wrote, not the rendered HTML — so pasting it into an issue or an editor keeps the formatting.

## Choose which models people can use

By default a chat runs on the model you configured in `config/initializers/ruby_llm.rb`, and there is no model picker — the RubyLLM registry is thousands of models long, which is not a dropdown.

Give your `Avo::Intelligence::ChatPolicy` an `#available_models` method to curate a shortlist. Every composer — the bar, the new-chat page, and open conversations — then shows a picker with exactly those models:

```ruby
# app/policies/avo/intelligence/chat_policy.rb
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def available_models
    return nil if user.admin? # every model in the registry

    ["gpt-4o-mini", "claude-haiku-4-5", "gemini-2.5-flash"]
  end
end
```

Entries are RubyLLM registry model ids. Browse the ones your app knows about through the **Models** resource in the sidebar, or in the console with `RubyLLM.models.chat_models.all.map(&:id)`.

| Return value                        | What happens                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `nil`, or no method at all          | Every model in the registry, no picker, chats use the configured default.      |
| Two or more entries                 | The picker offers exactly those, in the order you listed them.                 |
| One entry                           | No picker — there's no choice to make — and every chat runs on that model.     |
| A list containing an unknown entry  | That entry is dropped; the rest of the list stands. The log names it.          |
| A list of nothing but unknown entries | No model to start a chat on, and chat creation is refused.                   |

Your list is taken **exactly**. Three things follow from that, and they're the ones worth knowing:

- **Order is yours.** The picker reads back in the order you wrote, not alphabetically, and **the first entry is what a new chat starts on**. Put the model you want people reaching for at the top. There's no "the configured default" entry in the picker — it would only ever name a model already in your list.
- **Ids must match character for character.** No aliases, no near matches. `claude-sonnet-4-8` doesn't become `claude-sonnet-4-6` because you meant it to.
- **An unknown entry is simply absent.** It doesn't widen the catalog back to the whole registry — the log names it (`ChatPolicy#available_models lists unknown chat models: …`) and the rest of your list stands. A list of nothing but typos leaves no model to chat on, and chat creation is refused rather than quietly falling back to one you never granted.

The list is enforced on every chat create **and** every message, not just in the picker — the picker is UI, the server re-checks. A user can't start a chat on, or switch a chat onto, a model you withheld by crafting the request themselves.

### Pinning the provider

Some models are served by more than one provider — `gemini-2.5-flash` comes through both Gemini and VertexAI, and much of Anthropic's catalog is also on Bedrock and VertexAI. A bare id resolves to whichever provider RubyLLM itself would pick (its own preference order: OpenAI, Anthropic, Gemini, VertexAI, Bedrock, OpenRouter, …), exactly as if you had handed that id to `RubyLLM.chat`.

To say which one your app talks to, give a `{model:, provider:}` pair instead of a plain string:

```ruby
def available_models
  [
    "gpt-4o-mini",
    "claude-haiku-4-5",
    {model: "gemini-2.5-flash", provider: :vertexai} # [!code focus]
  ]
end
```

Provider is its own key rather than part of the string — the same shape RubyLLM uses everywhere (`RubyLLM.chat(model:, provider:)`), and the only workable one here, since real model ids already contain both `/` (OpenRouter) and `@` (VertexAI).

Each id appears once in the picker either way: pinned, it's the provider you named; unpinned, it's the one RubyLLM prefers. Both the chat and each of its messages store the provider alongside the model, so the transcript says where every answer came from.

:::info
A pinned pair whose provider doesn't carry that model is dropped like any other unknown entry, and the log names both halves — `model-id (provider)`.
:::

:::warning
Pin only a provider you have configured. RubyLLM validates the provider's credentials when the chat is created, so pinning `provider: :vertexai` without VertexAI keys in `config/initializers/ruby_llm.rb` raises `RubyLLM::ConfigurationError` on the first chat rather than at boot.
:::

### Switching model mid-conversation

The picker stays in the composer once the chat exists, so a conversation can change models partway through: pick another model and send.

The switch takes effect from that message on. The transcript so far is replayed to the new model — nothing is lost, and the new model answers with the whole conversation in view — and each message records which model wrote it.

The picker is disabled while the assistant is responding; the model is yours to change on your turn.

A chat keeps running on its model even if you later drop that model from `#available_models`. Its own picker still lists it — otherwise the dropdown would misreport what the next message runs on — and re-picking it is a no-op, so the conversation is never stranded. But nobody can switch a chat *onto* a model you've withdrawn.

## Who can delete a chat

Chats are owner-scoped already — nobody sees anyone else's — so by default a person can delete their own. Give your `Avo::Intelligence::ChatPolicy` a `#destroy?` method to take that away:

```ruby
# app/policies/avo/intelligence/chat_policy.rb
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def destroy?
    user.admin?
  end
end
```

Withheld, the delete entry disappears everywhere it appears: the chat bar's ⋯ menu, the chat page's ⋯ menu, and the rows on **All chats** — a button that would only 403 is worse than no button. The controller checks the same policy on the `DELETE` itself, so hiding the entries isn't what enforces it.

It's decided per chat, so a policy that allows deleting some and not others is honored: the bar reads the answer for whichever conversation is loaded, not once for the session.

No policy, or no `#destroy?` method, leaves deletion open: an app that never had a policy keeps the behavior it had before one existed. An error raised inside the policy fails closed, unlike [debug levels](#debug-levels) — this one is destructive.

:::warning
Deletion is permanent, and it takes everything belonging to the conversation with it: the messages, the tool calls, any unconfirmed writes, and the audit log of the writes it executed. The records the assistant created or changed are untouched — it's the history of *who asked for what* that goes. If you need that history to outlive the chat, withhold `#destroy?` and archive instead.
:::

## Debug levels

How much of the assistant's internal work a viewer may see is an authorization decision, not a preference — the people chatting may be your customers, and the system prompt contains the rules that defend against jailbreaks.

There are two levels:

- `:off` — the conversation only: replies, record cards, confirmation buttons, the assistant's questions, and the "Thinking…" indicator. The default.
- `:tools` — everything above plus the system prompt, the raw thinking trace, the tool calls, and the raw tool output.

The level is decided by your app's policy for `Avo::Intelligence::Chat`. It's never stored and never switchable from the chat UI:

```ruby
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def debug_level
    user.admin? ? :tools : :off
  end
end
```

No policy, no `#debug_level` method, an unrecognized value, or any error inside the policy all fail closed to `:off`.

Viewers who get `:tools` also get a **bug** button — in the panel's title bar, and in the chat page's ⋯ menu — that hides those rows without leaving the conversation. It's a display preference, remembered per device and shared by both places. Nobody on `:off` sees the button, because none of those rows reach their browser to begin with.

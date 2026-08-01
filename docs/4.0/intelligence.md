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

### Replace the shipped prompts

For full control, eject every prompt file the gem ships:

```bash
bin/rails generate avo:intelligence:eject instructions
```

This copies all prompt files — the chat assistant's instructions and sub-prompts, plus the conversation-renamer's — into `app/prompts/avo/intelligence/`, where your copies take over completely. Edit the ones you want to change and delete the rest: a deleted file falls back to the gem's copy, so you keep receiving prompt improvements for everything you didn't touch.

The shipped `instructions.txt.erb` ends with an `<%= extra_instructions %>` slot. If you replace it, your copy decides whether to keep that slot — remove the line and the `extra_instructions` file is ignored.

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

## What the assistant can do

The assistant works through tools that run against your actual data: querying records, inspecting them, and creating, updating, or deleting them. Writes go through a confirmation flow — the assistant shows a card describing the pending change and only executes after you confirm. Every executed write is recorded in an audit log with undo support.

### Files and attachments

The assistant reports on your Active Storage usage, so you can ask about files the way you ask about records:

| Ask                              | What you get                                                      |
| -------------------------------- | ----------------------------------------------------------------- |
| "How much storage are we using?" | Totals by storage service, content type, and resource             |
| "Any orphaned uploads?"          | Blobs attached to nothing — count, bytes, and the oldest one      |
| "Do we have duplicate files?"    | Files sharing a checksum, and the bytes de-duplicating would free |
| "Is storage growing?"            | Uploads per month                                                 |
| "What are the biggest files?"    | The largest files and which records they belong to                |
| "Which products have no image?"  | Records missing an attachment                                     |

Ask it to **show** a file — "show me this post's cover", "what's on this product?" — and the reply carries the file itself: images render inline, video and audio get a player, and anything else comes back as a link that opens in a new tab.

You can also name the file instead of the record — "show me dummy-video.mp4", or just "show me the beach photo". The assistant searches for it across everything you're allowed to see and tells you which record each match belongs to, so you never have to know where a file lives before asking for it. Every file comes back with its blob id, which is what you reference when asking for a change.

It can also attach and detach files on a record — "attach blob 42 to this post's cover", "take the cover off this post". Files are referenced by their blob id, so the assistant only ever links something already in your Media Library: it never uploads bytes and never fetches a file from a URL.

Attach and detach apply immediately rather than through the confirmation card that record writes use. Detaching only unlinks the file — the blob stays in the Media Library and the assistant can re-attach it with the same id. Purging a file is never something the assistant can do; deleting the file itself stays a manual action.

Both respect your policies: file reports only count blobs attached to resources you are allowed to list, and attaching or detaching goes through the same `upload_<name>?` and `delete_<name>?` policy methods the Avo UI checks.

A new conversation opens with a short greeting and a few suggested prompts. Clicking a suggestion types it into the composer and submits it — it takes exactly the same path as a typed message.

Tool calls respect your Avo authorization setup: per-resource and per-field policies apply to what the assistant can read and write, scoped to the signed-in user who owns the chat.

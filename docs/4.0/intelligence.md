---
license: addon
betaStatus: Alpha
outline: [2, 3]
---

<!--
  Deliberately NOT registered in docs/.vitepress/config.js.

  avo-intelligence hasn't been announced, so this page must stay off the sidebar. VitePress
  still builds it, and `scripts/generate-llms-txt.js` / `scripts/generate-docs-map.js` both walk
  the sidebar rather than the filesystem — so the page is reachable by direct URL for the team
  and for early customers we hand the link to, while staying out of the navigation, llms.txt,
  and the docs map. Add the sidebar entry when the add-on goes public.
-->

# Avo Intelligence

Avo Intelligence adds an AI assistant to your admin panel. It answers questions about the records
behind your Avo resources, and — with your confirmation — creates, updates, and deletes them,
through the same authorization rules the rest of Avo obeys.

:::warning
This add-on is a work in progress and isn't generally available yet. The API described here can
still change between releases.
:::

## Requirements

- Avo 4.x
- The [`ruby_llm`](https://rubyllm.com) gem (installed automatically as a dependency)
- An API key for at least one LLM provider (OpenAI, Anthropic, Gemini, OpenRouter, …)

## Installation

### 1. Install the gem

```ruby
# Gemfile
gem "avo-intelligence", source: "https://packager.dev/avo-hq/"
```

```bash
bundle install
```

### 2. Run the installer and migrate

```bash
bin/rails generate avo:intelligence install
bin/rails db:migrate
```

This creates the add-on's tables and prints the next steps, including a menu snippet for
`config/initializers/avo.rb`. The admin resources and controllers for browsing chats, messages,
tool calls, and models ship inside the add-on itself — there's nothing to generate for those.

### 3. Configure your provider

```ruby
# config/initializers/ruby_llm.rb
RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch("OPENAI_API_KEY", Rails.application.credentials.dig(:openai_api_key))
  config.model_registry_class = "Avo::Intelligence::Model" # [!code focus]
end
```

:::info
You don't need to set `use_new_acts_as`. Avo Intelligence requires RubyLLM's new
`acts_as_chat` / `acts_as_message` API to function at all, so it turns the flag on at require
time, before Rails boots. That also means the install generator — and any other command that
boots your app — works before this initializer exists.
:::

## Debug levels

Everything the assistant does internally — the system prompt, its raw thinking trace, the tool
calls with their arguments, and the raw tool output — is hidden by default. How much of it a
person sees is decided **per viewer, on every render**, by your chat policy.

| Level             | What the viewer sees                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `:off` (default)  | The conversation only: replies, record cards, write confirmations, the assistant's own questions, and the "Thinking…" indicator                |
| `:tools`          | All of the above, plus the system prompt, the model's raw thinking trace, the tool calls with their arguments, and the raw tool output          |

Answer `debug_level` in a policy for `Avo::Intelligence::Chat`:

```ruby
# app/policies/avo/intelligence/chat_policy.rb
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def debug_level # [!code focus]
    user.admin? ? :tools : :off # [!code focus]
  end # [!code focus]
end
```

There is no initializer setting and no in-app switcher, by design. Avo Intelligence is embedded in
admin panels whose users may be *your* customers, so this is an authorization question about the
viewer — not a preference. A switch in the UI would put the system prompt, including the rules that
make the assistant refuse out-of-scope requests, one click away from the person those rules defend
against.

### It fails closed

No policy, no `#debug_level`, an unrecognized value, or a policy that raises all resolve to `:off`.
This deliberately departs from Avo's usual "no policy means fully open" rule — the safe default
here is showing less, not more.

### Nothing stops being recorded

The level only decides what renders. Thinking traces and tool calls are still persisted, because
the provider needs them to continue the conversation. Changing someone's level takes effect on
their next page load; there's no migration and no backfill.

:::warning
Adding this policy also brings `Avo::Intelligence::Chat` under Avo's regular CRUD authorization for
the add-on's own Chats admin resource. If you browse chats through those resources, answer the CRUD
predicates too — otherwise those pages start returning 403 the moment the policy exists:

```ruby
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def debug_level = user.admin? ? :tools : :off

  def index? = true
  def show? = true
  def create? = true
  def update? = true
  def destroy? = true

  # Avo authorizes these two separately from CRUD. Without them the search box and the
  # resource's actions quietly disappear.
  def search? = true
  def act_on? = true
end
```

:::

## Thinking output

Assistant messages can display provider-returned thinking text, redacted thinking traces, and
thinking token counts when RubyLLM exposes them — to viewers whose [debug level](#debug-levels) is
`:tools`.

To request thinking from providers that support it, set one or both of these environment variables
before boot:

```bash
AVO_INTELLIGENCE_THINKING_EFFORT=medium
AVO_INTELLIGENCE_THINKING_BUDGET=2048
```

RubyLLM forwards these through `with_thinking`. Provider behavior varies:

- Anthropic requires a budget to return thinking.
- Gemini and some OpenRouter models can return readable thinking text.
- OpenAI reasoning models may report reasoning token usage without exposing readable thinking text.

## Limiting the assistant to your application

The assistant is meant to answer questions about **your app's data**, not to be a general-purpose
chatbot. That boundary is set by the system prompt — `Avo::Intelligence::ChatResponseJob::INSTRUCTIONS`,
the one place that governs what the assistant is willing to talk about. Its `Scope` section tells the
model to only help with things one of its tools could serve — querying, creating, updating, and
deleting the records exposed by your Avo resources — and to decline everything else (general
knowledge, coding help, creative writing, math, opinions, role-play) in one sentence and redirect
back to the app.

:::warning
This is a prompt-level (soft) boundary, not a hard gate. It reliably keeps the assistant on task for
ordinary use, but a determined jailbreak can sometimes talk any model around a prompt rule.

What it *cannot* get around is authorization: every data tool enforces per-user, row- and
field-level access independently of the prompt. The worst realistic failure is the assistant
answering an off-topic question — never a data leak.
:::

Worth knowing if you customize the prompt:

- **The scope definition is tool-tied** ("in scope only if a tool could help"), so it stays correct
  as you add or remove tools. There's no hardcoded topic list to maintain.
- **Meta questions are carved in.** "What can you help me with?" counts as in scope, so the
  assistant can explain itself instead of refusing.
- **Watch for over-refusal on weaker models.** A firmer scope rule can make weak tool-followers
  (for example `gpt-4o-mini`) reject legitimate data questions. Confirm behavior on a capable model
  before assuming the prompt is wrong.
- If you need a *hard* guarantee, add a classification step before the chat call — a cheap model
  call that gates out-of-scope prompts with a canned reply. The prompt alone can't promise it.

:::info
The response job runs `:async` — inside the web process by default — so **restart the server** after
editing the instructions, and test the change in a **fresh chat**. An existing thread replays its
history and can mask the new behavior.
:::

## What you get

The add-on ships these models and their tables:

| Constant                       | Backing table                 |
| ------------------------------ | ----------------------------- |
| `Avo::Intelligence::Chat`      | `avo_intelligence_chats`      |
| `Avo::Intelligence::Message`   | `avo_intelligence_messages`   |
| `Avo::Intelligence::ToolCall`  | `avo_intelligence_tool_calls` |
| `Avo::Intelligence::Model`     | `avo_intelligence_models`     |

Plus controllers, views, a response job, and routes — all namespaced under `Avo::Intelligence` and
exposed through the engine.

Admin CRUD resources for browsing that data ship in the add-on too, namespaced under
`Avo::Resources::AvoIntelligence` so they don't collide with the engine's own chat controllers:

| Resource                                  | Model                         |
| ----------------------------------------- | ----------------------------- |
| `Avo::Resources::AvoIntelligence::Chat`     | `Avo::Intelligence::Chat`     |
| `Avo::Resources::AvoIntelligence::Message`  | `Avo::Intelligence::Message`  |
| `Avo::Resources::AvoIntelligence::ToolCall` | `Avo::Intelligence::ToolCall` |
| `Avo::Resources::AvoIntelligence::Model`    | `Avo::Intelligence::Model`    |

They aren't added to your `main_menu` automatically — the install generator prints a snippet for
that.

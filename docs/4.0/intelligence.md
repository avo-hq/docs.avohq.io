---
license: addon
addon_link: https://avohq.io/addons/intelligence
betaStatus: "Alpha 🧪 (experimental)"
outline: [2, 3]
---

# Intelligence

Adds an AI assistant to your Avo panel. Users ask questions in plain language ("which orders shipped late last week?", "set this project's status to archived") and the assistant answers them by querying and writing the records your Avo resources already expose.

It is backed by [RubyLLM](https://rubyllm.com), so you bring your own provider and API key. Every tool the assistant uses runs through Avo's authorization, so a user can only ever see and change what they could see and change by clicking through the panel themselves.

```ruby
# config/initializers/ruby_llm.rb
RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch("OPENAI_API_KEY", Rails.application.credentials.dig(:openai_api_key))
  config.model_registry_class = "Avo::Intelligence::Model"
end
```

Out of the box the chat shows the conversation and nothing else — no system prompt, no thinking trace, no tool calls. See [Show the agent's internals to developers](#show-the-agent-s-internals-to-developers) to open that up for the people who need it.

:::warning
This add-on is in **alpha**. The engine, models, and chat UI ship today; agent and tool wiring is still landing. Expect breaking changes between releases.
:::

## Installation

1. **Add the gem** to your `Gemfile`:

  ```ruby
  # Gemfile
  gem "avo-intelligence", source: "https://packager.dev/avo-hq"
  ```

2. **Bundle:**

  ```bash
  bundle
  ```

3. **Run the install generator:**

  ```bash
  bin/rails generate avo:intelligence install
  ```

  This writes the migration and, unless you already have one, a `config/initializers/ruby_llm.rb`.

4. **Run the migrations:**

  ```bash
  bin/rails db:migrate
  ```

5. **Add your provider API key** — see [Configuration](#configuration).

6. **Add a menu section** for the admin resources in `config/initializers/avo.rb`:

  ```ruby
  # config/initializers/avo.rb
  section "Intelligence", icon: "heroicons/outline/sparkles" do
    resource "avo_intelligence/chats"
    resource "avo_intelligence/messages"
    resource "avo_intelligence/tool_calls"
    resource "avo_intelligence/models"
  end
  ```

## Configuration

Point RubyLLM at your provider and tell it to read models from this gem's table:

```ruby
# config/initializers/ruby_llm.rb
RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch("OPENAI_API_KEY", Rails.application.credentials.dig(:openai_api_key))
  config.model_registry_class = "Avo::Intelligence::Model"
end
```

:::info
You don't need to set `use_new_acts_as`. The gem's models require RubyLLM's newer `acts_as_chat`/`acts_as_message` API to work at all, so it forces the flag on at require time — before Rails boots. That also means the install generator works before you've written this initializer.
:::

## Show the agent's internals to developers

By default a chat renders only the conversation: the assistant's replies, record cards, confirm buttons, the questions the assistant asks back, and the "Thinking…" indicator. The system prompt, the raw thinking trace, the tool calls, and the raw tool output are hidden from everyone.

To open those up, define `debug_level` on your policy for `Avo::Intelligence::Chat`:

```ruby
# app/policies/avo/intelligence/chat_policy.rb
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def debug_level
    user.admin? ? :tools : :off
  end
end
```

| Level    | What renders                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------ |
| `:off`   | The conversation only — replies, record cards, confirm buttons, the assistant's questions, the "Thinking…" indicator. **The default.** |
| `:tools` | All of the above, plus the system prompt, the raw thinking trace, the tool calls, and the raw tool output. |

The gem asks this method on every render and hands it the person looking at the chat, so you can drive the answer from data — a role, a per-user flag — and turn debugging on for one person without a deploy. Because the level only decides what renders, a change takes effect on the next page load. Nothing is migrated, and nothing stops being recorded at `:off` — the provider still needs the traces to continue the conversation.

:::warning
There is deliberately **no switcher in the chat UI**. This add-on runs inside your admin panel, where the people chatting may be your own customers, so who sees the internals is an authorization question about the viewer rather than a preference. A toggle would put the system prompt — including the rules that make the assistant refuse jailbreaks — one click away from the person those rules defend against.
:::

Resolution fails closed. No policy, no `debug_level` method, an unrecognized return value, or a raise inside your policy all mean `:off`; a raise is logged and the plain conversation renders as usual.

### Policy methods to keep open

Avo authorizes `search?` and `act_on?` separately from CRUD. The moment a `ChatPolicy` exists, the search box and the resource's actions disappear unless you allow them explicitly:

```ruby
# app/policies/avo/intelligence/chat_policy.rb
class Avo::Intelligence::ChatPolicy < ApplicationPolicy
  def debug_level
    user.admin? ? :tools : :off
  end

  def search?
    true
  end

  def act_on?
    true
  end
end
```

## Thinking output

Assistant messages can display provider-returned thinking text, redacted thinking traces, and thinking token counts when RubyLLM exposes them — to viewers at [`:tools`](#show-the-agent-s-internals-to-developers).

To request thinking from providers that support it, set one or both of these environment variables before boot:

```bash
AVO_INTELLIGENCE_THINKING_EFFORT=medium
AVO_INTELLIGENCE_THINKING_BUDGET=2048
```

RubyLLM forwards these through `with_thinking`. Provider behavior still varies:

- **Anthropic** requires a budget to return thinking.
- **Gemini** and some **OpenRouter** models can return readable thinking text.
- **OpenAI** reasoning models may report reasoning token usage without exposing readable thinking text.

## Keep the assistant on your app's data

The assistant is meant to answer questions about **your app's data**, not to be a general-purpose chatbot. That boundary is set by the system prompt in `ChatResponseJob::INSTRUCTIONS` (`app/jobs/avo/intelligence/chat_response_job.rb`), the one place that governs what the assistant will talk about.

Its `Scope` section tells the model to only help with things one of its tools could serve — querying, creating, updating, and deleting the records your Avo resources expose — and to decline everything else (general knowledge, coding help, creative writing, math, opinions, role-play) in one sentence and redirect back to the app.

:::warning
**This is a prompt-level boundary, not a hard gate.** It reliably keeps the assistant on task for ordinary use, but a determined jailbreak can sometimes talk any model around a prompt rule.

What it cannot get around is authorization: every data tool enforces per-user, row- and field-level access independently of the prompt. The worst realistic failure is the assistant answering an off-topic question — never a data leak.
:::

A few things worth knowing if you customize the prompt:

- **The scope definition is tool-tied** ("in scope only if a tool could help"), so it stays correct as you add or remove tools. There's no hardcoded topic list to maintain.
- **Meta questions are carved in.** "What can you help me with?" counts as in scope, so the assistant can explain itself instead of refusing.
- **Watch for over-refusal on weaker models.** A firmer scope rule can make weak tool-followers (`gpt-4o-mini`, for instance) reject legitimate data questions. Confirm the behavior on a capable model before assuming the prompt is wrong.
- **If you need a hard guarantee**, add a classification step before `chat.ask` — a cheap model call that gates out-of-scope prompts with a canned reply. The prompt alone cannot promise it.

`ChatResponseJob` runs `:async` (inside the web process by default), so **restart the server** after editing `INSTRUCTIONS`, and test your change in a **fresh chat** — an existing thread replays its history and can mask the new behavior.

## What you get

The engine ships these models, all namespaced under `Avo::Intelligence`:

| Model                                | Backing table                     |
| ------------------------------------ | --------------------------------- |
| `Avo::Intelligence::Chat`            | `avo_intelligence_chats`          |
| `Avo::Intelligence::Message`         | `avo_intelligence_messages`       |
| `Avo::Intelligence::ToolCall`        | `avo_intelligence_tool_calls`     |
| `Avo::Intelligence::Model`           | `avo_intelligence_models`         |
| `Avo::Intelligence::WriteLog`        | `avo_intelligence_write_logs`     |
| `Avo::Intelligence::PendingWrite`    | `avo_intelligence_pending_writes` |

Plus controllers, views, a `ChatResponseJob`, and routes — all exposed through the engine.

Admin resources for browsing that data ship in the gem too, namespaced under `Avo::Resources::AvoIntelligence` so they don't collide with the engine's own chat controllers:

| Resource                                  | Model                         |
| ----------------------------------------- | ----------------------------- |
| `Avo::Resources::AvoIntelligence::Chat`     | `Avo::Intelligence::Chat`     |
| `Avo::Resources::AvoIntelligence::Message`  | `Avo::Intelligence::Message`  |
| `Avo::Resources::AvoIntelligence::ToolCall` | `Avo::Intelligence::ToolCall` |
| `Avo::Resources::AvoIntelligence::Model`    | `Avo::Intelligence::Model`    |

They aren't added to your menu automatically — the install generator prints the snippet, and it's step 6 of [Installation](#installation).

The Chats resource is scoped to the signed-in user out of the box, so one admin never sees another's conversations without you writing a policy. It's also read-only by design: a chat is a transcript, started and continued from the chat UI, so the write controls are stripped from the resource.

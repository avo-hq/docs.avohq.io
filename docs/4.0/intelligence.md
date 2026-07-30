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

Tool calls respect your Avo authorization setup: per-resource and per-field policies apply to what the assistant can read and write, scoped to the signed-in user who owns the chat.

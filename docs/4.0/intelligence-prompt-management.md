---
license: addon
betaStatus: Alpha
outline: [2, 3]
---

<!--
  Deliberately NOT registered in docs/.vitepress/config.js, for the same reason as
  intelligence.md: avo-intelligence hasn't been announced, so this page stays off the sidebar,
  out of llms.txt, and out of the docs map, while remaining reachable by direct URL.
  Add the sidebar entry when the add-on goes public.
-->

# Prompt management

The [Avo Intelligence](./intelligence.html) assistant is governed by a system prompt — the standing
instructions that tell it what it is allowed to talk about, how to use its tools, and how to behave
around your data. This page covers where that prompt lives and how your app can change it.

## Requirements

- `avo-intelligence` installed and working (see [Avo Intelligence](./intelligence.html))
- `config/initializers/avo_intelligence.rb` for the configuration options below — you create it
  yourself. Overriding a prompt file needs no configuration at all

## The three ways to change the prompt

Pick the smallest one that does the job.

| You want to | Use | Own the shipped text? |
| ----------- | --- | --------------------- |
| Add house rules, tone, or domain vocabulary | `config.additional_instructions` | No — you keep getting our updates |
| Replace what the assistant is *for* | `config.system_prompt` | Yes, but only the part you wrote |
| Edit our wording, section by section | `rails g avo:intelligence:prompts`, then edit the copies | Yes — those files stop tracking ours |
| Run with no system prompt at all | `config.system_prompt = nil` | n/a |
| Replace the agent itself | `config.chat_agent_class` | Yes, and the tools and model config too |

## What changed

The assistant's prompt used to be a single Ruby heredoc constant
(`ChatResponseJob::INSTRUCTIONS`) buried in a background job. There was no supported way to
change it short of monkey-patching the job.

| Before | Now |
| ------ | --- |
| One ~118-line heredoc constant inside `ChatResponseJob` | ERB files under `app/prompts/`, following ruby_llm's own convention |
| The job hand-assembled instructions, tools, and model config | A `RubyLLM::Agent` subclass (`Avo::Intelligence::ChatAgent`) does it declaratively |
| No way to change the prompt from your app | Drop a file with the same path into your app's `app/prompts/` |
| The whole prompt was stored as a `role: :system` message and shown as a "System" bubble in the chat | Sent as a runtime instruction — never persisted, never displayed |

The prompt **text itself is unchanged**. This was a move, not a rewrite: the wording the model
receives today is byte-for-byte what it received before.

## Configuration

Both options live in `config/initializers/avo_intelligence.rb`. The install generator does not
write that file — the gem runs on its defaults without it — so create it the first time you want
to change something.

Both accept either a String or a callable; a callable is resolved on every request and receives
the acting user, so the prompt can differ per user.

```ruby
# config/initializers/avo_intelligence.rb
Avo::Intelligence.configure do |config|
  config.additional_instructions = nil # String, callable, or nil. Default: nil
  config.system_prompt = "..."         # String, callable, or nil. Default: unset
  config.chat_agent_class = "MyAgent"  # String (recommended) or Class.
                                       # Default: "Avo::Intelligence::ChatAgent"
end
```

### Adding to the prompt

`config.additional_instructions` appends your text to the end of the system prompt, under a label
that says it refines the rules above rather than replacing them.

```ruby
# config/initializers/avo_intelligence.rb
Avo::Intelligence.configure do |config|
  config.additional_instructions = <<~TEXT
    Refer to "customers" as "clients".
    Never quote figures from the Payroll resource, even to an administrator.
  TEXT
end
```

Per-user, with a callable:

```ruby
# config/initializers/avo_intelligence.rb
config.additional_instructions = ->(user) do
  "This user manages the #{user.region} region." if user.respond_to?(:region)
end
```

This is the recommended option for most apps: you get the shipped prompt's improvements in future
releases and only own the few lines you wrote.

**It cannot widen the assistant's scope.** The shipped prompt's scope rule — the boundary that
keeps the assistant about *this application's data* — is stated as overriding anything that
conflicts with it, and your additions render below it labelled as subordinate to it. If you want a
different scope, that is `config.system_prompt`'s job, not this one. (This is prompt wording, not
enforcement. See the last gotcha below.)

### Replacing the prompt

`config.system_prompt` replaces the prompt we ship — the "constitution" that carries the
assistant's scope rule, its inspect-before-acting workflow, and how it reports refused actions.
Set it and none of that text is sent.

```ruby
# config/initializers/avo_intelligence.rb
Avo::Intelligence.configure do |config|
  config.system_prompt = <<~TEXT
    You are a read-only reporting assistant for this admin panel. Answer questions about the
    application's records using your tools, and nothing else.
  TEXT
end
```

Two things still happen when you set it:

- **The identity note still renders**, first — the current date and time and who the assistant is
  acting for. That is volatile fact rather than opinion, and every provider needs a ground-truth
  current date.
- **`additional_instructions` is still appended**, last. Setting both is taken to mean you want
  both.

Use this when your assistant is a different thing from ours. If you only want to reword our text,
override the prompt file instead — you keep the structure and change the sentences.

### Running with no system prompt

Setting `config.system_prompt` to `nil` sends **no system prompt at all**: no constitution, no
identity note, no additional instructions.

```ruby
# config/initializers/avo_intelligence.rb
Avo::Intelligence.configure do |config|
  config.system_prompt = nil
end
```

`nil` and "not set" are deliberately different states. Leaving the option alone gives you the
shipped prompt; setting it to `nil` is you asking for a blank slate.

The tools still work — the assistant can still query, create, update, and delete through them, and
every authorization check still applies. What it loses is everything the prompt was carrying: it
no longer knows today's date, no longer knows who it is acting for (so "my drafts" means nothing
to it), no longer inspects a resource before acting on it, and is no longer bounded to your app's
data. Expect it to answer general-knowledge questions and to make more tool-call mistakes. This is
a starting point for building your own prompt, not a mode to ship as-is.

A callable that returns `nil` does the same thing, per request — so a blank slate can be scoped to
some users:

```ruby
# config/initializers/avo_intelligence.rb
# No prompt for the team building their own; everyone else gets ours.
config.system_prompt = ->(user) { user.prompt_engineer? ? nil : House::PROMPT }
```

Note that once `system_prompt` is set at all, our shipped prompt is out of the picture — a
callable cannot fall back to it. Read the file in if you want it as a base.

## Where the prompts live

Inside the gem, at `app/prompts/`:

```
app/prompts/avo/intelligence/
  chat_agent/
    instructions.txt.erb    # the main assistant prompt — scope, workflow, data rules, style
    identity.txt.erb        # current date/time + who the assistant is acting for
    custom.txt.erb          # the labelled wrapper around config.additional_instructions
  conversation_renamer_agent/
    instructions.txt.erb    # the titling rules for auto-naming a conversation
```

The path is derived from the agent class name: `Avo::Intelligence::ChatAgent` →
`avo/intelligence/chat_agent/`. The file name is the prompt name, always `.txt.erb`.

Three files rather than one for the chat agent, because they change at different rates.
`identity.txt.erb` is rebuilt every request (the date has to be the real send-time date);
`instructions.txt.erb` is the same bytes on every request. Keeping them apart is what will let
us cache the large, stable half later.

They are assembled in that order — identity, then the constitution (or your `system_prompt`), then
`custom.txt.erb` — separated by blank lines. `custom.txt.erb` renders to nothing when
`additional_instructions` is unset, so an app that configures nothing gets exactly the two-section
prompt it got before these options existed.

## Overriding a prompt

Create the **same path** under your own app's `app/prompts/`. Your file wins.

```
your-app/
  app/prompts/avo/intelligence/chat_agent/instructions.txt.erb
```

That is the whole mechanism. There is nothing to register, no initializer entry, no subclass.
The lookup is: your app's file first, the gem's shipped default second.

You can override one file and leave the others alone — the lookup runs per file, so overriding
`instructions.txt.erb` still gets you the gem's `identity.txt.erb`.

### Start from a copy, not a blank page

The shipped prompt is load-bearing. It carries the assistant's scope rule (the boundary that
stops it being a general-purpose chatbot), its inspect-before-acting workflow, and how it talks
about refused actions. Start from our copy rather than a blank file:

```bash
bin/rails generate avo:intelligence:prompts
```

That writes all three chat-agent prompt files into your app:

```
app/prompts/avo/intelligence/chat_agent/instructions.txt.erb
app/prompts/avo/intelligence/chat_agent/identity.txt.erb
app/prompts/avo/intelligence/chat_agent/custom.txt.erb
```

Delete the ones you don't want to own — each file falls back to the gem's copy independently, so
keeping only `instructions.txt.erb` is a perfectly good outcome.

The generator **never overwrites a file you already have**. Re-running it after you've edited a
prompt reports `skip` for that file and leaves it exactly as it is, so it is safe to run again to
pick up a file you deleted earlier.

It does not eject `conversation_renamer_agent/instructions.txt.erb` — the renamer only produces a
conversation title, and there is rarely a reason to change it. If you want to, the lookup chain
still honours a file you place there by hand.

**Ejecting means you maintain it.** From that point the file is yours: improvements we make to the
shipped prompt in future releases don't reach it. This is why `config.additional_instructions` is
the better path for most apps.

### What you can use inside a prompt file

These are ERB templates. The chat agent's prompt files (`chat_agent/*.txt.erb`) receive:

| Local | What it is |
| ----- | ---------- |
| `user` | The signed-in user the assistant is acting for |
| `chat` | The `Avo::Intelligence::Chat` record for this conversation |

`identity.txt.erb` additionally receives:

| Local | What it is |
| ----- | ---------- |
| `now` | The current date and time, pre-formatted with the app's time zone |
| `user_label` | A display string for the user — name, falling back to email, falling back to `Class#id` |

The conversation renamer runs without a chat or a user, so its prompt file has neither local.

So a house-rules addition to your `instructions.txt.erb` can be conditional:

```erb
<%# app/prompts/avo/intelligence/chat_agent/instructions.txt.erb %>
<% if user.respond_to?(:admin?) && user.admin? %>
This user is an administrator. Financial figures may be discussed in full.
<% else %>
Do not disclose revenue or payroll figures.
<% end %>
```

Keep in mind that anything you put here is sent to the model on **every request** in the
conversation — it is standing instruction, not a one-off.

## Replacing the agent

`config.chat_agent_class` is the last rung, and the one you should almost never need. It swaps the
class that answers chats, so you own not just the prompt but the tools, the model configuration,
and how the prompt is assembled.

```ruby
# app/agents/my_chat_agent.rb
class MyChatAgent < Avo::Intelligence::ChatAgent
  instructions { "You are a support triage assistant for this admin panel." }
end
```

```ruby
# config/initializers/avo_intelligence.rb
Avo::Intelligence.configure do |config|
  config.chat_agent_class = "MyChatAgent"
end
```

Your class is instantiated with `chat:`, `user:` and `persist_instructions:`, so inheriting from
`Avo::Intelligence::ChatAgent` is by far the easiest way to get one that works.

**Give it as a String, not a Class.** Naming a constant directly in an initializer
(`config.chat_agent_class = MyChatAgent`) autoloads one of your app's classes while Rails is still
booting. That pins a single copy of it across code reloads in development and can raise outright
during eager load in production. A String is looked up at the moment the agent is built, which is
after boot and after any reload. A Class is accepted if you have a reason, but the String is the
recommended form and the default.

A subclass inherits our prompt files, so the common case — our assistant plus one of your own
tools — is a few lines:

```ruby
# app/agents/my_chat_agent.rb
class MyChatAgent < Avo::Intelligence::ChatAgent
  def self.tools_for(chat:, user:)
    super + [MyOwnTool.new(user: user)]
  end
end
```

Prompt lookup walks the chain, nearest class first: `app/prompts/my_chat_agent/instructions.txt.erb`
in your app, then `app/prompts/avo/intelligence/chat_agent/instructions.txt.erb` in your app (what
`rails g avo:intelligence:prompts` writes), then the gem's copy. So you can override one prompt file
at your own class's path and inherit the rest, or declare `instructions` inline to replace them
outright.

## The "System" bubble is gone

Previously the entire prompt was written to the database as a `role: :system` message, which
meant the first thing a user saw when opening a chat was ~118 lines of internal instructions.

New chats no longer persist it. The prompt is applied as a runtime instruction instead, so the
model still receives it in full on every request — it just never becomes a message.

**Conversations created before this change** still hold that stored system message, and it stays
there — nothing deletes it and there is no migration to run. It is simply inert: the chat drops
`role: :system` rows both from what it sends to the model and from what it renders, so the stored
copy is neither seen nor used. An old chat and a new one behave identically.

This matters most for [the blank slate](#running-with-no-system-prompt). Setting
`config.system_prompt = nil` means no runtime instruction is applied at all — and with nothing to
apply, nothing would have overwritten that stored row either. Left alone, an old conversation
would have quietly kept sending the original constitution to a developer who asked for no prompt.
Dropping the rows from the payload is what makes "none" actually mean none, in every chat.

A chat whose only message is a stored system prompt therefore counts as empty, and shows the
greeting below.

## The empty state

In place of the System bubble, a chat with no messages opens on a short greeting and three
suggested prompts. Clicking one types it into the composer and sends it, exactly as if the user
had typed it themselves.

The suggestions are intentionally generic — they ask the assistant what it can do rather than
naming any of your resources. Listing real resources would mean filtering them by what the
signed-in user is allowed to see, and the chat view does not do authorization; the tools do.

It is a view, not a message: nothing is persisted, and it disappears as soon as the first message
arrives.

## Gotchas

- **Editing a prompt file needs no restart.** The file is read on every render and ruby_llm
  re-evaluates the instructions block on every agent build, so nothing caches it anywhere — in
  production either. Send the next message and you are looking at the new prompt.
- **Test in a fresh chat.** An existing conversation replays its message history, which can mask
  a changed instruction for several turns.
- **An override replaces the whole file**, not part of it. When the gem's default prompt changes
  in a future release, your copy does not — you own it from that point on. This is the main
  reason `config.additional_instructions` is the better path for most apps.
- **Restart the server after editing the initializer too.** `Avo::Intelligence.configure` runs at
  boot; the callables inside it are what re-resolve per request, not the block itself.
- **The assistant's real safety boundary is not the prompt.** Row and field authorization, the
  inspect-first gate, and the write-confirmation flow are enforced in the tools, below the model.
  Weakening a prompt rule does not grant the assistant access it did not have — and strengthening
  one does not substitute for a policy.

## See also

[Resource scoping](./intelligence-resource-scoping.html) — keeping a resource out of the
assistant's reach entirely. That is the enforced counterpart to this page: asking the prompt not to
touch something is a request, and `config.excluded_resources` is a rule the tools apply whatever
the model decides.

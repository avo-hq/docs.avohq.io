---
license: addon
betaStatus: Beta
outline: [2, 3]
---

# Avo AI

Avo AI adds an AI assistant to your admin panel. It ships a floating chat bar on every Avo page, a set of tools the assistant uses to query, create, update, and delete records on your behalf, and admin resources for browsing chats, messages, tool calls, and models.

New here, or wondering what to type into it? [What you can ask](./ai-what-you-can-ask.html) is the catalog of everything the assistant does, with a sample prompt for each.

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
gem "avo-ai", source: "https://packager.dev/avo-hq/"
```

Then run:

```bash
bundle install
```

### 2. Run the installer

```bash
bin/rails generate avo:ai install
bin/rails db:migrate
```

This creates the `avo_ai_*` tables and writes `config/initializers/ruby_llm.rb` (skipped if it already exists). It also appends every AI setting — commented out, at its default — to the end of `config/initializers/avo.rb`, so the options are in the file waiting to be uncommented rather than in terminal output that scrolls away. If the file already configures `config.ai`, it's left untouched.

:::warning Already installed an earlier alpha?
The installer only ever writes the initial migration, so a schema created by an earlier version won't pick up columns added since. Two are current, both on `avo_ai_chats`: `attached_context` stores [the record the chat was started from](#the-record-you-start-from), and `responding_at` tracks [whether a chat is being answered right now](#while-the-assistant-is-replying). Add them by hand:

```bash
bin/rails generate migration AddAttachedContextToAvoAiChats attached_context:jsonb
bin/rails generate migration AddRespondingAtToAvoAiChats responding_at:datetime
bin/rails db:migrate
```

Without them, starting a chat raises on the unknown attribute.
:::

### 3. Set your provider API key

The generated `config/initializers/ruby_llm.rb` reads `OPENAI_API_KEY` by default and pins `model_registry_class` to `Avo::Ai::Model` — that setting is required, don't remove it.

```ruby
RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch("OPENAI_API_KEY", nil) # [!code focus]
  # config.anthropic_api_key = ENV.fetch("ANTHROPIC_API_KEY", nil)
  # config.gemini_api_key = ENV.fetch("GEMINI_API_KEY", nil)

  config.model_registry_class = "Avo::Ai::Model"
end
```

Store the key in your environment or `Rails.application.credentials` — never hardcode it in the initializer.

### 4. Add the admin resources to the menu

In `config/initializers/avo.rb`, inside the `config.main_menu` block:

```ruby
section "AI", icon: "heroicons/outline/sparkles" do
  resource "avo_ai/chats"
  resource "avo_ai/messages"
  resource "avo_ai/tool_calls"
  resource "avo_ai/models"
end
```

The resources and controllers ship inside the gem — there's nothing to generate into your app.

### 5. Verify

```bash
bin/rails runner "puts Avo::Ai::Chat.count"
```

Expect `0` and no error. Restart your server and the chat bar appears on every Avo page, with an **AI** section in the sidebar.

## Configuration

Avo AI registers its settings on Avo's own configuration, so everything lives in `config/initializers/avo.rb` under the `ai` namespace:

```ruby
Avo.configure do |config|
  # Reasoning effort for thinking-capable models ("low", "medium", "high").
  # Only sent to models that support reasoning; ignored otherwise.
  config.ai.thinking_effort = "medium"

  # Token budget for the model's thinking trace (positive integer, min 1024).
  config.ai.thinking_budget = 2048
  # Set both — see "Thinking" below. A model takes one knob or the other.

  # Clock format for chat timestamps: :auto (default), :h12, or :h24.
  config.ai.time_format = :h24

  # What a download from a URL may cost (see "Getting new files in").
  # Set only the keys you want to change; the rest keep their defaults.
  config.ai.remote_file = {
    max_size: 25.megabytes, # ceiling on the downloaded file
    open_timeout: 5,        # seconds to connect
    read_timeout: 10,       # seconds per read
    deadline: 30,           # seconds for the whole download
    max_redirects: 3
  }
end
```

The two thinking options fall back to an environment variable when unset, so you can configure them through the environment instead:

| Option            | Environment variable       | Default |
| ----------------- | -------------------------- | ------- |
| `thinking_effort` | `AVO_AI_THINKING_EFFORT`   | unset   |
| `thinking_budget` | `AVO_AI_THINKING_BUDGET`   | unset   |

When both are unset, no thinking parameters are sent to the provider.

### Thinking

Set **both** options. They are not alternatives, and they are not a fallback pair — they are two
different knobs, and each model accepts exactly one of them. Its provider rejects the other
outright.

This is not an Anthropic quirk — the split runs across providers, and which knob a model takes is a
property of the model, not of the company that made it:

| Knob              | Models that take it                                           |
| ----------------- | ------------------------------------------------------------- |
| `thinking_budget` | `claude-haiku-4-5`, `claude-sonnet-4-6`, Gemini 2.5            |
| `thinking_effort` | `claude-opus-5`, Gemini 3, OpenAI reasoning models (`gpt-5`, …) |

Avo reads the answer from the model's own registry entry and sends only that knob, preferring the
budget where a model takes both. So a picker offering Haiku and Opus needs both values set —
configure only `thinking_effort` and every Haiku conversation quietly answers with no thinking at
all, with nothing in the logs to say so.

Both options reach every provider RubyLLM supports thinking for, which is most of them: Anthropic,
OpenAI, Gemini, VertexAI, Bedrock, Azure, Mistral, Perplexity, OpenRouter, Ollama, and GPUStack. A
few of those don't take direction — Mistral's Magistral models always think and ignore what you
send, and local Ollama or GPUStack models get the values passed through untranslated. For the
current per-provider picture, RubyLLM documents it at
[rubyllm.com/thinking](https://rubyllm.com/thinking/).

Effort is passed to the provider exactly as written, so the accepted strings are the provider's,
not Avo's. `"low"`, `"medium"`, and `"high"` are understood everywhere effort applies; OpenAI also
takes `"minimal"`, Gemini 3 takes only `"low"` and `"high"`, and `"none"` turns thinking off on
Anthropic. A value the provider doesn't recognise fails on the first request, not at boot. Budgets
are thinking tokens, minimum 1024 on Anthropic; zero or negative reads as unset.

The same two knobs are how you size the reasoning readers see above a reply: a bigger budget or a
higher effort buys a longer, deeper trace; a smaller one keeps it to a line or two. On budget
models the trace is the model's own reasoning verbatim, so the budget bounds it directly. On
effort models what renders is the provider's summary of the reasoning — its length loosely follows
the effort, and its wording isn't steerable from your side.

:::info
Thinking only reaches models that declare reasoning support. Sending it to a plain chat model like
`gpt-4o-mini` would have the provider reject the whole request, so Avo doesn't.
:::

### Timestamps

Every timestamp in a conversation is written by the browser, not the server: message stamps and
day dividers ("Today 1:43 PM") render in the reader's own timezone, and the day dividers group by
the reader's calendar. A conversation is stamped the same whether it's read from Bucharest or
Denver, and no timezone configuration is involved.

`time_format` decides only whether the clock is 12- or 24-hour — the timezone is always the
reader's own:

| Value   | Clock                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| `:auto` | **Default.** Each reader's browser locale decides — an `en-GB` reader sees `21:42`, an `en-US` one `09:42 PM`. |
| `:h12`  | `09:42 PM` for everyone.                                                                                       |
| `:h24`  | `21:42` for everyone.                                                                                          |

Leave it on `:auto` unless the admin should read the same for everyone regardless of who's
signed in.

"Today" and "Yesterday" are plain translations under
`avo.ai.messages.today` / `.yesterday`.

## How the assistant works

Every message you send starts a fresh turn against the provider, built from three things: a system prompt, the conversation so far, and a set of tools. The model can't see your database — it only ever learns about your data by calling a tool and reading what comes back.

**The system prompt is rebuilt on every turn.** It's assembled from the ERB files under `app/prompts/`, so it always reflects the current date, the signed-in user, the record the chat is attached to, and any instructions you've added. Nothing about your schema is baked in ahead of time.

**It inspects before it queries.** The first time a conversation touches a resource, the assistant asks for that resource's real columns, associations, and scopes, then builds its query from the answer. This is enforced by the tools, not merely requested in the prompt: the query and write tools refuse to run against a resource that hasn't been inspected in this conversation. It's why the first question about a resource takes an extra beat, and why the assistant uses your scopes — `cancelled`, `published` — instead of guessing at column filters.

**Reading.** Query results are paginated, and the assistant is told to answer "how many" from the result's total count rather than by counting rows, so a capped result set doesn't become a wrong number. When a query returns exactly one record, the UI renders a card for it — title and a link — and the assistant is told not to repeat the fields in prose.

**Writing.** Updates and deletes show you a card describing the change and run only when you confirm it; the confirmation applies the change, not the model. Those two work one record at a time — ask for a bulk change and the assistant will say so and ask you to pick. Creates apply immediately, since there's nothing to preview for a record that doesn't exist yet, and creating is the one write it will repeat: "add 15 cities" creates fifteen without stopping between them. Every executed write is recorded in an audit log, and the assistant can undo one through the same confirmation card.

**Confirming a card — click or type.** Every card that waits on you — an update, a delete, an undo, an action run, an attach-by-URL — settles the same two ways: click its button (**Confirm**, or **Run** on an action, **Attach** on a file), or just tell the assistant to go ahead in the composer — "do it", "go for it", "run it", "yes". A typed confirmation is *your* word, so it counts exactly as the click does and the card flips in place; the assistant still can't confirm on its own, and it can't talk its way past a Cancel. It only reads as a confirmation when that's all you say — "run it, but change the reason to budget cut" carries a fresh instruction, so the assistant re-proposes with your change instead of running the old card. An answer sent from a question card is never a confirmation either, however it reads — see [Answering the assistant's questions](#answering-the-assistant-s-questions).

**Running your actions.** The assistant can also run the [actions](./actions.html) a resource registers, not just write columns — see [Your actions, from the chat](#your-actions-from-the-chat).

**Authorization is enforced at the tool layer, on every call.** Each read and write goes through your Avo policies for the signed-in user who owns the chat — per-resource and per-field. Instructions are guidance for the model; your policies are what actually decides. A resource the user can't list is invisible to the assistant rather than refused, so it can't be used to probe for what exists.

For the full reference — both agents, every tool and its gates, and how conversations get their names — see [Agents and tools](./ai-agents-and-tools.html).

## Answering the assistant's questions

When the assistant genuinely can't proceed — a required value you didn't mention, or which of three matching records you meant — it asks you, and the question arrives as a card rather than as a sentence buried in a reply. The card *is* the message: the turn ends there and waits on you. It asks one thing at a time, and it asks instead of guessing; it won't use a question to chase optional values you never brought up.

**A plain question.** With no options to offer, the card is the question and nothing else. Answer it in the composer the way you'd answer anything else.

**Question with options.** When the answer is one of a small known set — a status, a yes/no, the titles of the records it matched — the card lists them, numbered `1`, `2`, `3…`. Click one and it replies with that option's own text, so the conversation reads back as what you actually said ("Published"), not as an opaque "2". The numbers are there for typing: reply `2` in the composer and it lands on the second option.

**The box beside them.** Options are usually a shortcut rather than the whole truth, so most cards keep a free-text box next to them — *Or answer in your own words…* — with its own **Send**. When the options really are the entire answer space, the assistant closes that box off and the buttons become the only way to answer.

**Picking several at once.** Some questions take more than one answer — which fields to fill in, which of the matched records to include. Those render as checkboxes instead of buttons, with one **Send** under them and an *Add anything else…* box alongside. Everything goes back as a single reply: the labels you ticked, plus whatever you typed, separated by commas.

Answering a question card is an ordinary turn, never a confirmation. An option can quite legitimately read "Yes", and clicking it answers the question it belongs to — it can't reach back and confirm an update or a delete waiting further up the conversation.

## Your actions, from the chat

Setting `published_at` is not the same as publishing. Your [actions](./actions.html) are where the operation actually lives — the notification it sends, the record it stamps, the service it calls — so the assistant runs them rather than reconstructing their effect field by field.

It works from the actions each resource registers. Nothing is exposed by default beyond what you already declare in `def actions`, and nothing extra is needed to opt in:

```ruby
class Avo::Resources::Project < Avo::BaseResource
  def actions
    action Avo::Actions::ArchiveProject
  end
end
```

Ask for it in whatever words you'd use with a colleague — "archive the Orbit project" — and the assistant finds the matching action, reads the inputs it declares, and shows you a confirmation card naming the action and the record, with the action's own fields rendered right on the card. They're the same fields its modal would show — a tags field is a tags field here too — prefilled with the values the assistant took from your message and the action's own `default`s. When you name a value it's the one on the card: "extend the trial by 3 days" lands `3` where the action would default to 7, "don't notify the user" leaves that box unchecked. Every field is editable before you run. Nothing runs until you confirm it — click **Run**, or tell the assistant to go ahead — and what runs is exactly what the fields hold at that moment; your confirmation executes it, not the model, exactly as with updates and deletes.

**It collects rather than guesses.** An input your action marks `required: true` that you didn't mention arrives on the card as an empty field for you to fill — the assistant never invents a value, because an action does real work with it. A run submitted with a required field still blank isn't performed; the card simply asks for it again.

**The action's messages are the outcome.** Whatever your action reports — `succeed`, `warn`, `inform`, `error` — lands on the card once it has run, each with its severity, the same messages the Avo UI would toast. An action may report several at once, and an `error` message is part of the outcome, not a failure of the run. The values the action was handed stay on the settled card too, folded behind a click.

[Actions that run without records](./actions.html#run-an-action-without-records) work too — the assistant runs them with no record at all.

### What it's allowed to run

Two gates, both yours, both checked when the run is proposed and again when you confirm it:

- **`act_on?` on the record**, the same policy method that decides whether the Actions dropdown appears in the UI. It's checked per record, so an owner-gated policy behaves in the chat exactly as it does on the page.
- **The action's own `self.authorize` block**, evaluated with the record in place.

:::warning A policy with no `act_on?` refuses every action
`act_on?` fails closed. If a resource has a policy that doesn't define it, the assistant can't run that resource's actions — the same way Avo hides the Actions dropdown. Add `act_on?` to the policy to allow it.
:::

A record id the signed-in user can't reach reports as "not found", never as "not allowed", so the chat can't be used to discover which records exist.

### Undoing a run

Every run against a record is written to the same audit log as the assistant's other writes, and whether it can be undone is decided by what it actually left behind, not by what it claimed:

| The run… | In the history | Undo |
| ------------------------------- | -------------------------------- | ----------------------------------------- |
| changed columns on the record | recorded with a before/after diff | restores those columns |
| deleted the record | recorded as a delete | re-creates it |
| changed nothing you store | recorded, marked not undoable | not offered |

That last row is the point. An action that emails a customer or calls another service leaves nothing to restore, and the assistant says so plainly instead of offering an undo it can't honour. Even where an undo *is* offered, it restores the columns and nothing else — the card says as much before you confirm.

Standalone runs aren't written to the audit log at all: it records what happened to a record, and a standalone action has none. The card in the conversation is the record of it.

## Files and attachments

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

You can also name the file instead of the record — "show me dummy-video.mp4", or just "show me the beach photo". The assistant searches for it across everything you're allowed to see and tells you which record each match belongs to, so you never have to know where a file lives before asking for it. Files sitting in the Media Library attached to nothing are searched too, and come back marked as such. Every file comes back with its blob id, which is what you reference when asking for a change.

It can also attach and detach files on a record — "attach blob 42 to this post's cover", "take the cover off this post". Files are referenced by their blob id, so the assistant links files already in your Media Library rather than uploading bytes itself. A Media Library URL carries that id — `/avo/media-library/260/edit` is blob 260 — so "attach 260 to this post's cover" works straight off the link.

Attach and detach apply immediately rather than through the confirmation card that record writes use. Detaching only unlinks the file — the blob stays in the Media Library and the assistant can re-attach it with the same id. Purging a file is never something the assistant can do; deleting the file itself stays a manual action.

Both respect your policies: file reports only count blobs attached to resources you are allowed to list, and attaching or detaching goes through the same `upload_<name>?` and `delete_<name>?` policy methods the Avo UI checks. The file itself is judged by who owns it, not by what the Media Library shows: the library lists every blob, but a file already attached to a record you're not allowed to read can't be attached from the chat — otherwise anyone could lift another user's private upload onto a record of their own and read it there.

### Getting new files in

Two paths bring a file that isn't in your Media Library yet onto a record:

**Upload it in the chat.** Drop a file into the composer and send it — the assistant sees the file and knows its blob id, so "attach the file I just sent to this post's cover" is a one-step ask. Files uploaded this way are private to their conversation: the assistant can't reach uploads from anyone else's chats, and other users can't reach yours.

**Give it a link.** Ask the assistant to attach a file by URL — "attach https://example.com/logo.png as this post's cover" — and it proposes the download on a confirmation card showing the URL, the filename, and the record. When the link points at an image the card previews it, so you are approving a picture you have seen rather than an address you had to read. Nothing is fetched until you click **Attach**; the assistant can't fetch anything on its own, which is what keeps a malicious link that slipped into your data from ever being followed unseen.

The download itself is hardened: only public `https://` URLs are accepted (private and internal addresses are rejected, on every redirect too), the file's content type is read from its bytes rather than trusted from the server, and anything over the configured size ceiling (25 MB by default) is refused mid-download rather than after it. If your files are bigger than that, or your source is slow, raise the matching keys under `config.ai.remote_file` — see [Configuration](#configuration). The undo is the same as for any attachment — detach it; the file stays in the Media Library.

## Customize the assistant's instructions

The assistant's system prompt is built from ERB files that ship inside the gem, under `app/prompts/`. They resolve like Rails views: a file in your application at the same relative path replaces the gem's copy. If you configure nothing, the shipped prompt is used as is.

:::warning
Instructions are guidance for the model, not a security boundary. What the assistant can actually read and write is enforced by its tools and your Avo authorization policies — never rely on prompt text to hide or protect data.
:::

### Add your own instructions

To add rules on top of the shipped prompt, eject the `extra_instructions` file:

```bash
bin/rails generate avo:ai:eject extra_instructions
```

This creates `app/prompts/avo/ai/chat_agent/extra_instructions.txt.erb` in your application. Whatever you write in it is appended to the end of the chat assistant's system prompt. The gem's own copy is empty, so until you edit the file nothing changes.

This is the place for the things the assistant can't learn from your schema:

```erb
<%# app/prompts/avo/ai/chat_agent/extra_instructions.txt.erb %>
Domain vocabulary:
- "Churned" customers are those with a cancelled subscription — use the
  Customer resource's cancelled scope, not a column filter.
- When the user says "orders", they mean the Purchase resource.

Style:
- Amounts are stored in cents. Always display them as EUR.
- Answer in the same language the user writes in.
```

The file is ERB, so you can interpolate anything your app knows — `Rails.application.credentials`, `ENV`, your own configuration. Two locals are also available: `user`, the signed-in user the chat belongs to, and `chat`, the `Avo::Ai::Chat` record. That makes per-role instructions a conditional:

```erb
<%# app/prompts/avo/ai/chat_agent/extra_instructions.txt.erb %>
<% if user.support_agent? %>
Only suggest read-only queries; never offer to change records.
<% end %>
```

Interpolate specific attributes — `<%= user.first_name %>` — never the whole object; only what you interpolate ends up in the prompt.

### Rename the assistant

Out of the box the assistant introduces itself as Avo. Its name and one-line role live in a prompt file of their own, so you can rebrand it without replacing the rest of the instructions. Create the file at the same relative path in your application:

```erb
<%# app/prompts/avo/ai/chat_agent/identity.txt.erb %>
You are Ada, an assistant embedded in the Acme admin panel. You answer questions
about the application's data using the tools available to you. If the user asks
your name or who you are, say you are Ada.
```

Your copy replaces the shipped one entirely. Keep the "answer using your tools" sentence in some form — it anchors the assistant to the app's data — and change the name freely.

The avocado next to the name is a view, not a prompt — see [Replace the assistant's icon](#replace-the-assistant-s-icon).

### Replace the shipped prompts

For full control, eject every prompt file the gem ships:

```bash
bin/rails generate avo:ai:eject instructions
```

This copies all prompt files — the chat assistant's instructions and sub-prompts, plus the conversation-renamer's — into `app/prompts/avo/ai/`, where your copies take over completely. Edit the ones you want to change and delete the rest: a deleted file falls back to the gem's copy, so you keep receiving prompt improvements for everything you didn't touch.

The shipped `instructions.txt.erb` ends with an `<%= extra_instructions %>` slot. If you replace it, your copy decides whether to keep that slot — remove the line and the `extra_instructions` file is ignored.

## Replace the assistant's icon

The avocado is a single partial, rendered everywhere the assistant appears: the **Agent** button, the collapsed bar, the empty state on new and full-page chats, and the *Open in assistant bar* button on a chat's record page. Create the same path in your application and all of them change at once:

```erb
<%# app/views/avo/ai/_avocado_icon.html.erb %>
<%= svg "tabler/outline/robot", class: local_assigns.fetch(:classes, "size-4") %>
```

An image file works the same way:

```erb
<%# app/views/avo/ai/_avocado_icon.html.erb %>
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
bin/rails generate avo:ai:eject instructions
```

Then edit `app/prompts/avo/ai/chat_agent/attached_context.txt.erb`. It receives an `attached_record` local — `{resource:, record_id:, label:}`, or `nil` when the conversation wasn't started from a record — and rendering nothing is a valid way to turn the feature off.

## Open the chat

The chat bar sits at the bottom of every Avo page. **Cmd+J** (or **Ctrl+J**) opens it from anywhere, including from inside a field you're typing in — that's the point, so you can pull the assistant up mid-edit without losing your place. Clicking **Agent** does the same.

Every chat you open becomes a pill in the dock, newest first, so several conversations can stay open at once and you can switch between them without losing any. Drag a pill to reorder them. The chat window lines its end edge up with the pill it was opened from and slides across when you switch, so it's always clear which conversation you're looking at. The chevron at the bar's end collapses the whole dock down to that one button when you want the page to yourself; click it again to bring the bar back. The open chats, their order, and the collapsed state are all remembered per device.

Clicking the window's own title bar minimizes it — the conversation stays in the dock, it just gets out of your way. The **×** in the title bar does the same thing: it closes the window, not the conversation. To take a chat out of the dock, use the × on its own pill; the conversation itself is kept either way, and it's still on your [chat list](#full-page-chats).

To give a conversation the whole window, use **Open in full page** in the title bar. It's a normal link, so cmd-click opens it in a new tab. From that page, **Minimize to the chat bar** hands the conversation back to the floating bar. If you got there through **Open in full page**, it returns you to the page you came from and its tooltip names it; a chat page opened directly — from a link, the chat list, or a bookmark — has no such page, so it takes you home instead.

The button is there before you've sent anything, too. On the new-chat view it points at the full-page composer instead, so you can start a long message with the whole window rather than the panel.

A new conversation opens with a short greeting and a few suggested prompts. Clicking a suggestion types it into the composer and submits it — it takes exactly the same path as a typed message.

:::info
Cmd/Ctrl+J follows Avo's own hotkey setting. If you've set `config.hotkeys = {enabled: false}` in `config/initializers/avo.rb`, the shortcut is off along with the rest — the Agent button still works.
:::

## Full-page chats

Chats are also real pages, at `/chats` under your Avo mount point (`/avo/chats` with the default mount). The list shows every chat you own — its model, message count, and age — and links to the conversation. It's the same chat as in the bar: same messages, same tools, same streaming, with room to read.

The list is scoped to the signed-in user. It's not an admin view of everyone's conversations — for that, browse the `Avo::Ai::Chat` resource from the sidebar.

## The conversation menu

The ⋯ button next to a conversation's title opens its menu. It's in the chat window's title bar and on the full-page chat, and both carry the same two rename entries:

- **Rename chat** makes the title editable in place — the panel's header in the bar, the last breadcrumb on a chat page. **Enter** commits and **Esc** cancels in both. Clicking away differs: in the bar it cancels the edit, on the chat page it commits it. An empty title is refused, so a conversation always keeps a name.
- **Rename again with AI** hands the conversation back to the [renamer agent](./ai-agents-and-tools.html#renaming-conversations) for a fresh title, without going through the assistant. The title shimmers while the renamer runs, and the new name lands everywhere the old one showed.

Renaming needs no policy of its own — owning the chat is the entire permission, and you only ever see your own.

The bar's menu carries one more entry. **Copy as markdown** puts the whole conversation on your clipboard as plain markdown: the chat's title as a heading, then every turn labelled **User:** or **Assistant:**. Only what was actually said is copied — tool cards, confirmation cards, and debug rows stay behind, so what you paste into an issue or a PR is the conversation, not the machinery.

The menu's other entries have their own sections: [deleting a chat](#who-can-delete-a-chat), and — for viewers whose policy allows it — [the debug toggle](#debug-levels).

## Write a message

The composer is a rich text box, not a bare textarea. The usual markdown shortcuts work as you type — `**bold**`, `# heading`, `- list`, backticks for code — and formatting survives a paste. **Enter** sends the message, **Shift+Enter** starts a new line, and on an empty composer **Up** recalls your previously sent messages, shell-style. The assistant receives the message as markdown, structure intact.

## Send files with a message

Every composer takes files: click the paperclip, drag them in, or paste them from the clipboard. Files upload as you add them — through Active Storage's direct upload, into the storage service your app already uses — preview in the draft, and go to the model with the message, so "summarize the attached CSV" and "what's in this screenshot?" work the way you'd expect.

The files stay attached to the message and the model sees them again on every later turn — you can keep asking about a file for the rest of the conversation, not just in the message it rode in on.

The one thing to check is the model: reading an image takes a vision model. The current Claude, GPT, and Gemini families all read images and PDFs; sending a file to a model that can't read it fails at request time with the provider's error rather than silently dropping the file.

## Dictate a message

The microphone in every composer — the bar, the new-chat page, and open conversations — transcribes speech into the message box: click to start, click to stop. Pauses don't end the session, and the text lands on top of whatever draft is already there, so you can type half a message and speak the rest.

Minimizing the chat window ends an open session, so the mic never keeps listening behind a closed window.

It dictates in your admin's language: the recognizer follows the page's `lang` attribute, falling back to the browser's own language setting.

### Browser support, and where the audio goes

Dictation is the browser's built-in [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), not something the assistant does. There's no API key to set, and neither Avo nor your LLM provider ever sees the audio — they only get the finished text, and only when you send the message. Who *does* see it depends entirely on the browser, and they don't answer alike:

| Browser         | Support                | Where recognition runs                                                                                                                                     |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safari          | 14.1+ macOS, 14.5+ iOS | Apple's speech stack — on device where the language and hardware allow it, Apple's servers otherwise. Safari asks the first time, and the prompt says as much. |
| Chrome, Edge    | Yes                    | Google's speech service: the audio is uploaded, so dictation needs a connection. Chrome 139 added an opt-in on-device mode, which Avo doesn't request.        |
| Firefox         | No                     | Nowhere — unimplemented, behind a disabled `dom.webspeech.recognition.enable` flag.                                                                          |

The microphone only renders where the API exists, so Firefox users get a composer with no mic rather than a button that does nothing.

:::warning
In Chrome and Edge, dictating means uploading admin-panel audio to Google. If that doesn't fit your compliance story, tell your admins to dictate in Safari — there's no gem setting that changes it, because the browser owns the audio path.
:::

## While the assistant is replying

Your message lands on the transcript the moment you send it, with a **Thinking** indicator underneath — it's saved as part of the send, not by the background job, so it never blinks out for the second or two the queue takes. Starting a fresh conversation keeps the composer you typed into on screen until the conversation is ready, then trades one for the other, so there's no empty panel in between. A second **Enter** while that's happening doesn't start a second chat.

When answering takes real work — a lookup, an inspection, a write — the assistant leaves short progress hints while it works: *Inspecting the schema*, *Checking today's signups*. They render small and muted, alongside the reasoning trace, so they read as status rather than replies — and they name the goal in your terms, never the tool it reaches for. It's what you read while the work happens instead of watching an empty panel.

When the answer lands, the worked trail folds up: everything between your question and the reply — the reasoning, the hints — collapses into a single **Worked for 12 seconds** row above the answer, so a settled conversation reads question, one quiet row, answer. Open the row to see how the assistant got there; viewers with the [`:tools` debug level](#debug-levels) find the tool calls in there too.

You can keep typing while it works. A message sent before the current answer lands doesn't interrupt it — it waits in a short list above the composer, in the order you sent it, and goes out on its own the moment the assistant finishes. One turn at a time, so two replies never race each other in the same conversation.

While a message waits you can move it to the front of the line or drop it, which is the point of showing you the wait rather than hiding it. The list belongs to the page you typed on: reloading clears it, the same way it clears anything else you'd typed but not sent.

The indicator is read from the conversation itself rather than from what your browser happened to witness. Reload mid-reply, or open the chat in full page while it's working, and the indicator is still there waiting on the same reply — the answer streams in wherever you're watching from when it lands. It clears when the assistant's reply arrives, when a card or a question hands the turn back to you, or when the run errors out.

## When each message was sent

A divider marks the start of every day in the transcript: **Today**, **Yesterday**, the weekday name for anything else inside the past week, then a date — `Jul 26`, and `Sep 24, 2025` once it isn't this year — each followed by the clock time of that day's first message.

Day and month names come from your locale, and the **Today** and **Yesterday** words are locale keys (`avo.ai.messages.today` and `avo.ai.messages.yesterday`), so a translated admin panel gets translated dividers.

Dividers are worked out when the page renders, not as each message arrives. Leave a conversation open across midnight and it picks up the new day's divider on the next full load.

## Copy a message

Hover any message and a copy button appears beneath it. It copies the raw text the assistant produced — the markdown it wrote, not the rendered HTML — so pasting it into an issue or an editor keeps the formatting.

## Choose which models people can use

By default a chat runs on the model you configured in `config/initializers/ruby_llm.rb`, and there is no model picker — the RubyLLM registry is thousands of models long, which is not a dropdown.

Give your `Avo::Ai::ChatPolicy` an `#available_models` method to curate a shortlist. Every composer — the bar, the new-chat page, and open conversations — then shows a picker with exactly those models:

```ruby
# app/policies/avo/ai/chat_policy.rb
class Avo::Ai::ChatPolicy < ApplicationPolicy
  def available_models
    return nil if user.admin? # every model in the registry

    [
      {model: "claude-haiku-4-5", provider: :anthropic},
      {model: "claude-sonnet-5", provider: :anthropic},
      {model: "gpt-4o-mini", provider: :openai},
      {model: "claude-opus-4-8", provider: :anthropic},
      {model: "gemini-2.5-flash", provider: :gemini}
    ]
  end
end
```

Each entry names a RubyLLM registry model, and `provider:` says which provider serves it. Browse what your app knows about through the **Models** resource in the sidebar, or in the console with `RubyLLM.models.chat_models.all.map { |m| [m.id, m.provider] }`.

A bare id works too — `"gpt-4o-mini"` instead of the pair — and is the shorter thing to write when the id is unambiguous. Naming the provider is worth the extra keys anyway: several ids are served by more than one provider, and [pinning](#pinning-the-provider) is how you say which one your app talks to.

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

`provider:` is what makes the pair worth writing. Several ids are served by more than one provider — `gemini-2.5-flash` comes through both Gemini and VertexAI, and much of Anthropic's catalog is also on Bedrock and VertexAI — and the key says which one your app talks to.

Leave it off and the id still resolves, just not to a provider you chose: RubyLLM picks by its own preference order (OpenAI, Anthropic, Gemini, VertexAI, Bedrock, OpenRouter, …), exactly as if you had handed the bare id to `RubyLLM.chat`.

```ruby
def available_models
  [
    "gpt-4o-mini", # whichever provider RubyLLM prefers for this id
    {model: "gemini-2.5-flash", provider: :vertexai} # [!code focus] VertexAI's, not Gemini's
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

Chats are owner-scoped already — nobody sees anyone else's — so by default a person can delete their own. Give your `Avo::Ai::ChatPolicy` a `#destroy?` method to take that away:

```ruby
# app/policies/avo/ai/chat_policy.rb
class Avo::Ai::ChatPolicy < ApplicationPolicy
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

- `:off` — the conversation: replies, record cards, confirmation buttons, the assistant's questions, the "Thinking…" indicator, and the collapsed trail with its reasoning trace and progress hints. The default.
- `:tools` — everything above plus the system prompt, the tool calls, and the raw tool output.

The reasoning trace deliberately sits on the `:off` side of the line: it narrates the answer the
viewer is already allowed to read, not the machinery. The system prompt and the raw tool traffic
stay gated because they are the defenses.

The level is decided by your app's policy for `Avo::Ai::Chat`. It's never stored and never switchable from the chat UI:

```ruby
class Avo::Ai::ChatPolicy < ApplicationPolicy
  def debug_level
    user.admin? ? :tools : :off
  end
end
```

No policy, no `#debug_level` method, an unrecognized value, or any error inside the policy all fail closed to `:off`.

Viewers who get `:tools` also get a **bug** button — in the panel's title bar, and beside the ⋯ menu on the chat page — that hides those rows without leaving the conversation. It's a display preference, remembered per device and shared by both places. Nobody on `:off` sees the button, because none of those rows reach their browser to begin with.

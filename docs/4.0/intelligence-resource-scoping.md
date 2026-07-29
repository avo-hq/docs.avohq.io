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

# Resource scoping

The [Avo Intelligence](./intelligence.html) assistant works through your Avo resources: it lists
them, inspects their fields, queries them, and writes to them. `config.excluded_resources` decides
which resources it is allowed to know about at all.

## Requirements

- `avo-intelligence` installed and working (see [Avo Intelligence](./intelligence.html))
- `config/initializers/avo_intelligence.rb` — you create it yourself

## This is not authorization

The assistant already respects your policies. Every read starts from the acting user's Pundit
scope, every write is authorized against the record, and a resource the user cannot `index?` is
invisible to the chat — it reports as "not found", exactly like a resource that does not exist.
None of that changes.

Exclusion answers a different question:

| | Question it answers | Varies by user |
| --- | --- | --- |
| Your policies | May **this user** see it? | Yes |
| `config.excluded_resources` | Should the **assistant** deal with it at all? | No |

An administrator passes every policy check. That is what an administrator is for — and it is
precisely why a policy cannot express "keep the assistant out of this". A resource that should be
invisible to the assistant *even for the person who is allowed to see everything* needs a rule
that does not run through the user, which is what this is.

## What is excluded by default

Two groups, both hidden out of the box with no configuration:

### This gem's own chat tables

All six, named by **model**: `Avo::Intelligence::Chat`, `::Message`, `::ToolCall`, `::Model`,
`::WriteLog` and `::PendingWrite`.

Naming the model, not the resource class, is deliberate — it covers the table however it is
exposed. The resources we ship are hidden, any resource *you* generate over the same tables is
hidden too, and `WriteLog` / `PendingWrite` are reached even though we ship no resource for them.

- **`Message` rows are other people's private conversations.** They hold what every user typed in
  their own chats. An administrator asking the assistant to "summarise recent messages" would be
  reading their colleagues' text.
- **`ToolCall` and the write log are the audit trail.** They record what the assistant did to real
  data. An assistant that can delete its own audit trail does not have one.
- **Chat content is untrusted user-authored text.** If the assistant can query chat history, then
  anything anyone types into any conversation becomes something the assistant can later read back
  as *data* — which is a working prompt-injection channel between conversations, not a
  hypothetical one.
- **There is no use case on the other side.** These resources exist so that *humans* can browse
  them in the Avo UI, and they still do.

### ActiveStorage and ActionText plumbing

Resources backed by `ActiveStorage::Attachment`, `ActiveStorage::Blob`,
`ActiveStorage::VariantRecord`, or `ActionText::RichText`.

Not dangerous, just noise: polymorphic join rows and internal storage. Listing them burns tokens
on every request and invites the assistant to write queries that cannot mean anything.

**Your own resources are never excluded by default.** Whatever your app registers stays available
to the assistant, subject to your policies. If you want one hidden, that is what this option is
for.

## Configuration

This lives in `config/initializers/avo_intelligence.rb`. The install generator does not write that
file — the defaults below apply without it — so create it when you want to change the list.

```ruby
# config/initializers/avo_intelligence.rb
Avo::Intelligence.configure do |config|
  # An Array of Strings (recommended) or Classes.
  # Default: Avo::Intelligence::Configuration::DEFAULT_EXCLUDED_RESOURCES
  config.excluded_resources =
    Avo::Intelligence::Configuration::DEFAULT_EXCLUDED_RESOURCES + ["Avo::Resources::Payroll"]
end
```

### Assigning replaces the list

There is no implicit merge. Whatever you assign *is* the list, which is why the defaults are a
public constant you can add to:

```ruby
# config/initializers/avo_intelligence.rb
# Keep ours, add yours.
config.excluded_resources = Avo::Intelligence::Configuration::DEFAULT_EXCLUDED_RESOURCES + ["Avo::Resources::Payroll"]

# Only yours — our defaults are gone. See the warning below.
config.excluded_resources = ["Avo::Resources::Payroll"]

# Nothing is excluded. The assistant can reach the chat's own tables.
config.excluded_resources = []
```

Assign the whole list — appending to the current one does not work:

```ruby
# config/initializers/avo_intelligence.rb
# Raises FrozenError. The matching set is derived when you assign, so a mutated list would
# never reach it, and an exclusion that quietly does nothing is worse than a loud error.
config.excluded_resources << "Avo::Resources::Payroll"
```

This is your app, so removing our defaults is allowed. It is worth being deliberate about it:
re-exposing the chat resources hands the assistant every user's conversation history, the audit
trail of its own writes, and a channel for text one user wrote to be read back into another
user's conversation. If you need one of them for a specific reason, exclude the other three.

### How names are matched

An entry matches a resource when it equals any of:

- the resource class name — `"Avo::Resources::Payroll"`
- its short name, the one the chat uses — `"Payroll"`
- the name of its model — `"Payroll"`, or `"ActiveStorage::Blob"`

Model matching is how the ActiveStorage and ActionText defaults work at all: apps generate their
own resources for those models and name them whatever they like, so the defaults name the model
instead of guessing the resource.

**Nothing in the list is ever constantized.** Names are compared as strings, so an entry for a
class this app does not have — our ActiveStorage defaults in an app with no ActiveStorage
resources, or a typo you have not noticed yet — is simply inert. It never matches, and it can
never raise in the middle of a request. The flip side is that a typo fails silently: if a resource
you excluded is still showing up, check the spelling first.

Give names as Strings rather than Classes, for the same reason as `chat_agent_class`: naming a
constant in an initializer autoloads it while Rails is still booting, which pins one copy across
code reloads and can raise during eager load. A Class is accepted, but a String costs nothing.

## What exclusion actually does

An excluded resource is **indistinguishable from one that does not exist**, everywhere:

| Path | Behaviour |
| --- | --- |
| Resource inspector, listing | Not in the list |
| Resource inspector, by name | `Resource "X" not found.` — the same message a nonexistent name gets |
| Query tool | `Resource "X" was not found.` — and it is not named among the suggested alternatives |
| Create / update / delete | `Unknown resource "X".` |
| Schema inspector, table list | Its table is not listed |
| Schema inspector, by table name | `Table "x" does not exist` |

The schema path matters as much as the resource path. The assistant can ask about raw tables, and
that list is derived from the same resource authorization — if exclusion stopped at resources, the
schema tool would leak exactly what the resource tool hides.

There is deliberately **no prompt rule** about excluded resources. Enforcement lives in the tools,
below the model, where instructions cannot argue with it. A prompt saying "do not query the chat
tables" would be worthless against the injection case that motivates half this feature.

## Gotchas

- **Restart after editing the initializer.** `Avo::Intelligence.configure` runs at boot.
- **Exclusion does not hide anything from the Avo UI.** The resources stay registered and humans
  keep browsing them exactly as before. This only changes what the assistant can reach.
- **Excluding a resource does not un-say what was already said.** A conversation that queried a
  resource before you excluded it still has those results in its history. Exclusion stops new
  reads; it does not rewrite past messages.
- **It is not a substitute for a policy.** Exclusion is global and coarse — every user or none. If
  the rule you want is "this user may not see these rows", that is a policy, and the assistant
  already honours it.

## See also

[Prompt management](./intelligence-prompt-management.html) — what the assistant is told, as opposed
to what it is allowed to touch.

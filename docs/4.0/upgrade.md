# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

Migrating to TailwindCSS 4? See the [TailwindCSS 4 Migration Guide](./tailwind-4-migration).

## Unreleased — `avo-intelligence` is now `avo-ai`

<Option name="The `avo-intelligence` add-on is renamed to `avo-ai`">

### Breaking Change

The add-on is now called [Avo AI](./ai.html), and the rename runs all the way through: the gem, the `Avo::Ai` namespace, the `avo_ai_*` tables, the `config.ai` settings, and the generators. Nothing aliases the old names, so there's no half-migrated state that works — swap the gem without renaming your own references and the app stops booting.

Staying put isn't free either. Avo core now recognizes `avo-ai` only, so an app left on an `avo-intelligence` alpha goes on working but quietly loses the **Open the assistant** row from the <kbd>?</kbd> [shortcuts modal](./keyboard-shortcuts.html#assistant) — the shortcut itself included. That's the one symptom of the rename you'll see before touching anything.

"Goes on working" means against Avo 4.1.6, the release that alpha was cut against. The old gem is gone, so nothing tests it against core from here — treat the alpha as something to move off rather than something to sit on.

**Action required:** Yes — every item below. The add-on only ever shipped `4.0.0.alpha.*` releases, so there is no supported upgrade path from a stable version and no rename migration ships with the gem.

### Steps to Update

Point your `Gemfile` at the new gem:

```ruby
# Gemfile
gem "avo-intelligence", source: "https://packager.dev/avo-hq/" # [!code --]
gem "avo-ai", source: "https://packager.dev/avo-hq/" # [!code ++]
```

Re-run the installer to create the `avo_ai_*` tables:

```bash
bin/rails generate avo:ai install
bin/rails db:migrate
```

The old `avo_intelligence_*` tables are left where they are, and nothing copies their contents across — everything recorded during the alpha stays behind in tables the new gem never reads. There are six of them, two more than the docs have ever mentioned:

```
avo_intelligence_chats           avo_intelligence_write_logs
avo_intelligence_messages        avo_intelligence_pending_writes
avo_intelligence_tool_calls      avo_intelligence_models
```

Drop them yourself once you're satisfied you don't want that history.

Rename the settings in your initializer:

```ruby
# config/initializers/avo.rb
config.intelligence.thinking_effort = "medium" # [!code --]
config.ai.thinking_effort = "medium" # [!code ++]
```

And the menu section that lists the add-on's resources:

```ruby
# config/initializers/avo.rb
section "Intelligence", icon: "heroicons/outline/sparkles" do # [!code --]
section "AI", icon: "heroicons/outline/sparkles" do # [!code ++]
  resource "avo_intelligence/chats" # [!code --]
  resource "avo_ai/chats" # [!code ++]
  # …and the same for messages, tool_calls, and models
end
```

Then grep your app for what's left. Each of these is a rename you have to make by hand:

| Grep for | Replace with | Where it turns up |
| ---------------------- | -------------- | ------------------------------------------------------------------ |
| `Avo::Intelligence` | `Avo::Ai` | Policies, the RubyLLM `model_registry_class`, anything referencing `Chat` |
| `config.intelligence` | `config.ai` | `config/initializers/avo.rb` |
| `AVO_INTELLIGENCE_` | `AVO_AI_` | Environment variables for the two thinking options |
| `avo_intelligence/` | `avo_ai/` | Menu resource names |
| `avo/intelligence/` | `avo/ai/` | Ejected prompts, policies, and any of the add-on's views you overrode under `app/` |
| `avo.intelligence.` | `avo.ai.` | Locale files overriding the add-on's strings |
| `avo_intelligence_` | `avo_ai_` | Table names, and the add-on's CSS classes if you style them |

Directories move with the namespace. Three kinds of file are affected, and all three fail the same quiet way — the gem ships its own copy at the new path, so a file left behind at the old one is simply never consulted and your customization stops applying without an error:

| Left at | Belongs at |
| ------------------------------------------------------ | ------------------------------------------ |
| `app/prompts/avo/intelligence/chat_agent/…` | `app/prompts/avo/ai/chat_agent/…` |
| `app/policies/avo/intelligence/chat_policy.rb` | `app/policies/avo/ai/chat_policy.rb` |
| `app/views/avo/intelligence/_avocado_icon.html.erb` | `app/views/avo/ai/_avocado_icon.html.erb` |

:::info
The gem checks all three directories on boot and logs a warning naming any files still sitting in them and the path they belong at now. Treat that as a safety net rather than the plan: it fires once per boot, which is easy to miss in a busy log.
:::

Overrides that work by constant rather than by path need no such care — a subclass of anything under `Avo::Intelligence::` raises a `NameError` on boot, so you can't miss it.

:::info
The constant is `Avo::Ai`, not `Avo::AI` — Zeitwerk's default inflector maps `ai.rb` to `Ai`, and spelling it `AI` would need a custom inflection for nothing. The product is written **Avo AI** in prose either way.
:::

</Option>

## Unreleased — browser time zone on by default

<Option name="`use_browser_timezone` now defaults to `true`">

### Breaking Change

Server-side dates and times now render in [each visitor's own time zone](./customization.html#time-and-currency) by default instead of the app's `Time.zone`. Avo detects the browser's zone via a cookie; the first page a browser loads soft-reloads once through Turbo and shows a one-time alert that times are now displayed in the visitor's zone.

**Action required:** None if per-visitor times are what you want — most apps do. Displayed values only change for users whose browser zone differs from the app zone; nothing about stored data changes.

### Maintaining Previous Behavior

Pin every visitor to the app's configured zone:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.use_browser_timezone = false # [!code ++]
end
```

</Option>

## Unreleased — resizable sidebar

<Option name="Sidebar labels truncate instead of wrapping">

### Breaking Change

The sidebar is now [resizable](./customization.html#resizable-sidebar), and as part of that change sidebar link, section, and group labels render on a single line with an ellipsis when they overflow, instead of wrapping onto multiple lines. The full label shows in a tooltip on hover.

**Action required:** None for most apps. If your navigation relied on long labels wrapping, either shorten the labels or point users at the drag handle to widen the sidebar.

Hosts with an accessibility conformance obligation can disable the drag handle with [`sidebar[:resizable]`](./customization-api.html#sidebar).

</Option>

<Option name="`.container-small` is now `max-width`-based">

### Breaking Change

`.container-small` (the wrapper around show and edit pages) used a fixed width; it now fills its container up to a `max-width` so content adapts when the sidebar is wide. If you override `.container-small`'s `width` from your own stylesheets, the new Avo-owned `max-width` now clamps it — override `max-width` instead.

**Action required:** None unless you override `.container-small`.

</Option>

## Upgrade to 4.1.4

<Option name="The back to top pill is enabled by default">

### Breaking Change

The ["Back to top" pill](./customization.html#send-the-user-back-to-the-top) used to be off by default and only revealed itself when the user scrolled back up. It's now **on by default** and its visibility depends only on how far down the page is scrolled, not on the scroll direction. The [`threshold`](./customization-api.html#back_to_top) default moved from `64` to `400` pixels so the pill stays out of the way on short scrolls.

**Action required:** None, unless you don't want the pill in your app. Every app that doesn't configure `back_to_top` gets it after this upgrade ([#4705](https://github.com/avo-hq/avo/pull/4705)).

### Maintaining Previous Behavior

Turn it off from the initializer. Keys you leave out fall back to the defaults, so `enabled` is enough:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.back_to_top = {enabled: false} # [!code ++]
end
```

The direction-aware reveal is gone for good — `threshold` is now the only thing that decides when the pill shows up.

</Option>

## Upgrade to `avo-dashboards` `4.0.9`

<Option name="The per-card refresh control is opt-in">

### Breaking Change

`avo-dashboards` `4.0.8` rendered a [refresh control](./cards.html#refresh-a-card-on-demand) on every card, with no way to remove it — including on `html` and static `partial` cards, where refreshing re-renders identical content. The control is now off by default and turns on per card with [`refresh_button`](./cards-api.html#self.refresh_button), the same name and the same default as the [dashboard-wide control](./dashboards-api.html#self.refresh_button) that shipped alongside it.

**Action required:** None unless you were on `4.0.8` and want the control kept on a card.

### Maintaining Previous Behavior

Turn it back on for each card that should keep it:

```ruby
# app/avo/cards/users_metric.rb
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.refresh_button = true # [!code ++]
end
```

Setting it on a dashboard does not turn it on for that dashboard's cards — the two controls are independent opt-ins under the same name.

</Option>

## Upgrade to 4.0.18

<Option name="Resource and field translations are used verbatim">

### Breaking Change

Avo used to humanize every resource and field label it resolved from your locale files. That silently overrode the casing you wrote: `'Payment Intent ID'` rendered as `Payment intent id`, and `'API Products'` rendered as `Api products`.

Avo now renders a resolved translation exactly as written and humanizes only the name it generates for you when no translation is found.

:::warning Lowercase translations now render lowercase
If your locale entries are lowercase, they used to appear capitalized. They will now appear as written.
:::

### Action Required

**Review your locale files.** If every `resource_translations` and `field_translations` entry is already written the way you want it on screen, there's nothing to do.

Avo's own interface strings are unaffected — the "New", "Edit", and "View" labels still render as before.

### Steps to Update

Grep your locale files for `resource_translations` and `field_translations`, and capitalize any entry you want capitalized on screen:

```yaml
# config/locales/avo.pt-BR.yml
pt-BR:
  avo:
    resource_translations:
      user:
        zero: 'usuários' # [!code --]
        one: 'usuário' # [!code --]
        other: 'usuários' # [!code --]
        zero: 'Usuários' # [!code ++]
        one: 'Usuário' # [!code ++]
        other: 'Usuários' # [!code ++]
    field_translations:
      file:
        zero: 'arquivos' # [!code --]
        one: 'arquivo' # [!code --]
        other: 'arquivos' # [!code --]
        zero: 'Arquivos' # [!code ++]
        one: 'Arquivo' # [!code ++]
        other: 'Arquivos' # [!code ++]
```

Nothing else changes: resources and fields without a translation still fall back to the humanized class or attribute name.

See [Localization (i18n)](./i18n) for the full picture.

</Option>

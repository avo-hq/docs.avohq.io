# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

Migrating to TailwindCSS 4? See the [TailwindCSS 4 Migration Guide](./tailwind-4-migration).

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

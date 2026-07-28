# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

Migrating to TailwindCSS 4? See the [TailwindCSS 4 Migration Guide](./tailwind-4-migration).

## Unreleased — avo-dashboards

<Option name="The per-card refresh control is now opt-in">

### Breaking Change

`avo-dashboards` 4.0.8 rendered a manual refresh control on every card, with no way to opt out. It is now off by default and turned on per card with [`refresh_button`](./cards-api.html#self.refresh_button), matching the dashboard-wide button that shipped alongside it.

Two controls doing the same job with opposite defaults was harder to learn than either default alone, and the card control rendered on HTML and partial cards too, where refreshing re-renders identical content.

### Action Required

If you were relying on the card controls, add `self.refresh_button = true` to the cards that should keep one:

```ruby
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = "users_metric"
  self.refresh_button = true # [!code ++]
end
```

Nothing changes for the dashboard-wide `refresh_button` — it keeps its own default, and it still reloads every card whether or not those cards carry a control of their own.

</Option>

## Unreleased — resizable sidebar

<Option name="Sidebar labels truncate instead of wrapping">

### Breaking Change

The sidebar is now [resizable](./customization.html#resizable-sidebar), and as part of that change sidebar link, section, and group labels render on a single line with an ellipsis when they overflow, instead of wrapping onto multiple lines. The full label shows in a tooltip on hover.

**Action required:** None for most apps. If your navigation relied on long labels wrapping, either shorten the labels or point users at the drag handle to widen the sidebar.

Hosts with an accessibility conformance obligation can disable the drag handle with [`sidebar_resizable`](./customization-api.html#sidebar_resizable).

</Option>

<Option name="`.container-small` is now `max-width`-based">

### Breaking Change

`.container-small` (the wrapper around show and edit pages) used a fixed width; it now fills its container up to a `max-width` so content adapts when the sidebar is wide. If you override `.container-small`'s `width` from your own stylesheets, the new Avo-owned `max-width` now clamps it — override `max-width` instead.

**Action required:** None unless you override `.container-small`.

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

# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Upgrade to 4.1.11

<Option name="`stacked: false` now opts a field out of sidebar and width stacking">

### Breaking Change

A field declared `stacked: false` used to be ignored in the places Avo stacks on its own — inside a `sidebar`, in the record preview, and on any field with a `width` below `100`. The field's own declaration now wins over those defaults, so such a field renders inline. See [`stacked`](./field-options-api.html#stacked).

### Action Required

**If you never pass `stacked: false`**, nothing changes — the defaults are untouched.

**If you do**, the fields that carry it move from stacked to inline. Drop the option to keep them stacked.

```ruby
# app/avo/resources/user.rb
field :name, as: :text, stacked: false # [!code --]
field :name, as: :text # [!code ++]
```

</Option>

## Upgrade to `avo-calendar` `4.0.3`

<Option name="`+N more` no longer opens the week view">

In the month view, the **+N more** toggle under a crowded day now expands that week row in place to reveal every event, with a **Show less** control to fit it back. It previously navigated to that day's week view. See [Read a crowded day](./calendar-view.html#read-a-crowded-day).

**Action required:** None — the behavior change is visual only, and the week view stays one click away in the header's Month/Week toggle.

</Option>

<Option name="Week view becomes a scrollable time grid">

Hour-based events now stretch to their duration — overlapping events share the day column side by side — instead of rendering as fixed chips on their start hour, and the grid scrolls inside the viewport, opening at 07:00 under a pinned day-header row. See [Month and week views](./calendar-view.html#month-and-week-views).

**Action required:** None — the change is visual only. An event without an `ends_at` renders as a one-hour block.

</Option>

## Upgrade to 4.1.10

<Option name="`code` and `easy_mde` collapse their content on `Show`">

The `code` and `easy_mde` fields now render on the <Show /> view through the same collapsible wrapper the rich text fields use: the value is clipped to a short, faded preview with a **More content** link that expands it and a **Less content** link that collapses it back. They previously rendered the full value.

**Action required:** None unless you want the full value visible on load. Pass `always_show: true` on the field to skip the collapsing:

```ruby
# app/avo/resources/product.rb
field :custom_css, as: :code, always_show: true # [!code ++]
```

See [WYSIWYG & Markdown editors](./fields.html#wysiwyg-markdown-editors) for the behavior every editor field now shares.

</Option>

<Option name="Editors render in a bounded, resizable viewport on forms">

On <Edit /> and <New />, every editor field (`trix`, `rhino`, `lexxy`, `markdown`, `easy_mde`, `tip_tap` and `code`) now renders inside a viewport that opens 20rem tall, scrolls its overflow, and can be dragged taller or shorter by its bottom-end handle. Editors previously grew with their content. Each height is stored in the browser's local storage and restored the next time that form renders.

**Action required:** None. If the default size doesn't suit your content, set the heights globally in a [stylesheet you register with Avo](./asset-manager):

```css
/* app/assets/stylesheets/avo_custom.css */
:root {
  --avo-resizable-editor-default-height: 30rem; /* [!code ++] */
  --avo-resizable-editor-min-height: 15rem; /* [!code ++] */
}
```

Note that the `code` field's [`height`](./fields/code.html#height) option now only applies on the <Show /> view — on forms the viewport's height wins.

</Option>

## Upgrade to 4.1.7

<Option name="`config.visible` now controls Media Library access, not just the menu item">

### Breaking Change

`Avo::MediaLibrary.configuration.visible` used to hide the sidebar item and the rich text editor button while leaving every Media Library route reachable by URL. It is now enforced on the routes as well: a user the block returns `false` for gets a 404 from `/media-library` and `/attach-media`.

This closes [GHSA-cff8-4h3c-9r4q](https://github.com/avo-hq/avo/security/advisories/GHSA-cff8-4h3c-9r4q), where any authenticated Avo user could browse, rename and permanently delete every Active Storage blob in the application.

### Action Required

**If you set `config.visible`**, check that it returns `true` for everyone who is meant to use the Media Library, including through the rich text editors. Anyone it rejects now loses access entirely rather than only losing the menu item.

**If you don't set it**, nothing changes on upgrade — `visible` defaults to `true`. That also means the Media Library stays available to every user who can sign in to Avo, so set it if that isn't what you want:

```ruby
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.visible = -> { Avo::Current.user.is_developer? }
  end
end
```

</Option>


Migrating to TailwindCSS 4? See the [TailwindCSS 4 Migration Guide](./tailwind-4-migration).

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

<Option name="`use_browser_timezone` now defaults to `true`">

### Breaking Change

Server-side dates and times now render in [each visitor's own time zone](./customization.html#time-and-currency) by default instead of the app's `Time.zone`. Avo detects the browser's zone via a cookie; the first page a browser loads soft-reloads once through Turbo and shows a one-time alert that times are now displayed in the visitor's zone.

**Action required:** None if per-visitor times are what you want — most apps do. Displayed values only change for users whose browser zone differs from the app zone; nothing about stored data changes.

Since `4.1.8` the option defaults to `false` in the test environment, so browser/system tests are unaffected — the first-load soft reload would otherwise race them. On `4.1.4` through `4.1.7` it is on in test as well; set `config.use_browser_timezone = !Rails.env.test?` if you stay on one of those and your system specs started flaking.

### Maintaining Previous Behavior

Pin every visitor to the app's configured zone:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.use_browser_timezone = false # [!code ++]
end
```

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

## Upgrade to 4.0.20

<Option name="Sidebar labels truncate instead of wrapping">

### Breaking Change

The sidebar is now [resizable](./customization.html#resizable-sidebar), and as part of that change sidebar link, section, and group labels render on a single line with an ellipsis when they overflow, instead of wrapping onto multiple lines. The full label shows in a tooltip on hover.

**Action required:** None for most apps. If your navigation relied on long labels wrapping, either shorten the labels or point users at the drag handle to widen the sidebar.

Hosts with an accessibility conformance obligation can disable the drag handle. The off-switch was `config.sidebar_resizable` on `4.0.20` and `4.0.21`; from `4.0.22` it moved into the grouped config as [`sidebar[:resizable]`](./customization-api.html#sidebar) and the old name no longer works.

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

# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Upgrade to 4.1.15

<Option name="`container_width` values renamed to Tailwind's scale">

### Deprecation

`config.container_width` (and `self.container_width` on Avo Forms pages and forms) used the
words `:large` and `:small`, while every other size option in Avo uses Tailwind's scale —
`size: :sm`, `width: :xl`, `size: :md`. The widths now use that scale too:

| Before   | After |
| -------- | ----- |
| `:large` | `:lg` |
| `:small` | `:md` |
| `:full`  | `:full` (unchanged) |

`:small` became `:md` rather than `:sm` deliberately: it keeps every existing screen at
the width it already had, and frees the narrower names. A new `:sm` (720px, clamping from
768px) ships in the same release for single-column screens — nothing gets it
automatically, it is opt-in.

### Action Required

**None immediately.** The old names are still accepted and mapped for you — they log a
deprecation warning through `Avo.logger` and will be removed in Avo 5. Update them when
convenient:

```ruby
# config/initializers/avo.rb
config.container_width = :small                     # [!code --]
config.container_width = :md                        # [!code ++]

config.container_width = { index: :large }          # [!code --]
config.container_width = { index: :lg }             # [!code ++]
```

```ruby
# app/avo/pages/settings.rb
self.container_width = :large                       # [!code --]
self.container_width = :lg                          # [!code ++]
```

**If you style Avo's container in your own CSS**, this part is *not* aliased — the emitted
class names changed and your overrides need renaming:

| Before                  | After              |
| ----------------------- | ------------------ |
| `.container-large`      | `.container-lg`    |
| `.container-small`      | `.container-md`    |
| `.container-full-width` | `.container-full`  |

</Option>

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

## Unreleased — `avo-api` API tokens

<Option name="`super` in a `setup_authentication` override now accepts a valid API token">

### Breaking Change

`avo-api` ships [API tokens](./rest-api.html#authentication). The default `setup_authentication` on `BaseResourcesController` used to raise, closing the API until you replaced it. It now **accepts a request carrying a valid API token**, authenticated as that token's owner, and rejects everything else.

That changes what `super` means inside an existing override.

### Action Required

Grep `app/controllers/avo/api/` for `setup_authentication` and check every override that calls `super`. An override that never calls it is unaffected.

Drop the `super` call to opt out of tokens entirely and leave your own scheme in sole charge:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
def setup_authentication
  super # [!code --]
  authenticate_with_my_scheme!
end
```

Keep it to accept tokens alongside your scheme — but note a token then reaches everything its owner reaches, since [a token acts as its owner](./rest-api.html#a-token-acts-as-its-owner).

</Option>

<Option name="`avo-api` now ships a migration">

### Breaking Change

The tokens table is new, and the token resource appears in the Avo sidebar by default as soon as the gem is upgraded — before the table exists.

### Action Required

Install it:

```bash
rails generate avo_api:install
rails db:migrate
```

Until you do, opening the **API tokens** screen, or sending any request with an `Authorization: Bearer …` header, queries a table that isn't there and errors. This is additive to `avo_api:generate`, which still owns the resource controllers.

If you don't want tokens at all, [replace the authentication hook](./rest-api.html#bring-your-own-authentication) so the token lookup never runs.

</Option>

## Unreleased — `avo-api` token scopes

<Option name="A denied policy method answers `403` JSON instead of a `302` redirect">

### Breaking Change

Policy *methods* (`index?`, `update?`, …) returning `false` raise `Avo::NotAuthorizedError`, which Avo handled with a flash message and a redirect to your root URL — right for the HTML panel, unreadable for a JSON client. The API now renders JSON instead:

```json
{ "error": "Forbidden", "reason": "policy" }
```

A [token scope refusal](./rest-api.html#tell-the-three-refusals-apart) is also a `403`, and `reason` is what tells the two apart.

**Action required:** None for most apps — this replaces a redirect no API client could act on. Two cases to check:

- **A client that read the `302` as "denied"** now gets a `403`. One that followed the redirect and parsed the resulting HTML now gets JSON.
- **A `rescue_from Avo::NotAuthorizedError` you added to your own `BaseResourcesController`** still wins over the gem's, so your response shape is unchanged. Delete it to adopt the gem's, or keep it.

</Option>

<Option name="Tokens can now be scoped, and are unrestricted until they are">

### Breaking Change

None — this is additive. Existing tokens carry no grants, and a token with no grants [reaches everything its owner can](./rest-api.html#scope-a-token), exactly as before.

**Action required:** None. Worth knowing before you use it: granting a token *anything* restricts it to what you granted, including against resources you deploy later, and removing the last grant leaves a token that refuses everything rather than one that is unscoped again. **Make unrestricted** in the token's **Scopes** panel is the way back.

Editing scopes is gated by an `edit_scopes?` policy method, which — like every other token policy method — [answers yes when no authorization client is configured](./rest-api.html#who-may-change-scopes).

</Option>

## Upgrade to `avo-dashboards` and `avo-scopes` `4.1.2`

<Option name="Cards, dashboards, and scopes resolve their labels from locale keys first">

### Breaking Change

Cards, dashboards, and scopes now derive an i18n key from their class path and look it up **before** falling back to the class attribute, the same way [resources and actions](./i18n.html#how-avo-resolves-a-label) already did:

| Class     | Key Avo looks up                       | Options under it                          |
| --------- | -------------------------------------- | ----------------------------------------- |
| Card      | `avo.card_translations.<class_path>`      | `label`, `description`, `discreet_description` |
| Dashboard | `avo.dashboard_translations.<class_path>` | `name`, `description`                     |
| Scope     | `avo.scope_translations.<class_path>`     | `name`, `description`                     |

If your locale files already define one of those keys, it now wins over `self.label`, `self.name`, or `self.description` — **including when the attribute is a lambda**. The lambda isn't called at all, so anything it computed is dropped, with nothing in the logs.

:::warning A lambda that reads the same key stops running
This bites hardest when the attribute builds a string around the very key Avo now derives:

```ruby
# app/avo/cards/upcoming_metric.rb
self.description = -> {
  I18n.t("avo.card_translations.upcoming_metric.description") + " (#{timeframe})"
}
```

Avo finds `avo.card_translations.upcoming_metric.description`, renders it verbatim, and the ` (#{timeframe})` suffix disappears.
:::

### Action Required

**Grep your locale files** for `card_translations`, `dashboard_translations`, and `scope_translations`. Avo ships nothing under those roots, so if you weren't using them there's nothing to do — a missing key still falls through to your class attribute exactly as before.

If you were using them for your own `I18n.t` lookups, pick one of the three ways out below.

### Steps to Update

**1. Move your own key out of the derived namespace.** The cleanest fix when the class attribute has to keep computing something:

```yaml
# config/locales/avo.en.yml
en:
  avo:
    card_translations:
      upcoming_metric:
        description: Forecasted revenue based on current bookings # [!code --]
        description_text: Forecasted revenue based on current bookings # [!code ++]
```

```ruby
# app/avo/cards/upcoming_metric.rb
self.description = -> {
  I18n.t("avo.card_translations.upcoming_metric.description") + " (#{timeframe})" # [!code --]
  I18n.t("avo.card_translations.upcoming_metric.description_text") + " (#{timeframe})" # [!code ++]
}
```

**2. Point Avo's lookup somewhere else.** `self.translation_key` moves the derived key and leaves your own `I18n.t` call untouched:

```ruby
# app/avo/cards/upcoming_metric.rb
class Avo::Cards::UpcomingMetric < Avo::Cards::MetricCard
  self.translation_key = "avo.card_translations.upcoming_metric_chrome" # [!code ++]
end
```

**3. Override at the registration site.** A value passed to `card` beats the locale key, so one registration can keep a computed description while the others stay translated:

```ruby
# app/avo/dashboards/dashy.rb
card Avo::Cards::UpcomingMetric, description: -> { "#{I18n.t("...")} (#{timeframe})" }
```

Actions have no registration site, so only the first two apply there — see [Upgrade to 4.0.17](#upgrade-to-4-0-17).

See [the key map](./i18n.html#key-map) for every key Avo derives.

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

## Upgrade to 4.0.17

<Option name="Action labels resolve from `avo.action_translations` first">

### Breaking Change

Actions now look up `avo.action_translations.<class_path>.{name,message,confirm_button_label,cancel_button_label,description}` **before** falling back to `self.name`, `self.message`, `self.confirm_button_label`, `self.cancel_button_label`, and `self.description`, mirroring how resources already resolved their names.

If your locale files already define one of those keys, it now wins over the class attribute — **including when the attribute is a lambda**, which is then never called, so anything it computed is dropped with nothing in the logs.

### Action Required

**Grep your locale files for `action_translations`.** Avo ships nothing under that root, so if you weren't using it nothing changes: an action with no key still renders its class attribute, and an action with neither still renders its humanized class name.

### Steps to Update

If a key you own collides with an action's derived key, either rename your key, or point Avo's lookup elsewhere with `self.translation_key`:

```ruby
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.translation_key = "avo.action_translations.toggle_inactive_chrome" # [!code ++]
end
```

`avo-dashboards` and `avo-scopes` got the same treatment in their `4.1.2` releases — see [that section](#upgrade-to-avo-dashboards-and-avo-scopes-4-1-2).

See [Localizing actions](./i18n.html#localizing-actions) for the full picture.

</Option>

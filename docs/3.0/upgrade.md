# Upgrade guide

We'll update this page when we release new Avo 3 versions.

If you're looking for the Avo 2 to Avo 3 upgrade guide, please visit [the dedicated page](./avo-2-avo-3-upgrade).

## Upgrade from 3.10.6 to 3.10.7
:::option Boolean field

In versions lower than <Version version="3.10.6" />, boolean fields with a `nil` value were represented by a red X, which could be misleading. <VersionReq version="3.10.7" /> when a boolean field has a `nil` value, it is displayed with a dash (`—`) instead of a red X.
:::

<!-- ## Rails 8 support -->

<!-- TODO: add ransack custom repo mention here -->
## Upgrade from 3.9.2 to 3.10
Deprecated [`fetch_labels`](fields/tags#fetch_labels) option in favor of [`format_using`](fields/tags#format_using) on tags field.

## Upgrade from 3.9.1 to 3.9.2

We tweaked the way `locales` and i18n work with Avo.
In theory nothing should change in your setup, but please read [the guide](./i18n) once more to see how it works.

## Upgrade from 3.7.4 to 3.9.1

:::warning Update to Rails 7.2 or greater
Rails 7.1 has a [bug](https://github.com/rails/rails/issues/51910) ([explanation](https://github.com/avo-hq/avo/issues/2844)) which would break path helpers for nested mounted engines.
:::

### Steps to update

1. Update `avo`, `avo-pro`, or `avo-advanced` to version `3.9.1`
2. Update `rails` to at least `7.2.0.beta2` (or greater when available)
3. Run `bundle update rails avo-advanced`

```ruby
# Gemfile

# Use Rails 7.2 or greater
gem "rails", ">= 7.2.0.beta2"

# or

# You can also run off `main`
gem "rails", github: "rails/rails", branch: "main"

# Update Avo
gem "avo-advanced", ">= 3.9.1"

# Use `ransack` for searching
gem "ransack"

# This version of acts-as-taggable-on is compatible with
# Follow this PR to get the fix in the library
# https://github.com/mbleigh/acts-as-taggable-on/pull/1126
gem "acts-as-taggable-on", github: "avo-hq/acts-as-taggable-on"
```

```bash
bundle update rails avo-advanced
```

## Skip versions 3.8.x and 3.9.0

From Avo 3.7.4 you should update straight to `3.9.1`.
The other intermediary versions introduced a bug when we tried to improve support for Rails 7.1+

More on that on this [issue](https://github.com/avo-hq/avo/issues/2844).

## Upgrade from 3.6.1 to 3.6.2

:::option Cache
From version `3.6.1` to version `3.6.2` table cache logic suffered some changes. Old cached table may break with this change, we recommend to clear cache on production after upgrade (`Rails.cache.clear`).

Versions `3.6.2` / `3.6.3` have some issues around cache, we recommend to upgrade directly to `3.6.4`.
:::

## Upgrade from 3.5.4 to 3.5.5
:::option Record errors
With version `3.5.5` we introduced a stricter error check. Now when the record has any error attached the save action will fail automatically. This allow you to do things like:

```ruby
before_update do
  if validation_fail?
    errors.add(:field_id, "Error message")
  end
end
```

:::

## Upgrade from 3.4.2 to 3.4.3
:::option `turbo` configuration
In version `3.4.2` we introduced turbo configuration with `instantclick` option. We decided that `instant_click` is a more appropriate name.

```ruby
config.turbo = {
  instantclick: true  # [!code --]
  instant_click: true # [!code ++]
}
```
:::

## Upgrade from 3.4.1 to 3.4.2
:::option Basic Filters URL param changed to `encoded_filters`
When we added the [Dynamic Filters](./dynamic-filters) feature, by mistake we introduced a bug where you couldn't use the [Basic](./basic-filters) and [Dynamic Filters](./dynamic-filters) together because they are both using the `filters` URL param.

This is not what we intended.

To fix this we are changing the URL param of the Basic Filters from `filters` to `encoded_filters` so now you can have a URL with both filters.

```md
# Before
https://example.com/avo/resources/users?filters[first_name][contains][]=Jason&page=1&filters=eyJBdm86OkZpbHRlcnM6OklzQWRtaW4iOlsiYWRtaW5zIl19

# After
https://example.com/avo/resources/users?filters[first_name][contains][]=Jason&page=1&encoded_filters=eyJBdm86OkZpbHRlcnM6OklzQWRtaW4iOlsiYWRtaW5zIl19
```
### What to do?

If you have hardcoded links where you reference the `filters` param, change that to `encoded_filters`.
These links might be in Tools, Resource Tools, Menu Items, or regular view partials (yes, basically anywhere you might have added them 🫤).

A quick search through your codebase should reveal them.
:::

:::option Add `active_record_extended` gem to your `Gemfile`
In order to extend Avo's filtering capabilities for arrays and tags fields, we use the [`active_record_extended`](https://github.com/GeorgeKaraszi/ActiveRecordExtended) gem.

This gem uses postgres and was breaking for those who use any other database like `sqlite`.

If you want to keep `Contained in` option on arrays and tags filters you should include the `active_record_extended` gem to your `Gemfile`.
:::

:::option Multiple action flux
First iteration of multiple action flux was using `redirect_to` with `turbo_frame: "actions_show"`. With the update to turbo 8 the redirect was giving some troubles and we decided that is time to improve this experience with a proper response type, [`navigate_to_action`](actions.html#navigate_to_action).

If you have a multiple action flux implemented with `redirect_to` you should change it to [`navigate_to_action`](actions.html#navigate_to_action).
:::

:::option Action `link_arguments` method
Action `link_arguments` method handles the `arguments` encoding and encryption internally now so you only need to pass the `arguments` as a hash and the returned `path` will already include the encoded arguments.

```ruby{20,21,22,23,25}
field :name,
  as: :text,
  filterable: true,
  name: "name (click to edit)",
  only_on: :index do

  arguments = Base64.encode64 Avo::Services::EncryptionService.encrypt( # [!code --]
    message: {                                                          # [!code --]
      cities: Array[resource.record.id],                                # [!code --]
      render_name: true                                                 # [!code --]
    },                                                                  # [!code --]
    purpose: :action_arguments                                          # [!code --]
  )                                                                     # [!code --]

  arguments = {                                                         # [!code ++]
    cities: Array[resource.record.id],                                  # [!code ++]
    render_name: true                                                   # [!code ++]
  }                                                                     # [!code ++]

  path, data = Avo::Actions::City::Update.link_arguments(
    resource: resource,
    arguments: arguments
  )

  link_to resource.record.name, path, data: data
end
:::

:::option `resource.record` or `record` as `nil` on visibility blocks
You may notice that `resource.record == nil` on some visibility blocks. That happens when evaluating the field visibility to render header columns. On index, there is no record.

This is a consequence of a bug fix where `resource.record` was wrongly storing the last record of the index table.

Check [this discussion](https://github.com/avo-hq/avo/issues/2544) for more details
:::

## Upgrade from 3.3.0 to 3.4.0

Ruby 3.0 is end-of-life and we pushed some code that only works with Ruby 3.1.

## Upgrade from 3.2.2 to 3.3.0
:::option `may_download_file` deprecated
Actions now fully operate with turbo leading to the deprecation of `may_download_file` option. It can be safely removed from all actions.
:::

:::option Status field `failed_when` and `loading_when` default to and empty array
We found [some issues](https://github.com/avo-hq/avo/pull/2316) with declaring defaults to `failed_when` and `loading_when` field options so we are now defaulting them to empty arrays.

If you need that behavior back, add it to your fields.

```ruby{3,4}
field :status,
  as: :status,
  failed_when: [:failed],
  loading_when: [:waiting, :running]
```
:::

:::option Scopes namespace change
Scopes changed namespace from `Avo::Pro::Scopes` to `Avo::Advanced::Scopes`.
:::

:::option TailwindCSS integration
The symlink generated by `avo:sym_link` task was renamed from `tmp/avo/base.css` to `tmp/avo/avo.base.css`. If your application has the TailwindCSS integration generated before Avo `3.3.0` you should replace `@import '../../../../tmp/avo/base.css';` with `'../../../../tmp/avo/avo.base.css';` in `app/assets/stylesheets/avo/avo.tailwind.css`.

```css
/* app/assets/stylesheets/avo/avo.tailwind.css */

@import '../../../../tmp/avo/base.css'; // [!code --]
@import '../../../../tmp/avo/avo.base.css'; // [!code ++]
```
:::

## Upgrade from 3.1.3 to 3.1.4

:::option `Avo::Filters::BaseFilter.decode_filters`
We removed the rescue that would return `{}` on parsing error. This rescue block was occasionally concealing pertinent errors. Ensure that when invoking `Avo::Filters::BaseFilter.decode_filters` the argument is not `nil` and has been encoded using the `Avo::Filters::BaseFilter.encode_filters` method.
:::

## Upgrade from 3.0.1.beta24 to 3.0.2

:::option Sidebar should be declared inside a panel
We introduced the `main_panel` option and also refactored the way that fields are fetched from the resource, now we allow multiple sidebars per panel but each sidebar should be defined inside a `panel` or `main_panel` block.

We suggest to read [panels](resource-panels) and [sidebars](resource-sidebar) sections for more information and to be aware of the new possibilities.
:::

:::option Dashboards visibility and authorization
Previously, if the `visible` attribute was set to `false` on dashboards, visiting them was impossible because the controller would trigger a "Not found" error. In cases where `authorize` returned `false`, the controller would block access but still keep the dashboard visible.

This behavior has been enhanced. Now, even if `visible` is set to `false`, the dashboard remains accessible but won't appear in the menu. Additionally, if `authorize` returns `false`, the dashboards are now hidden.
:::

:::option Actions
We've internally implemented some changes around actions to resolve certain bugs. No action is needed from your end, but if you happen to notice any anomalies in the actions flow, please get in touch with us so we can address them promptly. Thank you.
:::

:::option Attachments eager load

Attachments are no longer automatically eager loading. If you want to eager load attachments there are at least two ways:

### Use [`self.includes`](resources.html#self_includes) option

```ruby
class Avo::Resources::PhotoComment < Avo::BaseResource
  self.includes = [:user, [photo_attachment: :blob]]

  def fields
    field :user, as: :belongs_to
    field :photo, as: :file, is_image: true
  end
```

### Use [`self.index_query`](customization.html#custom-scope-for-index-page) option
```ruby
class Avo::Resources::Product < Avo::BaseResource
   self.index_query = -> {
    query.includes image_attachment: :blob
  }

  def fields
    field :image, as: :file, is_image: true
  end
```

:::

## Upgrade from 3.0.1.beta23 to 3.0.1.beta24

:::option Cards
With the new feature that allow [cards on resources](resources.html#cards)  we've realized that it's no longer logical to retain cards within the `Dashboard` namespace scope. Consequently, each card is now located within the `Avo::Cards` namespace.

```ruby
# Before
class Avo::Cards::AmountRaised < Avo::Dashboards::MetricCard
class Avo::Cards::ExampleAreaChart < Avo::Dashboards::ChartkickCard
class Avo::Cards::ExampleBarChart < Avo::Dashboards::ChartkickCard
# ...

# After
class Avo::Cards::AmountRaised < Avo::Cards::MetricCard
class Avo::Cards::ExampleAreaChart < Avo::Cards::ChartkickCard
class Avo::Cards::ExampleBarChart < Avo::Cards::ChartkickCard
# ...

```
:::


## Upgrade from 3.0.1.beta22 to 3.0.1.beta23
:::option Caching
Since there are many available cache stores and we were allowing only few we changed the way of computing the cache store to be used by Avo.

One of our concerns was to maintain the status quo, but if you notice any caching issues there is a new configurable option [`config.cache_store`](cache#custom-selection) that allows you to tell Avo what `cache_store` to use.

Check [cache page](cache) for more details.
:::

## Upgrade from 3.0.1.beta8 to 3.0.1.beta9
:::option Heading as field
Heading option changed declaration mode, one of the main reasons for this change is to be able to generate a clear `data-field-id` on the DOM

For more information about `heading` field syntax check [`heading` field's documentation](./fields/heading).
::: code-group
```ruby [Before]
heading "personal information"
heading "contact"
heading '<div class="underline uppercase font-bold">DEV</div>', as_html: true
```

```ruby [After]
field :personal_information, as: :heading       # data-field-id == "personal_information"
field :heading, as: :heading, label: "Contact"  # data-field-id == "heading"
field :dev, as: :heading, as_html: true, label: '<div class="underline uppercase font-bold">DEV</div>'
```
:::

:::option Badge field `secondary` option renamed to `neutral`
We believe that the term `neutral` better reflects the intended use.
::: code-group
```ruby {8} [Before]
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: "on hold",
    danger: :cancelled,
    secondary: :drafting
  }
```

```ruby {8} [After]
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: "on hold",
    danger: :cancelled,
    neutral: :drafting
  }
```
:::

:::option Rename `link_to_resource` to `link_to_record`
`link_to_resource` was renamed to `link_to_record`.
::: code-group
```ruby {3-4} [Before]
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_resource: true
    field :email, as: :gravatar, link_to_resource: true
  end
end
```

```ruby {3-4} [After]
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :gravatar, link_to_record: true
  end
end
```
:::

## Upgrade from 3.0.1.beta5 to 3.0.1.beta6

:::option The status field changed behavior
Before, for the status you'd set the `failed` and `loading` states and everything else fell under `success`. That felt unnatural. We needed a `neutral` state.
Now we changed the field so you'll set the `failed`, `loading`, and `success` values and the rest fall under `neutral`.

```ruby
# Before
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading

# After
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading
  success_when: :deployed # specify the success state
```
:::

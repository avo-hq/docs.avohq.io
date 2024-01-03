# Upgrade guide

We'll update this page when we release new Avo 3 versions.

If you're looking for the Avo 2 to Avo 3 upgrade guide, please visit [the dedicated page](./avo-2-avo-3-upgrade).

## Upgrade from 3.2.2 to 3.3.0
:::option `may_download_file` deprecated
Actions now fully operate with turbo leading to the deprecation of `may_download_file` option. It can be safelly removed from all actions.
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

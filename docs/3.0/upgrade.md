# Upgrade guide

We'll update this page when we release new Avo 3 versions.

If you're looking for the Avo 2 to Avo 3 upgrade guide, please visit [the dedicated page](./avo-2-avo-3-upgrade).

## Upgrade from 3.0.1.beta23 to 3.0.1.beta24

:::option Actions
We've internally implemented some changes around actions to resolve certain bugs. No action is needed from your end, but if you happen to notice any anomalies in the actions flow, please get in touch with us so we can address them promptly. Thank you.
:::

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

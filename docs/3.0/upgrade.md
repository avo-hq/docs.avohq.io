# Upgrade guide

We'll update this page when we release new Avo 3 versions.

If you're looking for the Avo 2 to Avo 3 upgrade guide, please visit [the dedicated page](./avo-2-avo-3-upgrade).

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

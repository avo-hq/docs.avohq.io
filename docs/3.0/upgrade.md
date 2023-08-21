# Upgrade guide

We'll update this page when we release new Avo 3 versions.

If you're looking for the Avo 2 to Avo 3 upgrade guide, please visit [the dedicated page](./avo-2-avo-3-upgrade).

## Upgrade from 3.0.1.beta7 to 3.0.1.beta8

:::option `view` change class from `Symbol` to `Avo::ViewInquirer`
The `view` object available across the code, that was a `Symbol` become a `Avo::ViewInquirer`. We're happy about this change as it enables us to assess the view using `view.show?` instead `view == :show`. Unfortunately we couldn't keep the value of the view as `Symbol` that means that it is necessary to update all validations that involve comparing the view to a symbol.

```ruby
# Before
if view == :show
  # ...
end

# After
if view.show?
  # ...
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

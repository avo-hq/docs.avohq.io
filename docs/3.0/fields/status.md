---
version: '1.0'
license: community
---

# Status

Displays the status of a record in three ways; `loading`, `failed`, `success`, or `neutral`.

You may select the `loading`, `failed`, and `success` state values, and everything else will fall back to `neutral`.

```ruby
field :progress,
  as: :status,
  failed_when: [:closed, :rejected, :failed],
  loading_when: [:loading, :running, :waiting, "in progress"],
  success_when: [:done],
```

<img :src="('/assets/img/fields/status.png')" alt="Status field" class="border mb-4" />

## Options

:::option `failed_when`
Set the values for when the status is `failed`.

#### Default value

`[]`

#### Possible values

`[:closed, :rejected, :failed]` or an array with strings or symbols that indicate the `failed` state.
:::

:::option `loading_when`
Set the values for when the status is `loading`.

#### Default value

`[]`

#### Possible values

`[:loading, :running, :waiting, "in progress"]` or an array with strings or symbols that indicate the `loading` state.
:::

:::option `success_when`
Set the values for when the status is `success`.

#### Default value

`[]`

#### Possible values

`[:done, :success, :deployed, "ok"]` or an array with strings or symbols that indicate the `success` state.
:::

:::option `neutral_when`
Set the values for when the status is `neutral`.

#### Default value

`[]`

#### Possible values

`[:holding, "waiting"]` or an array with strings or symbols that indicate a `neutral` state.
:::



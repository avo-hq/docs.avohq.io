---
license: community
description: "The Status field renders a colored indicator on index and show views — loading, failed, success, or neutral."
fieldTags: [display]
---

# Status

The `Status` field renders a colored indicator on index and show views — `loading`, `failed`, `success`, or `neutral`.

Map your values with [`failed_when`](#failed_when), [`loading_when`](#loading_when), and [`success_when`](#success_when). Anything not listed in those arrays falls back to `neutral`.

```ruby
field :status,
  as: :status,
  failed_when: [:failed],
  loading_when: [:running, :pending],
  success_when: [:done, :success]
```

Each row in the table uses one of these values. `archived` is not listed in any array, so it falls back to `neutral`.

<Image src="/assets/img/4_0/fields/status/index.webp" dark-src="/assets/img/4_0/fields/status/index-dark.webp" width="1776" height="782" alt="An Avo index table with ID, Name, Status and Stage columns where Status rows show loading, pending, failed, success and neutral indicators and Stage rows show colored badges." prompt="index table with ID, Name and Status columns showing loading, failed, success and neutral status states" />

## Options

<Option name="`failed_when`">

Set the values for when the status is `failed`.

#### Default value

`[]`

#### Possible values

`[:closed, :rejected, :failed]` or an array with strings or symbols that indicate the `failed` state.
</Option>

<Option name="`loading_when`">

Set the values for when the status is `loading`.

#### Default value

`[]`

#### Possible values

`[:loading, :running, :waiting, "in progress"]` or an array with strings or symbols that indicate the `loading` state.
</Option>

<Option name="`success_when`">

Set the values for when the status is `success`.

#### Default value

`[]`

#### Possible values

`[:done, :success, :deployed, "ok"]` or an array with strings or symbols that indicate the `success` state.
</Option>

<Option name="`neutral_when`">

Set the values for when the status is `neutral`.

#### Default value

`[]`

#### Possible values

`[:holding, "waiting"]` or an array with strings or symbols that indicate a `neutral` state.
</Option>

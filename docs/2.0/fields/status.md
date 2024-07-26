---
version: '1.0'
license: community
---

# Status

Displays the status of a record in three ways; `loading`, `failed`, or `success`.

You may select the `loading` and the `failed` state values, and it will fall back to `success`.

```ruby
field :progress,
  as: :status,
  failed_when: [:closed, :rejected, :failed],
  loading_when: [:loading, :running, :waiting, "in progress"]
```

<img :src="('/assets/img/fields/status.png')" alt="Status field" class="border mb-4" />

## Options

<Option name="`failed_when`">
Set the values for when the status is `failed`.

#### Default value

`[:failed]`

#### Possible values

`[:closed, :rejected, :failed]` or an array with strings or symbols that indicate the `failed` state.
</Option>

<Option name="`loading_when`">
Set the values for when the status is `loading`.

#### Default value

`[:waiting, :running]`

#### Possible values

`[:loading, :running, :waiting, "in progress"]` or an array with strings or symbols that indicate the `loading` state.
</Option>



---
license: community
outline: [2, 3]
guide: ./status.html
prev:
  text: "Status"
  link: "./status.html"
next: false
---

# Status API

Per-option reference for the status field. For worked examples, see the [Status guide](./status.html).

Pass these options to the field declaration in an Avo resource's `fields` method:

```ruby
field :status, as: :status, failed_when: [:failed]
```

For shared options, see [Common field options](../field-options.html).

## Indicator mappings

Mappings compare the record's value as a symbol. Strings and symbols match equivalently, but matching is case-sensitive. Blank values and unmatched values resolve to neutral. When mappings overlap, precedence is success, then loading, then failure. The record's value remains the displayed label.

:::warning Value coercion
Nonblank mappings are flattened and each entry is converted with `to_sym`. Nonblank record values are also converted with `to_sym` when resolving the indicator. Values that do not support `to_sym`, such as integers, raise `NoMethodError`; mappings do not validate model values or restrict form input.
:::

<Option name="`failed_when`">

Values that display the failure icon, unless a loading or success mapping also matches.

```ruby
field :status, as: :status, failed_when: [:closed, :rejected, :failed]
```

- **Type:** `Array` of `String` or `Symbol`; a single `String` or `Symbol` is also accepted.
- **Default:** `[]`

</Option>

<Option name="`loading_when`">

Values that display a loading spinner, unless a success mapping also matches.

```ruby
field :status, as: :status, loading_when: [:loading, :running, :waiting, "in progress"]
```

- **Type:** `Array` of `String` or `Symbol`; a single `String` or `Symbol` is also accepted.
- **Default:** `[]`

</Option>

<Option name="`success_when`">

Values that display the success icon. This mapping takes precedence over all other mappings.

```ruby
field :status, as: :status, success_when: [:done, :success, :deployed, "ok"]
```

- **Type:** `Array` of `String` or `Symbol`; a single `String` or `Symbol` is also accepted.
- **Default:** `[]`

</Option>

## Filter options

<Option name="`neutral_when`">

Additional values included in `options_for_filter`, alongside the failure, loading, and success values. The combined list is deduplicated. This option does not affect indicator selection: neutral is the fallback, and this list does not override other mappings.

```ruby
field :status, as: :status, neutral_when: [:holding, "waiting"]
```

- **Type:** `Array` of `String` or `Symbol`; a single `String` or `Symbol` is also accepted.
- **Default:** `[]`

</Option>

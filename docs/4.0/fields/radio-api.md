---
license: community
outline: [2, 3]
guide: ./radio.html
prev:
  text: "Radio"
  link: "./radio.html"
next: false
---

# Radio API

Per-option reference for the Radio field. For tasks and examples, see the [Radio guide](./radio.html).

Pass these options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/user.rb`:

```ruby
field :role, as: :radio, options: { admin: "Administrator", writer: "Writer" }
```

For options shared by all fields, including `default`, visibility, and help text, see [Field options](../field-options.html).

## Define choices

<Option name="`options`">

The available choices, with submitted values as keys and visible labels as values. Index and Show look up the stored value in this hash with indifferent access for string and symbol keys; a missing or falsey label falls back to the stored value. A `nil` field value displays a dash.

```ruby
field :role, as: :radio, options: { admin: "Administrator", writer: "Writer" }
```

- **Type:** `Hash`, or `Proc` / `Lambda` returning a `Hash`.
- **Default:** `{}`
- **Context:** Callable options run in `Avo::ExecutionContext` with `record`, `resource`, `view`, and `field`.
- **Validation:** No explicit type validation. Forms iterate the result with `each`; label lookup calls `with_indifferent_access`, so the result must support those operations.

On forms, a choice is checked when the field value matches either its key or its label after conversion to strings. A `nil` value checks no choice. This also applies to values supplied through the shared [`default`](../field-options-api.html#default) option. Both form styles always submit the key, even when the current value matched a label.

:::warning Choice shape
Reversing keys and labels changes what is submitted. Integer keys remain integers during label lookup; they do not match stored strings such as `"1"`, even though form checked-state matching compares strings. A callable must return a hash, not `nil`.
:::

</Option>

## Control presentation

<Option name="`display_as`">

Selects the form control's appearance. Both styles use radio inputs and submit the option key. Index and Show are unchanged.

```ruby
field :role, as: :radio, display_as: :tabs, options: { admin: "Administrator", writer: "Writer" }
```

| Value | Behavior |
| --- | --- |
| `:radio` | Standard radio buttons. |
| `:tabs` | Tab-style switcher. |

- **Type:** `Symbol`
- **Default:** `:radio`
- **Values:** `:radio`, `:tabs`
- **Validation:** No enum validation. Only the symbol `:tabs` enables tabs; all other values, including the string `"tabs"`, render standard radio buttons. `nil` and `false` fall back to `:radio`.

</Option>

<Option name="`display_value`">

Displays the stored field value on Index and Show instead of looking up its label in `options`. Form labels and submitted values are unchanged. A `nil` value still displays a dash.

```ruby
field :role, as: :radio, display_value: true, options: { admin: "Administrator", writer: "Writer" }
```

- **Type:** `Boolean`
- **Default:** `false`

:::warning Ruby truthiness
This option uses Ruby truthiness, not Boolean string parsing. Only `false` and `nil` disable it; values such as `"false"` and `0` enable it.
:::

</Option>

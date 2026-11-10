---
license: community
outline: [2, 3]
guide: ./badge.html
prev:
  text: "Badge"
  link: "./badge.html"
next: false
---

# Badge API

Per-option reference for the `badge` field; for tasks and worked examples, see the [Badge guide](./badge.html).

Options are passed to the field declaration in a resource's `fields` method, for example in `app/avo/resources/project.rb`:

```ruby
field :status, as: :badge,
  options: { success: "Done" },
  style: "subtle",
  icon: "heroicons/outline/check-circle"
```

Shared visibility, formatting, tooltip, and persistence settings are documented in [Field options](../field-options.html).

## Color mapping

<Option name="`options`">

Maps colors to stored values. Values are compared as strings, so `:done` and `"done"` match the same status. Matching is case-sensitive; the first matching entry wins.

```ruby
field :status, as: :badge,
  options: { success: ["Done", :completed], warning: :pending, violet: "Idea" }
```

| Value | Behavior |
| --- | --- |
| `neutral`, `success`, `danger`, `warning`, `info` | Semantic badge colors |
| `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose` | Base badge colors |

- **Type:** `Hash` with String or Symbol color keys and String, Symbol, or Array values.
- **Default:** `{}`
- **Values:** Color keys from the table above, with each mapped value representing a stored field value.
- **Fallback:** Blank or unmatched field values render with `neutral`; unsupported color keys also render with `neutral`.
- **Form choices:** When visible on forms, the select contains distinct nonblank mapped values as strings, plus the record's current value if absent, and a blank option.

:::info Mapping direction
Keys are colors, not stored values or display labels. The badge displays the field value as its label, and the form select uses stored values as labels too.
:::

</Option>

## Appearance

<Option name="`style`">

Controls the badge's background and text treatment. A lambda can return the style for each record.

```ruby
field :status, as: :badge, style: "solid"
```

| Value | Behavior |
| --- | --- |
| `"subtle"` or `:subtle` | Tinted background with colored text |
| `"solid"` or `:solid` | Stronger colored background with contrasting text |

- **Type:** `String`, `Symbol`, or `Proc` / lambda returning a style.
- **Default:** `"subtle"` (when omitted or the evaluated value is `nil` or `false`).
- **Values:** `subtle` and `solid`, as strings or symbols.
- **Validation:** Blank or unsupported styles render as `subtle` rather than raising an error.
- **Context:** Evaluated in an [ExecutionContext](../execution-context.html) with `record`, `resource`, `view`, and `field`.

</Option>

<Option name="`icon`">

Adds an icon before the badge label. A lambda can return an icon name for each record. No icon renders when the evaluated value is blank.

```ruby
field :status, as: :badge, icon: "heroicons/outline/check-circle"
```

- **Type:** `String` or `Proc` / lambda returning an icon name or `nil`.
- **Default:** `nil`
- **Values:** An icon name such as `"heroicons/outline/check-circle"`; see [Icons](../icons.html).
- **Context:** Evaluated in an [ExecutionContext](../execution-context.html) with `record`, `resource`, `view`, and `field`.

</Option>

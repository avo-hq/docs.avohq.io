---
license: community
outline: [2, 3]
guide: ./tags.html
prev:
  text: "Tags field"
  link: "./tags.html"
next: false
---

# Tags field API

Per-option reference for the `tags` field. For setup and worked examples, see the [Tags field guide](./tags.html).

Options are passed to the field declaration in your resource's `fields` method, for example in `app/avo/resources/course.rb`:

```ruby
field :skills, as: :tags, suggestions: %w(Ruby Rails)
```

Shared options, including `format_using` and the view-specific formatters, are documented in [Common field options](../field-options.html).

## Suggestions and restrictions

<Option name="`suggestions`">

The choices displayed in the dropdown. Hash entries separate the stored value from its label and optionally include an avatar URL. On index and show, hash suggestions also resolve stored values to labels.

```ruby
field :skills, as: :tags, suggestions: -> { record.skill_suggestions }
```

- **Type:** `Array` of `String` values or hashes with symbol keys `value`, `label`, and optional `avatar`; or `Proc` / `Lambda` returning that array.
- **Default:** `[]`.
- **Context:** Evaluated in an [ExecutionContext](../execution-context.html) with `record` explicitly provided, plus the standard request and view helpers. `resource` and `view` are not explicitly supplied by this option.
- **Validation:** No Ruby-side shape validation; the result must be an array compatible with the tag input.

When `enforce_suggestions` is false, existing field values are also included among the editable choices.

</Option>

<Option name="`enforce_suggestions`">

Restricts the browser input to suggested values.

```ruby
field :skills, as: :tags, suggestions: %w(Ruby Rails), enforce_suggestions: true
```

- **Type:** `Boolean`.
- **Default:** `false`.
- **Validation:** Only literal `true` enables the option. This is a browser restriction, not server-side validation of submitted values.

</Option>

<Option name="`disallowed`">

Values rejected by the browser input, independently of whether new tags are allowed.

```ruby
field :skills, as: :tags, disallowed: %w(not that)
```

- **Type:** `Array` of `String` values, or `Proc` / `Lambda` returning that array.
- **Default:** `[]`.
- **Context:** Evaluated in an `ExecutionContext` with `record` explicitly provided.
- **Validation:** Forwarded to the browser's blacklist; Avo does not reject these values during server-side assignment.

</Option>

<Option name="`suggestions_max_items`">

The maximum number of suggestions displayed at once. Other matching items remain available when the search is narrowed.

```ruby
field :skills, as: :tags, suggestions: %w(one two three), suggestions_max_items: 2
```

- **Type:** `Integer`.
- **Default:** `nil` in Ruby; the browser controller defaults to `20` when omitted.
- **Validation:** No Ruby-side range validation; forwarded as a number to the dropdown.

</Option>

<Option name="`close_on_select`">

Whether selecting a suggestion closes the dropdown.

```ruby
field :skills, as: :tags, suggestions: %w(Ruby Rails), close_on_select: true
```

- **Type:** `Boolean`.
- **Default:** `false`.
- **Validation:** Only literal `true` enables the option.

</Option>

## Input and storage

<Option name="`delimiters`">

Separators that turn typed text into tags. The first delimiter also joins plain-string tags in the submitted input and splits that string on assignment outside select mode.

```ruby
field :skills, as: :tags, delimiters: [",", " "]
```

- **Type:** `Array` of `String` values.
- **Default:** `[","]`.
- **Validation:** Avo does not restrict entries to commas and spaces or validate the array's contents.

:::warning Pattern syntax
Entries are joined with `|` and forwarded to Tagify as a delimiter pattern, not escaped as literal characters. Regular-expression metacharacters affect matching. An empty array also removes the first separator used for plain-string serialization.
:::

</Option>

<Option name="`mode`">

Switches between multiple tags and a single selected value.

```ruby
field :primary_skill, as: :tags, suggestions: %w(Ruby Rails), mode: :select
```

| Value | Behavior |
| --- | --- |
| `nil` | Normal tags input; submitted strings are split into an array. |
| `:select` or `"select"` | Single-value selection; submitted strings are assigned without delimiter splitting. |

- **Type:** `Symbol`, `String`, or `nil`.
- **Default:** `nil`.
- **Values:** `nil`, `:select`, or `"select"`.
- **Validation:** No explicit enum validation; other nonblank values are forwarded to Tagify and are not a supported mode.

</Option>

<Option name="`acts_as_taggable_on`">

The tagging context configured on the model. Existing tag objects are displayed by name. Assignment uses the field ID's singular form followed by `_list=` (for example, `:tags` writes through `tag_list=`).

```ruby
field :tags, as: :tags, acts_as_taggable_on: :tags
```

- **Type:** `Symbol`, `String`, or `nil`.
- **Default:** `nil`.
- **Values:** A tagging context supported by the model, with a matching field ID.
- **Validation:** No explicit context validation. The model must provide the tagging association, `tag_list_on`, and the corresponding list writer.

</Option>

## Remote search

<Option name="`fetch_values_from`">

URL used to fetch suggestions as the user types. Requests include the search text as the `q` query parameter; the response is parsed as JSON and used as the dropdown's choices.

```ruby
field :skills, as: :tags,
  fetch_values_from: -> { "/avo/resources/skills/skills_for_user" }
```

- **Type:** `String`, `Proc` / `Lambda` returning a URL string, or `nil`.
- **Default:** `nil`.
- **Context:** Evaluated in an `ExecutionContext` with `resource` and `record` explicitly provided.
- **Response:** JSON array of objects with `value` and `label` keys; `avatar` is optional.
- **Validation:** No Ruby-side URL or response-schema validation. Requests are debounced by `500` milliseconds.

Remote labels are not automatically loaded on index and show. See [displaying labels for stored IDs](./tags.html#display-labels-instead-of-stored-ids).

</Option>

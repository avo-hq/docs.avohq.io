---
license: community
outline: [2, 3]
guide: ./field-discovery.html
prev:
  text: "Field Discovery"
  link: "./field-discovery.html"
next: false
---

# Field Discovery API

Per-option reference for `discover_columns` and `discover_associations`. For task-oriented documentation and worked examples, see the [Field Discovery guide](./field-discovery.html).

Both methods are called inside a resource's `fields` method and share the same signature:

```ruby
def fields
  discover_columns only: [], except: [], **field_options
  discover_associations only: [], except: [], **field_options
end
```

`discover_columns` handles database columns, rich text bodies (`has_rich_text`), and tags (`acts_as_taggable_on`). `discover_associations` handles attachments (`has_one_attached` / `has_many_attached`) and regular Active Record associations.

## Method options

<Option name="`only`" headingSize="3">

Discover only the listed columns or associations, excluding all others.

```ruby
discover_columns only: [:title, :body, :published_at]
```

- **Type:** Array of Symbols — column or association names
- **Default:** `nil` (everything is discovered)

</Option>

<Option name="`except`" headingSize="3">

Discover everything except the listed columns or associations.

```ruby
discover_columns except: [:metadata, :internal_notes]
```

- **Type:** Array of Symbols — column or association names
- **Default:** `nil` (nothing is excluded)

</Option>

<Option name="`field_options`" headingSize="3">

Any other keyword argument is forwarded verbatim to every field the call discovers.

```ruby
discover_columns help: "Automatically discovered"
discover_associations searchable: false
```

- **Type:** keyword arguments, same options a manual [`field` declaration](./field-options.html) accepts
- **Default:** none

</Option>

## Discovery behavior

### Mapping precedence

Each column's field configuration is resolved by the first match, in order:

1. The model's Rails enums — rendered as a `select` field with the enum's values.
2. [`column_names_mapping`](#column_names_mapping) — matched on column name.
3. [`column_types_mapping`](#column_types_mapping) — matched on database column type.

Columns with no match in any of the three are not discovered.

### Ignored columns

These columns are never discovered, regardless of `only`:

`encrypted_password`, `reset_password_token`, `reset_password_sent_at`, `remember_created_at`, `password_digest`

Columns that back an association, a rich text body, or an attachment are also skipped by `discover_columns` so a field isn't generated twice.

### Association defaults

Discovered associations receive `searchable: true` and `sortable: true`. Polymorphic `belongs_to` associations get `polymorphic_as` and a `types` array detected from the models on the other side of the association.

## Global configuration

Both options live in the initializer and apply to every resource that uses discovery. They merge on top of the [default mappings](#default-mappings), so list only the entries you want to add or change. In each entry, `field` names the field type and every other key is passed to the field as options.

<Option name="`column_names_mapping`" headingSize="3">

Overrides the field configuration for specific column names.

```ruby
config.column_names_mapping = {
  published_at: {field: :date_time},
  body: {field: :markdown}
}
```

- **Type:** Hash — column name (Symbol) → field configuration Hash
- **Default:** `{}` (the built-in [name mappings](#column-names) still apply)

</Option>

<Option name="`column_types_mapping`" headingSize="3">

Overrides the field configuration for database column types.

```ruby
config.column_types_mapping = {
  jsonb: {field: :code, language: "json"}
}
```

- **Type:** Hash — column type (Symbol) → field configuration Hash
- **Default:** `{}` (the built-in [type mappings](#column-types) still apply)

</Option>

## Default mappings

The tables below mirror [`lib/avo/mappings.rb`](https://github.com/avo-hq/avo/blob/main/lib/avo/mappings.rb).

### Column names

| Column name | Field |
| --- | --- |
| `id` | `id` |
| `description` | `textarea` |
| `gravatar` | `gravatar` |
| `email` | `text` |
| `password`, `password_confirmation` | `password` |
| `stage` | `select` |
| `budget`, `money` | `currency` |
| `country` | `country` |

### Column types

| Column type | Field |
| --- | --- |
| `primary_key` | `id` |
| `string` | `text` |
| `text` | `textarea` |
| `integer`, `float`, `decimal`, `binary` | `number` |
| `datetime`, `timestamp`, `time` | `date_time` |
| `date` | `date` |
| `boolean` | `boolean` |
| `references`, `belongs_to` | `belongs_to` |
| `json`, `jsonb` | `code` |

### Associations

| Association | Field | Discovered by |
| --- | --- | --- |
| `belongs_to` | `belongs_to` | `discover_associations` |
| `has_one` | `has_one` | `discover_associations` |
| `has_many` | `has_many` | `discover_associations` |
| `has_and_belongs_to_many` | `has_and_belongs_to_many` | `discover_associations` |
| `has_one_attached` | `file` | `discover_associations` |
| `has_many_attached` | `files` | `discover_associations` |
| `has_rich_text` | `trix` | `discover_columns` |
| `acts_as_taggable_on` | `tags` | `discover_columns` |

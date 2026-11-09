---
license: community
outline: [2, 3]
guide: ./array.html
prev:
  text: "Array"
  link: "./array.html"
next: false
---

# Array field API

Reference for the Array field's data contract and inherited panel options. For setup and worked examples, see the [Array guide](./array.html).

Declare the field in the parent resource's `fields` method, such as `app/avo/resources/course.rb`:

```ruby
field :attendees, as: :array, use_resource: Avo::Resources::Attendee
```

The first argument is the field identifier. It supplies the model method name, the default resource lookup name, and the `view_attendees?` authorization method. `as: :array` selects this field type. The rendering resource must be an [Array Resource](../array-resource.html).

The options below are inherited association-panel options, not Array-only settings. Common options such as `name`, visibility, and view restrictions are documented in [shared field options](../field-options.html). Array Resource settings such as `writable` and `find_record_method` belong on the rendering resource, not the field.

## Data and resource selection

<Option name="`block`">

The optional declaration block supplies data for the panel. A truthy result takes precedence over the parent record's method and the rendering resource's `records` method.

```ruby
field :attendees, as: :array do
  [{id: record.id, name: record.name}]
end
```

- **Type:** Block returning an Array of Hashes, Array of Active Record objects, `ActiveRecord::Relation`, Array of `StoreModel` instances, or a pagination Hash.
- **Default:** `nil` (no block).
- **Locals:** `record` is the parent record; `page` and `per_page` are the current panel page and page size when listing records. Pagination locals are `nil` outside an index context.
- **Pagination Hash:** `{records: entries, count: total}` uses Symbol keys. `records` holds only the requested page; `count` is the total across all pages. Avo does not slice these entries again.
- **Fallback:** `nil` or `false` falls through to the model method matching the field identifier, then to the rendering resource's `records` method. An empty Array does not fall through.

:::warning Source pagination
A source-paginated resource needs a `find_record_method` to find records independently of the fetched page. See [source pagination](../array-resource.html#paginate-at-the-source).
:::

</Option>

<Option name="`use_resource`">

Selects the resource that defines how the entries are displayed. Without an override, Avo singularizes and camelizes the field identifier to find the resource, so `:attendees` resolves to `Avo::Resources::Attendee`.

```ruby
field :guests, as: :array, use_resource: Avo::Resources::Attendee
```

- **Type:** Resource Class, String, or Symbol identifying a registered resource (for example, `Avo::Resources::Attendee`, `"Attendee"`, or `:Attendee`).
- **Default:** `nil` (lookup by field identifier).
- **Resolution:** An unresolved override falls back to lookup by field identifier. No Array-specific validation error is raised by this option.

</Option>

## Pagination

<Option name="`per_page`">

Sets the panel's default page size. A valid positive page-size request parameter, or a remembered page size when pagination persistence is enabled, takes precedence.

```ruby
field :attendees, as: :array, per_page: 12
```

- **Type:** Integer (positive page size).
- **Default:** `nil`, falling back to `Avo.configuration.via_per_page` (initially `8`).
- **Validation:** The field does not validate this option. Request parameters are normalized separately to positive integers; invalid request values fall back to this default.

</Option>

<Option name="`discreet_pagination`">

Hides the pagination controls when there is no more than one page. It does not disable pagination or change the page size.

```ruby
field :attendees, as: :array, discreet_pagination: true
```

- **Type:** Boolean.
- **Default:** `nil` (pagination controls remain visible).

</Option>

## Loading and panel controls

<Option name="`loading`">

Controls when the panel fetches its content. The field inherits the global association-frame configuration when this option is omitted.

```ruby
field :attendees, as: :array, loading: {mode: :manual, auto_load_for: 300}
```

| Value | Behavior |
| --- | --- |
| `:lazy` | Uses a native lazy Turbo Frame that loads when revealed. |
| `:manual` | Displays a placeholder with a Load button until opened. |
| `{mode: :lazy}` | Hash form of lazy loading. |
| `{mode: :manual, auto_load_for: 300}` | Manual loading with a sliding memory window of 300 seconds after opening. |

- **Type:** Symbol or String mode, or Hash with `mode` and optional `auto_load_for` keys. String Hash keys are accepted too.
- **Default:** `nil`, inheriting `config.associations[:frames][:loading]` (initially `:lazy`).
- **Hash mode default:** `:manual` when `mode` is absent or `nil`.
- **Memory:** `auto_load_for` accepts seconds as an Integer or an `ActiveSupport::Duration`. Manual mode inherits `config.associations[:frames][:auto_load_for]` (initially `900` seconds). An explicit `nil`, zero, or negative value disables memory. The window is remembered per record and frame in a cookie; it is not a loading delay.
- **Validation:** No allowed-mode validation is performed. Non-Hash values are converted with `to_sym`; unsupported objects can raise `NoMethodError`.

:::info Memory scope
The remembered opening window applies to manual frames. It does not change lazy loading behavior.
:::

</Option>

<Option name="`reloadable`">

Displays a refresh control in the panel header when truthy. Callable values are evaluated through Avo's execution context.

```ruby
field :attendees, as: :array, reloadable: true
```

- **Type:** Boolean or Proc / Lambda.
- **Default:** `nil` (no refresh control).
- **i18n key:** `avo.reload` ("Reload").

</Option>

<Option name="`linkable`">

Displays a header control that opens the panel's listing URL in a new tab when truthy. Callable values are evaluated through Avo's execution context.

```ruby
field :attendees, as: :array, linkable: true
```

- **Type:** Boolean or Proc / Lambda.
- **Default:** `nil` (no open-in-new-tab control).
- **i18n key:** `avo.open_in_new_tab` ("Open in a new tab").

</Option>

<Option name="`refresh_on_destroy`">

Requests a full-page Turbo reload after a successful deletion from the panel instead of refreshing its frame. Deletion controls still depend on the Array Resource's writable setting and authorization.

```ruby
field :attendees, as: :array, refresh_on_destroy: true
```

- **Type:** Boolean.
- **Default:** `nil` (refresh the frame after deletion).

</Option>

## Listing controls

<Option name="`hide_search_input`">

Suppresses the listing's search input. A false value does not enable search by itself: the rendering resource must define `search_query`, and search must be authorized.

```ruby
field :attendees, as: :array, hide_search_input: true
```

- **Type:** Boolean.
- **Default:** `nil` (does not suppress an otherwise available search input).

</Option>

<Option name="`hide_filter_button`">

Suppresses the listing's filter button, including the dynamic-filter button when available. It does not clear active filters or define filter support for the data source.

```ruby
field :attendees, as: :array, hide_filter_button: true
```

- **Type:** Boolean.
- **Default:** `nil` (does not suppress an otherwise available filter button).

</Option>

:::warning Association options are not interchangeable
An Array field fetches data through its block, parent model method, or Array Resource, not an Active Record association query. Association-specific query settings such as `scope` are not applied by this fetch path. Loading, visibility, and listing controls do not add persistence, sorting, search, or filtering to the underlying data source.
:::

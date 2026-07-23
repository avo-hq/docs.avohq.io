---
license: mixed
outline: [2, 3]
guide: ./search.html
search_item_path: true
prev:
  text: "Search"
  link: "./search.html"
next: false
---

# Search API

Per-option reference for search. For task-oriented documentation and worked examples, see the [Search guide](./search.html).

Resource-level options live in the `self.search` hash on the resource class; global search options live in `config/initializers/avo.rb`:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
    item: -> { {title: record.name} },
    hide_on_global: false,
    display_count: true
  }
end

Avo.configure do |config|
  config.global_search = {enabled: true, navigation_section: true, search_on_type: true}
  config.search_results_count = 8
end
```

## Resource configuration

<Option name="`query`" headingSize="3">

The search query, executed with [`Avo::ExecutionContext`](./execution-context) whenever any search surface runs against this resource. Without it, the resource has no <Index /> search bar and is skipped by the global search.

```ruby
self.search = {
  query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) }
}
```

- **Type:** Proc
- **Default:** `nil` — search disabled for the resource
- **Locals:** `q` (stripped search string), `query` (base scope with [authorization scopes](./authorization.html#scopes) applied), `params`, [`search_type`](#search_type), plus all `Avo::ExecutionContext` attributes
- **Return:** an `ActiveRecord::Relation`, or an Array of hashes for [custom search providers](#custom-search-providers)

</Option>

<Option name="`item`" headingSize="3">

Configures how each result row renders in the global search palette, the direct-match section, and [searchable association pickers](./associations/searchable-api.html#item). The resource-index search bar is unaffected — it re-renders the regular index views. The proc has access to `record` and `resource` and returns a hash with the following keys:

<!-- @include: ./common/search_item_keys_common.md-->

```ruby
self.search = {
  query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
  item: -> do
    {
      title: "[#{record.id}] #{record.name}",
      description: record.truncated_body,
      image_url: main_app.url_for(record.cover_photo),
      image_format: :rounded,
      path: avo.resources_post_path(record, custom: "search")
    }
  end
}
```

- **Type:** Proc returning a Hash
- **Default:** `nil` — rows render the record's title with no description or image

</Option>

<Option name="`hide_on_global`" headingSize="3">

Excludes the resource from the global search — the palette results, the direct-match lookup, and the dedicated results page. The search bar on the resource's own <Index /> view keeps working.

```ruby
self.search = {
  query: -> { query.ransack(id_eq: q, m: "or").result(distinct: false) },
  hide_on_global: true
}
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`display_count`" headingSize="3">

Whether the global search shows result counts in each resource's header — "Users (8 of 21)". Counting runs an extra query per resource; disable it on large datasets or when a [custom search provider](#custom-search-providers) can't count.

```ruby
self.search = {
  query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
  display_count: false
}
```

A lambda works too, evaluated with access to all attributes of [`Avo::ExecutionContext`](./execution-context):

```ruby
self.search = {
  display_count: -> { current_user.admin? }
}
```

- **Type:** Boolean or Proc
- **Default:** `true`

</Option>

## `search_type`

A local injected into the [`query`](#query) proc identifying which surface triggered the search, so one proc can serve different queries per surface.

| Value | Surface |
|---|---|
| `:resource` | resource-index search bar |
| `:global` | navbar ⌘K palette and its dedicated results page |
| `:association` | [searchable association picker](./associations/searchable) on edit forms and the attach modal |

:::info
`search_type` is injected by Avo Pro. On a Community-only install the local is not defined and referencing it in the proc raises an error. The [kanban board](./kanban-boards) card picker also does not inject `search_type` (or a `q` local) — read the term from `params[:q]` and detect the board with `params[:for_kanban_board]`.
:::

## Global search configuration

<LicenseReq license="add_on" add_on_link="https://avohq.io/pricing-4?add_ons[]=advanced-search" />

Keys of the `config.global_search` hash in `config/initializers/avo.rb`. Also listed in the [customization API](./customization-api.html#global_search).

<Option name="`enabled`" headingSize="3">

Whether the global search renders at all — the navbar trigger, the <kbd>Cmd</kbd> + <kbd>K</kbd> shortcut, and the dedicated results page.

```ruby
config.global_search = {
  enabled: -> { current_user.is_admin? }
}
```

- **Type:** Boolean or Proc (evaluated with [`Avo::ExecutionContext`](./execution-context))
- **Default:** `true`

</Option>

<Option name="`navigation_section`" headingSize="3">

Whether the palette shows the "Go to" section — links to the <Index /> page of every resource the current user can access, filtered as the user types.

```ruby
config.global_search = {
  navigation_section: false
}
```

- **Type:** Boolean or Proc (evaluated with [`Avo::ExecutionContext`](./execution-context))
- **Default:** `true`

</Option>

<Option name="`search_on_type`" headingSize="3">

Whether typing in the palette triggers the search automatically. When `false`, the dropdown still opens on focus or <kbd>Cmd</kbd> + <kbd>K</kbd>, but the user must press <kbd>Enter</kbd> to run the search and navigate to the dedicated results page.

```ruby
config.global_search = {
  search_on_type: false
}
```

- **Type:** Boolean
- **Default:** `true`

:::warning
Unlike `enabled` and `navigation_section`, this key does **not** accept a lambda — any Proc is truthy, so it would behave as `true`.
:::

</Option>

## Limiting results {#limiting-results}

<Option name="`search_results_count`" headingSize="3">

How many results Avo shows per resource on search surfaces. Applied only to queries that return an `ActiveRecord::Relation` **without** a `.limit()` of their own — a `.limit()` in the [`query`](#query) proc always wins. Arrays from [custom search providers](#custom-search-providers) are never auto-capped. The dedicated global search results page ignores the limit and lists every match.

```ruby
config.search_results_count = 16
```

- **Type:** Integer
- **Default:** `8`

</Option>

The delay before a keystroke fires the search request is controlled by [`config.search_debounce`](./customization-api.html#search_debounce).

## Custom search providers

When the [`query`](#query) proc returns an Array instead of a relation, each element must be a hash with this structure:

```ruby
{
  _id: 1,
  _label: "The label",
  _url: "https://example.com/records/1",
  _description: "Some description about the record",
  _avatar: "https://example.com/avatar.jpg",
  _avatar_type: :rounded
}
```

| Key | Description |
|---|---|
| `_id` | The record's identifier |
| `_label` | Row title; the search term is highlighted inside it |
| `_url` | Where clicking the row navigates |
| `_description` | Optional row description |
| `_avatar` | Optional image URL |
| `_avatar_type` | `:square`, `:rounded`, or `:circle` |

:::warning
With array results the result count is not available, and [`search_results_count`](#search_results_count) is not applied — cap the array in the proc with `.first(N)` if needed.
:::

---
license: add_on
betaStatus: Beta
outline: [2, 3]
---

# Typeahead field

A search-as-you-type dropdown for editing a *scalar* column (string, integer, etc.) backed by a developer-supplied list — static array, lambda over the database, or HTTP call to an external API. The picked item's `value` is stored on the record's column as a regular value.

```ruby
field :neighborhood, as: :typeahead, values: ["berceni", "baneasa", "unirii"]
```

## Requirements

- `avo-pro` ≥ 4.0 (the field reuses the `Search::Dropdown` shell extracted from the v4 association picker).
- A column on the record to store the picked value (string, integer, etc.).

## Difference from related fields

The typeahead field overlaps with three existing fields. Pick the right one:

| Use case | Field |
|---|---|
| Reference an Avo resource you have full CRUD on | `belongs_to` (with `searchable: true` if you want type-ahead on it) |
| Pick from a small fixed enumerated list | `select` |
| Multi-value freeform-with-suggestions | `tags` |
| **Single-value, large/dynamic/remote source, no Avo resource on the other end** | **`typeahead`** ← this one |

## `values:` — the data source

Three forms, all accepted:

### Static array of strings

Each string auto-wraps to `{value: s, title: s}`. The visible label and the stored value are the same string.

```ruby
field :neighborhood, as: :typeahead, values: ["berceni", "baneasa", "unirii"]
```

### Static array of hashes

Pass `{value:, title:, description:, image_url:, image_format:}` — the stored `value` and the displayed `title` are decoupled. `description` and `image_url` render in the dropdown row.

```ruby
field :neighborhood, as: :typeahead, values: [
  { value: "berceni",  title: "Berceni",  description: "South Bucharest", image_url: "https://..." },
  { value: "baneasa",  title: "Băneasa",  description: "North Bucharest", image_url: "https://..." }
]
```

### Lambda — runs server-side per keystroke

The lambda has access to `q` (the user's typed query), `params`, `record` (the form's record, or `nil` on `new`), `resource`, and `current_user`. It runs through `Avo::ExecutionContext`, so `Pundit.policy_scope(...)` and any other helper you'd use in a controller works.

```ruby
field :assigned_to, as: :typeahead, values: -> {
  current_user.company.users
    .where.not(role: :admin)
    .where("name ILIKE ?", "%#{q}%")
    .limit(10)
    .map { |u| { value: u.id, title: u.name, image_url: u.avatar_url } }
}
```

### HTTP — written inside the lambda

Typeahead has no first-class declarative HTTP form because the lambda already gives you full control over auth, method, headers, and response mapping. Call any HTTP client and map the response yourself:

```ruby
field :country, as: :typeahead, values: -> {
  HTTParty.get("https://restcountries.com/v3.1/name/#{CGI.escape(q)}").parsed_response.map do |c|
    { value: c["cca2"], title: c["name"]["common"], image_url: c["flags"]["png"] }
  end
}
```

## `suggestions:` — what shows on focus before typing

The `values:` proc only runs when `q` is present. To populate the dropdown when the input is focused but empty, configure a separate `suggestions:` proc with the same locals (`q` is always `""`).

```ruby
field :assigned_to, as: :typeahead,
  values: -> { ... },
  suggestions: -> {
    current_user.company.users.order(:name).limit(8)
      .map { |u| { value: u.id, title: u.name } }
  }
```

If `suggestions:` is not configured, focus-empty returns an empty dropdown — no implicit fallback to `values:` with `q = ""`. This is intentional, to prevent accidental data exposure.

## Item shape

Items returned from `values:` / `suggestions:` (or the static array) must conform to:

| Key            | Required | Notes |
|----------------|----------|-------|
| `value`        | yes      | What gets stored on the record's column. |
| `title`        | yes      | Primary label shown in the dropdown row and in the input after picking. |
| `description`  | no       | Secondary line under the title. |
| `image_url`    | no       | Image rendered to the left of the title (avatar, logo, country flag, etc.). |
| `image_format` | no       | `:circle`, `:square` (default) — matches global/association search semantics. |

Plain strings auto-wrap to `{value: s, title: s}`.

## `limit:`

Caps the number of items returned, applied after the proc/array runs.

```ruby
field :neighborhood, as: :typeahead, values: -> { ... }, limit: 10
```

Resolution chain (highest to lowest precedence):

1. Field-level `limit:`
2. Resource-level `self.search_results_count`
3. `Avo.configuration.search_results_count` (default `8`)

:::warning
The cap is applied *after* the proc returns. If your lambda enumerates a large AR relation without an inner `.limit`, the DB still loads everything before our cap kicks in. Always add `.limit(n)` inside the lambda for performance:

```ruby
values: -> {
  User.where("name ILIKE ?", "%#{q}%").limit(10).map { |u| ... }
}
```
:::

## `debounce:`

Milliseconds the JS waits between keystrokes before firing the search request. Defaults to `Avo.configuration.search_debounce`.

```ruby
field :neighborhood, as: :typeahead, values: -> { ... }, debounce: 250
```

## Display on `show` and `index`

The raw stored value is rendered as-is. If the stored value is human-readable (e.g. `"berceni"`), no extra config is needed. If it's an opaque id (e.g. `123`), use `format_using:` to resolve a label:

```ruby
field :cartier_id, as: :typeahead,
  values: -> { Cartier.where("name ILIKE ?", "%#{q}%").limit(10).map { |c| {value: c.id, title: c.name} } },
  format_using: -> { Cartier.find_by(id: value)&.name || value }
```

The `format_using:` resolver is also used to prefill the visible input on edit forms when a stored value is present.

:::info
A future iteration may add a dedicated `format_value:` hook that resolves a single value to a label, separate from the `values:` search proc — so HTTP-backed implementations can hit a single-record endpoint instead of the search endpoint. For now, `format_using:` is the recommended approach.
:::

## Authorization

The endpoint that serves typeahead results authorizes against the *current* resource's `:edit` action — i.e. the same gate that authorized rendering the form in the first place. If the user can edit the form, they can use the typeahead inputs on it.

There is no separate `:typeahead_search` policy method to define.

## Scoping inside the lambda

The lambda runs through `Avo::ExecutionContext`, so it has access to `current_user`, `params`, AR scopes, and Pundit. Scope however you want:

```ruby
field :assigned_to, as: :typeahead, values: -> {
  Pundit.policy_scope(current_user, User)
        .where(company: current_user.company)
        .where.not(role: :admin)
        .where("name ILIKE ?", "%#{q}%")
        .limit(10)
        .map { |u| { value: u.id, title: u.name } }
}
```

## Picking is enforced — no free text

The form submits a hidden field that is only populated when the user clicks a suggestion. Typed text that doesn't match a picked item is discarded — it never reaches the database. If you need freeform-with-suggestions instead, use the `tags` field.

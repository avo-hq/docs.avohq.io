---
license: community
outline: [2, 3]
---

# Views

The Avo CRUD feature generates four main views for each resource.

## Index

The page where you see all your resources listed in a [table](./table-view.html), [grid](./grid-view.html), or [map](./map-view.html).
<br/>
<RelatedList>
<RelatedItem href="./customization.html#click_row_to_view_record">Click row to view record</RelatedItem>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## Show

The page where you see one resource in more detail.
<br/>
<RelatedList>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## Edit

The page where you can edit one resource.
<br/>
<RelatedList>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## New

The page where you can create a new resource.
<br/>
<RelatedList>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## View groups

Three named groups let you target several views at once:

### Display

`:display` is an alias for the `Index` and `Show` views where you can display records and their details.

### Form

`:form` is an alias for the `Edit` and `New` views for creating and editing records. The `create` and `update` requests that submit those forms also count as form views.

### Single

`:single` is an alias for every view except `Index` — that is `Show`, `Edit`, and `New` (plus the `create` and `update` form submissions).

## Preview

The fields marked with `show_on: :preview` will be shown in the [preview field](./fields/preview) popup.
By default, all fields are hidden in `:preview`.

## Checking the current view

The `view` object, available in the code, is an instance of the `Avo::ViewInquirer` class.
This enables you to examine the existing `view` status through expressions such as `view.show?` and `view.index?`.
Essentially, these are equivalent to asserting whether view equals `show` or `index`.

## Multiple ways to check

```ruby
view == "edit" # Check against a string
view == :edit # Check against a symbol
view.edit? # Ask if it's a view
view.form? # Ask if it's a collection of views
view.in? [:edit, :new] # Check against an array of symbols
view.in? ["edit", "new"] # Check against an array of strings
```

::: code-group

```ruby [Ask]
if view.show?
  # Code for the "show" view
elsif view.index?
  # Code for the "index" view
elsif view.edit?
  # Code for the "edit" view
elsif view.new?
  # Code for the "new" view
elsif view.form?
  # Code for the "new" or "edit" views
elsif view.display?
  # Code for the "index" or "show" views
end
```

```ruby [Symbol comparator]
if view == :show
  # Code for the "show" view
elsif view == :index
  # Code for the "index" view
elsif view == :edit
  # Code for the "edit" view
elsif view == :new
  # Code for the "new" view
end
```

```ruby [String comparator]
if view == "show"
  # Code for the "show" view
elsif view == "index"
  # Code for the "index" view
elsif view == "edit"
  # Code for the "edit" view
elsif view == "new"
  # Code for the "new" view
end
```

:::

It's also possible to check if the view is on a `form` (`new`, `edit`) or `display` (`index`, `show`).

::: code-group

```ruby [Ask]
if view.form?
  # Code for the "new" and "edit" views
elsif view.display?
  # Code for the "show" and "index" views
end
```

```ruby [Symbol comparator]
if view.in? [:new, :edit]
  # Code for the "new" and "edit" views
elsif view.in? [:show, :index]
  # Code for the "show" and "index" views
end
```

```ruby [String comparator]
if view.in? ["new", "edit"]
  # Code for the "new" and "edit" views
elsif view.in? ["show", "index"]
  # Code for the "show" and "index" views
end
```

:::

## Common `visible_on` configuration values

In many parts of the DSL you'll be able to configure visibility through options like `visible_on`, `show_on`, `hide_on`, `only_on`, or `except_on`. These options control the views where the configuration applies.
You may use the following values:

- `:show`
- `:edit`
- `:new`
- `:index`
- `:forms` — expands to `:new` and `:edit`
- `:display` — expands to `:index` and `:show`

You may also use a combination of views using an array.

- `[:show, :index]`
- `[:show, :forms]`

Field visibility options (`show_on`, `hide_on`, `only_on`, `except_on`) additionally accept `:preview` — see [Preview](#preview) above.

## View types

The <Index /> view can render records through several view types, each with its own options, documented on its own page:

- [Table view](./table-view.html) — the default tabular layout; row controls placement and per-row styling.
- [Grid view](./grid-view.html) — card-based layout with cover, title, body, and badge, for image-heavy resources.
- [Map view](./map-view.html) — plot records with geospatial data on a map.
- [Custom view types](./custom-view-types.html) — restrict which view types are available per resource, or register entirely new ones from a plugin.

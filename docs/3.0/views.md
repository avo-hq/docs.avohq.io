# Views

The Avo CRUD feature generates with four main views for each resource.

:::option `Index`
The page where you see all your resources listed in a table or a [grid](grid-view.md).
:::

:::option `Show`
The page where you see one resource in more detail.
:::

:::option `Edit`
The page where you can edit one resource.
:::

:::option `New`
The page where you can create a new resource.
:::

## Preview

The fields marked with `show_on :preview`, will be show in the [preview field](./fields/preview) popup.
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
  # Code for the "index or "show" views
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

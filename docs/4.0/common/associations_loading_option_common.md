<Option name="`loading`">

Controls how the association's content frame is loaded on the <Show /> page.

By default an association loads its content as soon as its turbo-frame is revealed (the lazy behavior). The `loading` option lets you defer that fetch until the user explicitly asks for it, which is useful for heavy associations you don't want to load on every page view.

The default for every association is set globally via [`config.associations`](./../customization.html#associations) (`loading: :lazy` out of the box). Set `loading:` on a field to override that default per association.

#### Possible values

| Value | Behavior |
|---|---|
| `:manual` | Renders a placeholder with a **Load** button. Nothing is fetched until the user clicks it. Once opened, the frame is remembered for **15 minutes** by default (see [`auto_load_for`](#remembering-an-opened-frame)). |
| `{ mode: :manual }` | Same as `:manual`. |
| `{ mode: :manual, auto_load_for: 5.minutes }` | Manual with a custom sliding memory window — once opened, the frame auto-loads (no placeholder, no button) on return visits for the given duration. |
| `{ mode: :manual, auto_load_for: 0 }` | Manual with **no** memory — the placeholder returns on every visit (`0` or `nil` opts out). |
| `:lazy` / `{ mode: :lazy }` | Native lazy loading (loads when the frame is revealed). |

#### Manual loading

```ruby
field :orders, as: :has_many, loading: :manual
```

The placeholder shows the association title, the (optional) [`description`](#description), and a **Load** button. On click, the real content is fetched into the frame. If the request fails (500, 404, network error), an inline error with a **Retry** button is rendered inside the frame instead of redirecting to the global failed-to-load page.

For a `has_one` association whose value is `nil`, the existing attach/create empty state is shown instead of a placeholder.

#### Remembering an opened frame

Once the user opens a manual frame, Avo remembers it for **15 minutes** by default and skips the placeholder on return visits — the frame auto-loads directly. Pass `auto_load_for` to change that window:

```ruby
field :orders, as: :has_many, loading: { mode: :manual, auto_load_for: 5.minutes }
```

The window is a sliding memory, not a delay: a short-lived cookie scoped per record + frame remembers the opened frame, and every return visit within the window refreshes it. Once the window lapses, the placeholder + **Load** button return.

Set `auto_load_for: 0` (or `nil`) to opt out entirely — the placeholder then returns on every visit:

```ruby
field :orders, as: :has_many, loading: { mode: :manual, auto_load_for: 0 }
```

The default window is configurable globally via [`config.associations`](./../customization.html#associations).

:::warning Keep the `description` cheap with `loading: :manual`
The [`description`](#description) lambda is evaluated to render the placeholder, *before* the user clicks **Load** — so a description that touches the database (e.g. `-> { "#{query.count} orders" }`) defeats the purpose of deferring the load. Branch on the `loading_type` attribute to skip the expensive work on the placeholder:

```ruby
field :orders, as: :has_many, loading: :manual,
  description: -> { loading_type == :manual ? "Orders" : "#{query.count} orders" }
```

`loading_type` is `:manual` while the placeholder is shown and `nil` in every other render context.
:::
</Option>

---
license: community
outline: [2, 3]
guide: ./fields-layout.html
prev:
  text: "Fields layout"
  link: "./fields-layout.html"
next: false
---

# Fields layout API

Per-option reference for the layout DSL — `header`, `panel`, `card`, `sidebar`, `tabs`, and `tab`. For task-oriented documentation and worked examples, see the [Fields layout guide](./fields-layout.html).

The field-level `stacked` and `width` options are documented in the [field options reference](./field-options.html). Everything below is declared inside a resource's `fields` method.

## Header

<Option name="`header`">

```ruby
header(**args, &block)
```

A resource-level item — declared as a standalone `header` call inside `fields`, not a field option (there is no `header:` keyword on individual fields). It marks where the page header chrome renders: cover image, title, description, avatar, discreet info, and control buttons.

You only declare `header` when you want it somewhere other than the top — e.g. to place a resource `tool`, `card`, or `panel` above it. Otherwise leave it out and Avo renders the header at the top for you.

- **Arguments:** ignored. `header` accepts `**args` but nothing reads them — it carries no configuration. Its content comes entirely from the resource (`title`, `description`, cover, avatar, controls), so `header` positions the chrome but can't customize it.
- **Behavior:** declaring `header` suppresses the automatically-injected one; its position within the `fields` block determines where it renders.
- **Default:** if omitted, Avo auto-adds a header at the very top of the page. When a resource is embedded in a modal, the header is stripped from the edit view.

Not to be confused with [`heading`](./fields/heading), a field type for inline section titles inside a panel or form.

</Option>

## Panels

<Option name="`panel`">

```ruby
panel(title: nil, **args, &block)
```

Groups related fields inside a titled container. Declared at the root level or inside `tabs`.

<Option name="`title`" headingSize="3">

The panel's title, rendered at the top of the panel.

```ruby
panel title: "User information" do
  field :first_name, as: :text
  field :last_name,  as: :text
end
```

- **Type:** String
- **Default:** `nil` (untitled panel)

</Option>

<Option name="`description`" headingSize="3">

An auxiliary line rendered under the panel title.

```ruby
panel title: "User information", description: "Some information about this user" do
  field :first_name, as: :text
end
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`visible`" headingSize="3">

Dynamically controls the visibility of a panel and all its children at once, without setting visibility on each field.

```ruby
panel title: "User information", visible: -> { resource.record.enabled? } do
  field :first_name, as: :text
  field :last_name,  as: :text
end
```

- **Type:** Boolean or Proc
- **Default:** `true`

</Option>

Panels also accept the standard view-visibility options (`only_on`, `except_on`, `show_on`, `hide_on`) — see [field options](./field-options.html).

</Option>

<Option name="`card`">

```ruby
card(title: nil, **args, &block)
```

A lightweight grouping that sections fields visually without opening a full panel. Unlike `sidebar`, `card` can be placed at the root level, inside a `panel`, inside a `sidebar`, or inside a `tab`. Takes `title` and `description` (same as [`panel`](#panel)).

```ruby
card title: "Personal information" do
  field :first_name, as: :text
  field :last_name,  as: :text
end
```

</Option>

## Sidebar

<Option name="`sidebar`">

```ruby
sidebar(**args, &block)
```

A narrow column that stacks compact fields beside the main content. Must be declared inside a `panel` (declaring it elsewhere raises). Standalone fields are auto-wrapped in a card; declare a `card` yourself only to attach a title or description.

```ruby
panel do
  field :id, as: :id

  sidebar do
    card do
      field :email,  as: :gravatar, only_on: :show
      field :active, as: :boolean, only_on: :show
    end
  end
end
```

</Option>

## Tabs

<Option name="`tabs`">

```ruby
tabs(id: nil, title: nil, description: nil, **args, &block)
```

The group block wrapping a set of `tab`s. `title`, `description`, and `visible` apply to both the group and each individual [`tab`](#tab).

<Option name="`id`" headingSize="3">

A unique identifier for the tab group, used for durable (remembered across views) and bookmarkable tab selection. Assign a distinct `id` to each group to keep selection stable when groups are renamed or reordered.

```ruby
tabs id: :some_random_uniq_id do
  field :posts, as: :has_many, show_on: :edit
end
```

- **Type:** Symbol or String
- **Default:** `nil` — falls back to the parameterized group `title`, then to the group's position in the resource

</Option>

<Option name="`title`" headingSize="3">

On a `tabs` group, an overarching label for the whole collection. On a `tab`, the mandatory label shown on the tab switcher.

```ruby
tabs title: "Tabs group title" do
  tab title: "User information" do
    # ...
  end
end
```

- **Type:** String
- **Default:** `nil` for the group; **required** for each `tab`

</Option>

<Option name="`description`" headingSize="3">

Auxiliary text for the group or a tab. On a `tab`, it renders as the tooltip shown when hovering the switcher.

```ruby
tab title: "User information", description: "Some information about this user" do
  # ...
end
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`visible`" headingSize="3">

Controls the visibility of a whole `tabs` group or an individual `tab`.

```ruby
tabs visible: -> { resource.record.enabled? } do
  tab title: "General Information" do
    panel do
      field :name, as: :text
    end
  end

  tab title: "Admin Information", visible: -> { current_user.is_admin? } do
    panel do
      field :role, as: :text
    end
  end
end
```

- **Type:** Boolean or Proc
- **Default:** `true`

</Option>

</Option>

<Option name="`tab`">

```ruby
tab(title:, **args, &block)
```

An individual tab inside a `tabs` group. `title` is required; it also accepts `description` and `visible` (see [`tabs`](#tabs)), plus the two loading options below. Standalone fields placed directly in a tab are auto-wrapped in a card, so a `panel` or `card` is optional — add one only to attach a title or description.

<Option name="`lazy_load`" headingSize="3">

Defers loading a tab's content until the tab is revealed, improving performance by fetching data only when needed. In form views it is automatically disabled to prevent data loss on submit.

```ruby{2}
tabs do
  tab title: "Address", lazy_load: true do
    # ...
  end
end
```

- **Type:** Boolean
- **Default:** `false` (all tabs load immediately)

</Option>

<Option name="`loading`" headingSize="3">

Where `lazy_load` fetches a tab's content automatically when it's revealed, `loading: :manual` defers the fetch until the user clicks a **Load** button — useful for heavy tabs you don't want to load on every page view. Each manual tab gets its own button (per-tab gating); on click, the real content replaces the placeholder, and a failed request shows an inline error with a **Retry** button.

```ruby{2}
tabs do
  tab title: "Orders", loading: :manual do
    field :orders, as: :has_many
  end
end
```

- **Type:** Symbol or Hash
- **Default:** Unset — a tab renders eagerly (its content loads inline on cold start).

`loading` is the same mechanism used by association turbo-frame fields (`has_one`, `has_many`, `has_and_belongs_to_many`) — see the [association `loading` option](./associations/has_many.html#loading). The difference is the default: a tab with no `loading:` stays eager, whereas association frames fall back to the global default from [`config.associations`](./customization.html#associations) (`loading: :lazy`, `auto_load_for: 15.minutes` out of the box). Setting `loading:` on the field or tab overrides that default.

##### Values

| Value                                         | Behavior                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `:manual`                                     | Placeholder + **Load** button; fetches on click. Once opened, the tab is remembered for **15 minutes** by default.                     |
| `{ mode: :manual }`                           | Same as `:manual`.                                                                                                                     |
| `{ mode: :manual, auto_load_for: 5.minutes }` | Manual with a custom sliding memory window — once opened, the tab auto-loads (no placeholder) on return visits for the given duration. |
| `{ auto_load_for: 5.minutes }`                | `mode:` is optional in a Hash — omit it and `loading` defaults to `:manual`, so this is the same as the row above.                     |
| `{ mode: :manual, auto_load_for: 0 }`         | Manual with **no** memory — the placeholder returns on every visit (`0` or `nil` opts out).                                            |
| `:lazy` / `{ mode: :lazy }`                   | Native lazy loading (equivalent to `lazy_load: true`).                                                                                 |

`auto_load_for` accepts an `ActiveSupport::Duration` (`5.minutes`) or a raw Integer of seconds (`300`); Hash keys may be symbols or strings.

Once the user opens a manual tab, Avo remembers it for the `auto_load_for` window (default **15 minutes**) via a short-lived cookie scoped per record + tab, sliding the window forward on each return visit. When it lapses, the placeholder + **Load** button return.

```ruby
tab title: "Orders", loading: { mode: :manual, auto_load_for: 5.minutes } do
  field :orders, as: :has_many
end
```

:::info
`loading: :manual` is purely additive — omitting it leaves every tab behaving exactly as before. Like `lazy_load`, manual loading is a <Show />-view concern and does not apply to form views.
:::

</Option>

</Option>

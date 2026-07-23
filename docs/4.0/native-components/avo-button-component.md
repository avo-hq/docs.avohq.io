# `Avo::ButtonComponent`

This component renders a button or a link with Avo's button styling. It powers the
`a_button` and `a_link` helpers you'll see throughout the docs.

```erb
<%= render Avo::ButtonComponent.new(style: :primary, icon: "tabler/outline/arrow-up") do %>
  Label
<% end %>
```

The two helpers are thin wrappers around this component:

```erb
<%# Renders a <button> %>
<%= a_button(style: :primary, icon: "tabler/outline/arrow-up") do %>
  Label
<% end %>

<%# Renders an <a> link %>
<%= a_link("/admin", style: :outline) do %>
  Admin
<% end %>
```

## Options

All options are optional.

<Option name="`path`">

The first positional argument. When the component is rendered as a link (`is_link: true`,
or via the `a_link` helper) this is the link's `href`.

```erb
<%= a_link("/admin") { "Admin" } %>
```

- **Type:** String
</Option>

<Option name="`style`">

The visual style of the button.

```erb
<%= a_button(style: :primary) { "Primary" } %>
<%= a_button(style: :outline) { "Outline" } %>
<%= a_button(style: :text) { "Text" } %>
```

- **Type:** Symbol — one of `:primary`, `:outline`, `:text`
- **Default:** `:outline`
</Option>

<Option name="`size`">

The size of the button.

```erb
<%= a_button(size: :sm) { "Small" } %>
<%= a_button(size: :lg) { "Large" } %>
```

- **Type:** Symbol — one of `:xs`, `:sm`, `:md`, `:lg`
- **Default:** `:md`
</Option>

<Option name="`rounded`">

The corner shape of the button. Leave it unset for the standard radius, or pass `:full`
for a pill shape. It's an orthogonal modifier, so it combines with any `style`, `size`,
or `color`.

```erb
<%= a_button(rounded: :full) { "Pill" } %>
<%= a_button(style: :primary, rounded: :full, icon: "tabler/outline/plus") { "New" } %>
```

- **Type:** Symbol — `:full`
- **Default:** `nil` (the standard radius)
</Option>

<Option name="`color`">

The accent color of the button. Accepts Avo's semantic colors or any Tailwind color name.

```erb
<%= a_button(color: :red) { "Delete" } %>
<%= a_button(style: :primary, color: :accent) { "Save" } %>
```

- **Type:** Symbol — `:primary`, `:accent`, or a Tailwind color such as `:red`, `:green`, `:blue`, `:gray`, …
- **Default:** `nil`
</Option>

<Option name="`padding`">

Tightens the button to equal padding on all sides. Useful for compact or icon-only buttons.
Icon-only buttons already get tightened padding automatically.

```erb
<%= a_button(padding: :sm, icon: "tabler/outline/dots") %>
```

- **Type:** Symbol — `:sm` or `:xs`
- **Default:** `nil`
</Option>

<Option name="`icon`">

A leading icon, using the [icon naming convention](./../icons) (e.g.
`tabler/outline/paperclip` or `heroicons/solid/academic-cap`).

```erb
<%= a_button(icon: "tabler/outline/arrow-up") { "Upload" } %>
```

- **Type:** String
</Option>

<Option name="`end_icon`">

A trailing icon, rendered after the label.

```erb
<%= a_button(end_icon: "tabler/outline/arrow-right") { "Next" } %>
```

- **Type:** String
</Option>

<Option name="`icon_class`">

Extra CSS classes applied to the `icon` and `end_icon` SVGs.

- **Type:** String
- **Default:** `""`
</Option>

<Option name="`is_link`">

Renders an `<a>` tag instead of a `<button>`. The `a_link` helper sets this for you.

- **Type:** Boolean
- **Default:** `false`
</Option>

<Option name="`aria`">

A hash of `aria-*` attributes forwarded to the element.

- **Type:** Hash
- **Default:** `{}`
</Option>

<Option name="`class`">

Extra CSS classes applied to the button element.

- **Type:** String
</Option>

<Option name="`args`">

Any remaining keyword arguments are forwarded to the underlying `link_to` / `button_to` /
`button_tag` helper. This is how you set things like `method:`, `data:`, `title:`,
`loading:`, or `hotkey:`.

```erb
<%= a_link("/posts/1", method: :delete, data: { turbo_confirm: "Are you sure?" }) do %>
  Delete
<% end %>
```

- **Type:** Hash
</Option>

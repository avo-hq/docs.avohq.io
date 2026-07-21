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

#### Type
`String`

```erb
<%= a_link("/admin") { "Admin" } %>
```
</Option>

<Option name="`style`">

The visual style of the button.

#### Type
`Symbol` — one of `:primary`, `:outline`, `:text`

#### Default value
`:outline`

```erb
<%= a_button(style: :primary) { "Primary" } %>
<%= a_button(style: :outline) { "Outline" } %>
<%= a_button(style: :text) { "Text" } %>
```
</Option>

<Option name="`size`">

The size of the button.

#### Type
`Symbol` — one of `:xs`, `:sm`, `:md`, `:lg`

#### Default value
`:md`

```erb
<%= a_button(size: :sm) { "Small" } %>
<%= a_button(size: :lg) { "Large" } %>
```
</Option>

<Option name="`rounded`">

The corner shape of the button. Leave it unset for the standard radius, or pass `:full`
for a pill shape. It's an orthogonal modifier, so it combines with any `style`, `size`,
or `color`.

#### Type
`Symbol` — `:full` (defaults to `nil`, the standard radius)

#### Default value
`nil`

```erb
<%= a_button(rounded: :full) { "Pill" } %>
<%= a_button(style: :primary, rounded: :full, icon: "tabler/outline/plus") { "New" } %>
```
</Option>

<Option name="`color`">

The accent color of the button. Accepts Avo's semantic colors or any Tailwind color name.

#### Type
`Symbol` — `:primary`, `:accent`, or a Tailwind color such as `:red`, `:green`, `:blue`, `:gray`, …

#### Default value
`nil`

```erb
<%= a_button(color: :red) { "Delete" } %>
<%= a_button(style: :primary, color: :accent) { "Save" } %>
```
</Option>

<Option name="`padding`">

Tightens the button to equal padding on all sides. Useful for compact or icon-only buttons.
Icon-only buttons already get tightened padding automatically.

#### Type
`Symbol` — `:sm` or `:xs`

#### Default value
`nil`

```erb
<%= a_button(padding: :sm, icon: "tabler/outline/dots") %>
```
</Option>

<Option name="`icon`">

A leading icon, using the [icon naming convention](./../icons) (e.g.
`tabler/outline/paperclip` or `heroicons/solid/academic-cap`).

#### Type
`String`

```erb
<%= a_button(icon: "tabler/outline/arrow-up") { "Upload" } %>
```
</Option>

<Option name="`end_icon`">

A trailing icon, rendered after the label.

#### Type
`String`

```erb
<%= a_button(end_icon: "tabler/outline/arrow-right") { "Next" } %>
```
</Option>

<Option name="`icon_class`">

Extra CSS classes applied to the `icon` and `end_icon` SVGs.

#### Type
`String`

#### Default value
`""`
</Option>

<Option name="`is_link`">

Renders an `<a>` tag instead of a `<button>`. The `a_link` helper sets this for you.

#### Type
`Boolean`

#### Default value
`false`
</Option>

<Option name="`aria`">

A hash of `aria-*` attributes forwarded to the element.

#### Type
`Hash`

#### Default value
`{}`
</Option>

<Option name="`class`">

Extra CSS classes applied to the button element.

#### Type
`String`
</Option>

<Option name="`args`">

Any remaining keyword arguments are forwarded to the underlying `link_to` / `button_to` /
`button_tag` helper. This is how you set things like `method:`, `data:`, `title:`, or
`loading:`.

#### Type
`Hash`

```erb
<%= a_link("/posts/1", method: :delete, data: { turbo_confirm: "Are you sure?" }) do %>
  Delete
<% end %>
```
</Option>

# `Avo::UI::PanelComponent`

The panel is one of the most used building blocks in Avo. It renders a titled
container with an optional description, header controls, body, sidebar, and footer.

```erb
<%= render Avo::UI::PanelComponent.new(title: @product.name, description: @product.description) do |panel| %>
  <% panel.with_controls do %>
    <%= a_link(@product.link, icon: "tabler/outline/eye", style: :primary, color: :primary) do %>
      View product
    <% end %>
  <% end %>

  <% panel.with_card do %>
    <div class="flex flex-col p-4 min-h-24 space-y-4">
      <h3>Product information</h3>

      <p>Style: shiny</p>
    </div>
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/index.webp" dark-src="/assets/img/4_0/avo-panel-component/index-dark.webp" width="1376" height="384" alt="Composed panel with title, description, a control button, and a card body" />

`ui.panel(...)` is shorthand for `Avo::UI::PanelComponent.new(...)` — both forms work.

## Options

All options are optional. You may render a panel without any of them.

```erb
<%= render Avo::UI::PanelComponent.new do |panel| %>
  <% panel.with_body do %>
    Something here.
  <% end %>
<% end %>
```

<Option name="`title`">

The title of the panel, rendered at the top of the header.

<Image src="/assets/img/4_0/avo-panel-component/title.webp" dark-src="/assets/img/4_0/avo-panel-component/title-dark.webp" width="1376" height="244" alt="Panel header showing a title" />

- **Type:** String
</Option>

<Option name="`description`">

A small line of text under the title that describes what the panel is about.

<Image src="/assets/img/4_0/avo-panel-component/description.webp" dark-src="/assets/img/4_0/avo-panel-component/description-dark.webp" width="1376" height="288" alt="Panel header with a title and a description line underneath" />

- **Type:** String
</Option>

<Option name="`class`">

A list of CSS classes applied to the panel container.

```erb
<%= render Avo::UI::PanelComponent.new(title: "Panel", class: "ring-2 ring-blue-500") do |panel| %>
  <% panel.with_body do %>
    Something here.
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/class.webp" dark-src="/assets/img/4_0/avo-panel-component/class-dark.webp" width="1376" height="276" alt="Panel with a custom class adding a blue ring around the container" />

- **Type:** String
</Option>

<Option name="`data`">

A hash of `data-*` attributes forwarded to the panel container.

- **Type:** Hash
</Option>

<Option name="`index`">

The item index, forwarded to the container as a `data-item-index` attribute. Used
when panels are rendered as part of a collection (for example the [Grid view](./../grid-view)).

- **Type:** Integer
</Option>

<Option name="`content_focusable`">

When `true`, the panel body becomes a keyboard focus anchor: focusing it lets the user
`Tab` into the fields and `Shift+Tab` back to the header controls.

- **Type:** Boolean
- **Default:** `false`
</Option>

## Slots

The component exposes a few slots where you customize the content of specific areas.

<Option name="`header`">

Replaces the default header (title, description and controls) with your own markup.
Use it when you need full control over the top of the panel.

```erb
<%= render Avo::UI::PanelComponent.new do |panel| %>
  <% panel.with_header do %>
    <%= render Avo::UI::PanelHeaderComponent.new(title: "Dashboard", description: "Everything at a glance") %>
  <% end %>
<% end %>
```
</Option>

<Option name="`controls`">

A place for panel controls such as back, edit, delete, and detach buttons. The
controls are automatically aligned to the right of the header and collapse under the
title and description on narrow screens.

```erb
<%= render Avo::UI::PanelComponent.new(title: "Dashboard") do |panel| %>
  <% panel.with_controls do %>
    <%= a_link("/admin", icon: "tabler/outline/external-link", style: :primary, color: :primary) do %>
      Admin
    <% end %>
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/controls.webp" dark-src="/assets/img/4_0/avo-panel-component/controls-dark.webp" width="1376" height="128" alt="Panel header with a control button aligned to the right" />
</Option>

<Option name="`cover`">

A full-width area rendered at the very top of the panel, above the header. Handy for
a cover image or banner.

```erb
<%= render Avo::UI::PanelComponent.new(title: "Product") do |panel| %>
  <% panel.with_cover do %>
    <%= image_tag @product.cover_url, class: "w-full h-40 object-cover" %>
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/cover.webp" dark-src="/assets/img/4_0/avo-panel-component/cover-dark.webp" width="1376" height="556" alt="Panel with a cover banner across the top, a title, and a card body" />
</Option>

<Option name="`body`">

The main slot of the component, where the bulk of the content is displayed flush in
the panel (no card wrapper).

```erb{2-4}
<%= render Avo::UI::PanelComponent.new(title: "Product information") do |panel| %>
  <% panel.with_body do %>
    <p>This content is rendered flush in the panel body. There is no card wrapping it, so it sits directly on the panel surface — use this slot when your content already brings its own card.</p>
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/body.webp" dark-src="/assets/img/4_0/avo-panel-component/body-dark.webp" width="1881" height="208" alt="Panel with plain body content rendered flush, no inner card" />
</Option>

<Option name="`card`">

Wraps the content in a bordered card automatically (an [`Avo::UI::CardComponent`](./avo-card-component.html)).
Use this instead of `body` when you want the content to sit inside a distinct card surface.

The card body ships **unpadded** so wide content (tables, horizontal scrollers) can
sit flush to the card edge. Opt into the standard body padding with `padded: true`
(or the `card--padded` CSS modifier) when your content is free-form — forms, prose,
custom tools:

```erb{2-4}
<%= render Avo::UI::PanelComponent.new do |panel| %>
  <% panel.with_card(padded: true) do %>
    Something here.
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/card.webp" dark-src="/assets/img/4_0/avo-panel-component/card-dark.webp" width="1376" height="244" alt="Panel whose content sits inside an automatically-wrapped bordered card" />
</Option>

<Option name="`sidebar`">

Shows content in a smaller area on the end side of the `body`.

```erb{2-4}
<%= render Avo::UI::PanelComponent.new(title: "Product") do |panel| %>
  <% panel.with_card do %>
    Main content here.
  <% end %>

  <% panel.with_sidebar do %>
    Something tiny here.
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/sidebar.webp" dark-src="/assets/img/4_0/avo-panel-component/sidebar-dark.webp" width="1100" height="324" alt="Panel with a main card body on the start side and a narrower sidebar on the end side" />
</Option>

<Option name="`pre_bodies`">

Content rendered between the header and the body. Can be used more than once (via
repeated `with_pre_body` calls); each entry is rendered in order.

```erb
<%= render Avo::UI::PanelComponent.new(title: "Product") do |panel| %>
  <% panel.with_pre_body do %>
    A notice above the body.
  <% end %>

  <% panel.with_card do %>
    Main content here.
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/pre_bodies.webp" dark-src="/assets/img/4_0/avo-panel-component/pre_bodies-dark.webp" width="1376" height="364" alt="Panel with a pre-body notice strip between the header and the card body" />
</Option>

<Option name="`footer`">

The lowest area of the component, rendered under the `body` or `card`.

```erb{2-4}
<%= render Avo::UI::PanelComponent.new(title: "Product") do |panel| %>
  <% panel.with_card do %>
    Main content here.
  <% end %>

  <% panel.with_footer do %>
    Something at the bottom.
  <% end %>
<% end %>
```

<Image src="/assets/img/4_0/avo-panel-component/footer.webp" dark-src="/assets/img/4_0/avo-panel-component/footer-dark.webp" width="1376" height="332" alt="Panel with a card body and a footer area at the bottom" />
</Option>

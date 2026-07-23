# `Avo::UI::CardComponent`

The card is a bordered, titled surface Avo uses to group content — a header with a
title and description on top, your content in the body, and an optional footer at the
bottom. It's the same card the [`Avo::UI::PanelComponent`](./avo-panel-component.html)
renders through its [`card` slot](./avo-panel-component.html#card), exposed here as a
standalone component for when you need a card on its own (in a [custom tool](./../custom-tools.html),
[resource tool](./../resource-tools.html), or any custom partial).

Render it through the `ui` helper:

```erb
<%= render ui.card(title: "Breakdown", description: "Sales by region") do |card| %>
  <% card.with_body do %>
    <div class="p-4">
      Your content here.
    </div>
  <% end %>
<% end %>
```

`ui.card(...)` is shorthand for `Avo::UI::CardComponent.new(...)` — both forms work.

:::info Card vs. panel
Use a **card** when you want a single bordered surface. Use a **panel** when you also
need a header with controls, a cover, a sidebar, or a footer around one or more cards.
Inside a panel, prefer the panel's `with_card` slot over nesting a `ui.card` yourself.
:::

## Options

All options are optional. You may render a card without any of them.

<Option name="`title`">

The title of the card, rendered at the top of the header.

#### Type
`String`
</Option>

<Option name="`description`">

A small line of text under the title that describes what the card is about.

#### Type
`String`
</Option>

<Option name="`padded`">

By default the card body ships **unpadded** so wide content (tables, horizontal
scrollers) can sit flush to the card edge. Set `padded: true` to opt into the standard
body padding — use it when your content is free-form (forms, prose, custom tools).

Prefer this option over adding your own `p-*`/`px-*`/`py-*` utility classes to the
content: it gives you Avo's exact padding and stays correct if that spacing ever
changes. It's equivalent to adding the `card--padded` CSS modifier via `class`.

#### Type
`Boolean`

#### Default
`false`

```erb
<%= render ui.card(padded: true) do %>
  Free-form content that needs padding.
<% end %>
```
</Option>

<Option name="`class`">

A list of CSS classes applied to the outer `.card` container. This is also how you
apply the built-in [variants](#variants).

#### Type
`String`

```erb
<%= render ui.card(title: "Card", class: "ring-2 ring-blue-500") do %>
  Something here.
<% end %>
```
</Option>

<Option name="`wrapper_class`">

A list of CSS classes applied to the inner `.card__wrapper` element (the element that
wraps the header, body, and footer). Use it when you need to target the inner wrapper
rather than the outer container.

#### Type
`String`
</Option>

<Option name="`data`">

A hash of `data-*` attributes forwarded to the outer card container.

#### Type
`Hash`

```erb
<%= render ui.card(title: "Chart", data: { controller: "distribution-chart" }) do %>
  ...
<% end %>
```
</Option>

<Option name="`index`">

The item index, forwarded to the card as a `data-item-index` attribute. Used when cards
are rendered as part of a collection.

#### Type
`Integer`
</Option>

## Slots

The component exposes slots for the areas around the body. When you don't use the
`header` slot, the `title` and `description` options render the default header for you.

<Option name="`header`">

Replaces the default header (title and description) with your own markup. Use it when
you need full control over the top of the card.

```erb
<%= render ui.card do |card| %>
  <% card.with_header do %>
    <div class="flex items-center justify-between">
      <h3>Custom header</h3>
      <%= a_link("/admin", style: :outline) { "Manage" } %>
    </div>
  <% end %>
<% end %>
```
</Option>

<Option name="`body`">

The main content area of the card. Passing content in the default block is equivalent
to using this slot — reach for the explicit slot when you also render a `header` or
`footer`, or when you need to add classes or `data-*` attributes to the body element.

```erb
<%= render ui.card(title: "Product information") do |card| %>
  <% card.with_body(class: "space-y-2") do %>
    <p>Style: shiny</p>
    <p>In stock: yes</p>
  <% end %>
<% end %>
```

:::tip
When the body holds a **list of fields**, wrap them in `ui.description_list` (the
`Avo::UI::DescriptionListComponent`) so they render full-width with dividers, exactly
like Avo's own field lists.
:::
</Option>

<Option name="`footer`">

The lowest area of the card, rendered under the body. Handy for actions or pagination.

```erb
<%= render ui.card(title: "Product") do |card| %>
  <% card.with_body do %>
    Main content here.
  <% end %>

  <% card.with_footer do %>
    <%= a_link("/products", style: :outline) { "See all" } %>
  <% end %>
<% end %>
```
</Option>

## Variants

Variants are applied through the `class` option. Combine them as needed.

<Option name="`card--padded`">

Adds the standard body padding. Equivalent to the [`padded`](#padded) option — reach
for this modifier when you're already passing a `class` string.
</Option>

<Option name="`card--compact`">

Tightens the spacing of the wrapper and header for a denser card.
</Option>

<Option name="`card--compact-header`">

Reduces only the header padding, leaving the body spacing untouched.
</Option>

<Option name="`card--full-width`">

Makes the card span the full width of its container.

```erb
<%= render ui.card(title: "Editor", class: "card--full-width card--compact-header") do %>
  ...
<% end %>
```
</Option>

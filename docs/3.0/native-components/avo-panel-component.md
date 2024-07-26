# `Avo::PanelComponent`

The panel component is one of the most used components in Avo.

```erb
<%= render Avo::PanelComponent.new(title: @product.name, description: @product.description) do |c| %>
  <% c.with_tools do %>
    <%= a_link(@product.link, icon: 'heroicons/solid/academic-cap', style: :primary, color: :primary) do %>
      View product
    <% end %>
  <% end %>

  <% c.with_body do %>
    <div class="flex flex-col p-4 min-h-24">
      <div class="space-y-4">
        <h3>Product information</h3>

        <p>Style: shiny</p>
      </div>
    </div>
  <% end %>
<% end %>
```

<Image src="/assets/img/native-components/avo-panel-component/index.jpg" width="773" height="276" alt="" />

## Options

All options are optional. You may render a panel without options.

```erb
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_body do %>
    Something here.
  <% end %>
<% end %>
```

<Option name="`name`">
The name of the panel. It's displayed on the top under the breadcrumbs.

#### Type
`String`

<Image src="/assets/img/native-components/avo-panel-component/name.jpg" width="773" height="411" alt="" />
</Option>

<Option name="`description`">
Small text under the name that speaks a bit about what the panel does.

#### Type
`String`

<Image src="/assets/img/native-components/avo-panel-component/description.jpg" width="773" height="533" alt="" />
</Option>

<Option name="`classes`">
A list of classes that should be applied to the panel container.

#### Type
`String`

<Image src="/assets/img/native-components/avo-panel-component/classes.jpg" width="773" height="533" alt="" />
</Option>

<Option name="`body_classes`">
A list of classes that should be applied to the body of panel.

#### Type
`String`

<Image src="/assets/img/native-components/avo-panel-component/body_classes.jpg" width="773" height="533" alt="" />
</Option>

<Option name="`data`">
A hash of data attributes to be forwarded to the panel container.

#### Type
`Hash`

<Image src="/assets/img/native-components/avo-panel-component/classes.jpg" width="773" height="533" alt="" />
</Option>

<Option name="`display_breadcrumbs`">
Toggles the breadcrumbs visibility. You can't customize the breadcrumbs yet.

#### Type
`Boolean`

<Image src="/assets/img/native-components/avo-panel-component/display_breadcrumbs.jpg" width="773" height="720" alt="" />
</Option>

## Slots

The component has a few slots where you customize the content in certain areas.

<Option name="`tools`">
We created this slot as a place to put resource controls like the back, edit, delete, and detach buttons.
This slot will collapse under the title and description when the screen resolution falls under `1024px`.

The section is automatically aligned to the right using `justify-end` class.

```erb
<%= render Avo::PanelComponent.new(name: "Dashboard") do |c| %>
  <% c.with_tools do %>
    <%= a_link('/admin', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
      Admin
    <% end %>
  <% end %>
<% end %>
```

<Image src="/assets/img/native-components/avo-panel-component/tools-slot.jpg" width="1014" height="226" alt="" />
</Option>

<Option name="`body`">
This is one of the main slots of the component where the bulk of the content is displayed.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_body do %>
    Something here.
  <% end %>
<% end %>
```

<Image src="/assets/img/native-components/avo-panel-component/body-slot.jpg" width="773" height="720" alt="" />
</Option>

<Option name="`bare_content`">
Used when displaying the [Grid view](./../grid-view), it displays the data flush in the container and with no background.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_bare_content do %>
    Something here.
  <% end %>
<% end %>
```

<Image src="/assets/img/native-components/avo-panel-component/grid-view.jpg" width="1312" height="1096" alt="" />
</Option>

<Option name="`footer_tools`">
This is pretty much the same slot as `tools` but rendered under the `body` or `bare_content` slots.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_footer_controls do %>
    Something here.
  <% end %>
<% end %>
```

<Image src="/assets/img/native-components/avo-panel-component/footer-controls.jpg" width="1013" height="295" alt="" />
</Option>

<Option name="`footer`">
The lowest available area at the end of the component.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_footer do %>
    Something here.
  <% end %>
<% end %>
```
</Option>

<Option name="`sidebar`">
The sidebar will conveniently show things in a smaller area on the right of the `body`.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_Sidebar do %>
    Something tiny here.
  <% end %>
<% end %>
```
<Image src="/assets/img/native-components/avo-panel-component/sidebar.png" width="2032" height="1294" alt="" />
</Option>

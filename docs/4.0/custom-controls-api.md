---
license: add_on
add_on_link: https://avohq.io/addons/custom-controls
outline: [2, 3]
guide: ./custom-controls.html
prev:
  text: "Custom controls"
  link: "./custom-controls.html"
next: false
---

# Custom controls API

Per-control reference for custom controls. For task-oriented documentation and worked examples, see the [Custom controls guide](./custom-controls.html).

Controls are declared inside a block assigned to one of the four control areas on a resource:

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: ""
    edit_button label: "Edit fish"
  end
end
```

The blocks are executed in a context that gives you access to `record`, `resource`, `view`, and `params`.

## Control areas

<Option name="`show_controls`">

The controls rendered in the <Show /> view header.

- **Default:** `back_button`, `delete_button`, `detach_button`, `actions_list`, `edit_button`

</Option>

<Option name="`edit_controls`">

The controls rendered in the <Edit /> and <New /> view headers. The same block runs on both views — check `view` to differentiate.

- **Default:** `back_button` (labeled "Cancel"), `delete_button`, `actions_list`, `save_button`

</Option>

<Option name="`index_controls`">

The controls rendered in the <Index /> view header.

- **Default:** `attach_button`, `actions_list`, `create_button`

</Option>

<Option name="`row_controls`">

The controls rendered at the end of each table row on the <Index /> view, and on grid view items.

- **Default:** `order_controls`, `show_button`, `edit_button`, `detach_button`, `delete_button`

</Option>

## Controls

<Option name="`back_button`">

Links to a previous page. The link is not a `history.back()` action — it's computed based on the parameters sent by Avo, so the user has consistent hierarchical progress through the app.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)
- **Default label:** "Go back" ("Cancel" on the <Edit /> and <New /> default controls)

</Option>

<Option name="`edit_button`">

Links to the record's <Edit /> view.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)
- **Default label:** "Edit"

</Option>

<Option name="`show_button`">

Links to the record's <Show /> view. Rendered by default in the row controls.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)

</Option>

<Option name="`save_button`">

Submits the form on the <Edit /> and <New /> views.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)
- **Default label:** "Save", or the resource's `save` translation when defined

</Option>

<Option name="`create_button`">

Links to the resource's <New /> view. Rendered by default in the index controls.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)

</Option>

<Option name="`attach_button`">

Opens the attach modal. It's visible only when the resource is rendered as an association on another record's page.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)

</Option>

<Option name="`delete_button`">

Adds the appropriate destroy form. It takes your authorization policy rules into account.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon), [`confirmation_message`](#confirmation_message)
- **Default label:** "Delete"

</Option>

<Option name="`detach_button`">

Adds the appropriate detach form. It's visible only when the resource is rendered as an association on another record's page. It takes your authorization policy rules into account.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon), [`confirmation_message`](#confirmation_message)

</Option>

<Option name="`order_controls`">

Renders the reordering controls configured through the [record reordering](./record-reordering.html) feature. Rendered by default in the row controls.

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)

</Option>

<Option name="`actions_list`">

A dropdown where the user can see and run all the actions assigned to that resource.

```ruby
actions_list label: "Runnables", style: :primary, color: :slate
```

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon), `include`, `exclude`
- **Default style:** `:outline`
- **Default icon:** `tabler/outline/circle-arrow-down`

:::info
The actions' [icon](./actions-api.html#icon) and the [dividers](./actions-api.html#divider) are defined in the `def actions` method.
:::

#### `exclude`

Filters out the specified actions. It's used in conjunction with the `action` control — when you extract an action into its own button, use `exclude` so it isn't also displayed in the dropdown.

```ruby
actions_list exclude: Avo::Actions::DisableAccount
# Or
actions_list exclude: [Avo::Actions::ExportSelection, Avo::Actions::PublishPost]
```

#### `include`

Displays only the specified actions in the dropdown.

```ruby
actions_list include: Avo::Actions::DisableAccount
# Or
actions_list include: [Avo::Actions::ExportSelection, Avo::Actions::PublishPost]
```

</Option>

<Option name="`action`">

Renders a button that triggers an action. The first argument is an [Action](./actions.html) class.

```ruby
action Avo::Actions::DisableAccount
action Avo::Actions::DisableAccount, arguments: { hide_some_fields: true }
action Avo::Actions::ExportSelection, style: :text
action Avo::Actions::PublishPost, color: :fuchsia, icon: "heroicons/outline/eye"
```

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon), `arguments`
- **Default label:** the action's name

:::info
The action's `visible` block is ignored here — wrap the declaration in an `if` statement instead. See [Conditionally show controls](./custom-controls.html#conditionally-show-controls).
:::

</Option>

<Option name="`link_to`">

Renders a link to a path set by you. The first two arguments are the label and the path.

```ruby
link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
```

- **Options:** [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon), `target`, `data`, `class`

Any other arguments (`rel: "noopener"`, etc.) are forwarded to the link.

#### `target`

Sets the link's `target` attribute: `:_blank`, `:_top`, or `:_self`.

#### `data`

A Hash of data attributes for the link, e.g. `data: { turbo_frame: "custom_frame" }`.

#### `class`

Sets the CSS classes for the link. Any string value.

:::info
With `style: :icon` the tooltip is taken from the label, not from `title`.
:::

</Option>

<Option name="`list`">

A dropdown that displays the specified links and actions.

```ruby
list label: "Custom Index List", icon: "heroicons/outline/cube-transparent", style: :primary, color: :slate, title: "A custom list" do
  link_to "Google", "https://google.com", icon: "heroicons/outline/academic-cap"
  action Avo::Actions::Sub::DummyAction, icon: "heroicons/outline/globe"
  link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/fire", target: :_blank
end
```

<Image src="/assets/img/4_0/customizable-controls/custom_list.webp" dark-src="/assets/img/4_0/customizable-controls/custom_list-dark.webp" width="314" height="162" alt="The custom `list` control open on an Avo Fish index page header: a &quot;Custom Index List&quot; dropdown button (highlighted) among the page controls, with its menu open showing Google and Fish.com links and a Dummy action, each with an icon." prompt="the list control dropdown opened showing its links and actions" />

- **Options:** [`label`](#label), [`title`](#title), [`style`](#style), [`color`](#color), [`icon`](#icon)
- **Default style:** `:outline`
- **Default color:** `:primary`

Within the block the permitted elements are `link_to`, `action`, and [`divider`](#divider). Unlike a directly declared `action` control, actions inside a `list` do respect the action's `visible` block.

:::warning
Button controls like `back_button` or `edit_button` are not allowed inside a `list` block — in development they raise an error.
:::

</Option>

<Option name="`divider`">

Renders a divider line between the items of a [`list`](#list) dropdown.

</Option>

<Option name="`default_controls`">

Re-adds the current area's default controls, so you can add controls before or after them without re-declaring them all.

```ruby
self.show_controls = -> do
  link_to "View on site", post_path(record), target: :_blank
  default_controls
end
```

</Option>

## Control options

Not all controls take all options — each control's entry above lists the ones it accepts. Control-specific options (`target`, `data`, `class`, `arguments`, `include`, `exclude`) are documented on their control.

<Option name="`label`">

The text displayed on the button. Pass an empty string (`""`) to render an icon-only button.

- **Type:** String
- **Default:** varies per control (see each control's entry)

</Option>

<Option name="`title`">

The tooltip for that control.

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`style`">

Sets the `style` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb).

- **Type:** Symbol
- **Default:** `:text` (`:outline` for `actions_list` and `list`)
- **Values:** `:primary`, `:outline`, `:text`, `:icon` (icon-only, used in row controls)

</Option>

<Option name="`color`">

Sets the `color` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb).

- **Type:** Symbol
- **Default:** `:gray`
- **Values:** any color of [Tailwind's default color palette](https://tailwindcss.com/docs/customizing-colors#default-color-palette)

</Option>

<Option name="`icon`">

The icon displayed on the button.

- **Type:** String
- **Default:** `nil`
- **Values:** any [Heroicon](https://heroicons.com), with the style included — `heroicons/outline/academic-cap` or `heroicons/solid/adjustments`

</Option>

<Option name="`size`">

Sets the `size` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb).

- **Type:** Symbol
- **Default:** `:md`
- **Values:** `:sm`, `:md`, `:lg`

</Option>

<Option name="`confirmation_message`">

The message shown in the confirmation dialog before running `delete_button` or `detach_button`.

- **Type:** String
- **Default:** `nil` ("Are you sure?" for the default row controls)

</Option>

---
license: advanced
---

# Customizable controls

![](/assets/img/resources/customizable-controls/index.jpg)

One of the things that we wanted to support from day one is customizable controls on resource pages, and now, Avo supports customizable controls on <Index />, <Show />, and <Edit /> views and for the table row.

## Default controls

By default, Avo displays a few buttons (controls) for the user to use on the <Index />, <Show />, and <Edit /> views which you can override using the appropriate resource options.

![](/assets/img/3_0/customizable-controls/default-controls.png)

## Customize the controls

You can take over and customize them all using the `index_controls`, `show_controls`, `edit_controls`, and `row_controls` class attributes.

:::option Show page
On the <Show /> view the default configuration is `back_button`, `delete_button`, `detach_button`, `actions_list`, and `edit_button`.

To start customizing the controls, add a `show_controls` block and start adding the desired controls.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    link_to "Turbo demo", "/admin/resources/fish/#{params[:id]}?change_to=🚀🚀🚀 New content here 🚀🚀🚀",
      class: ".custom-class",
      data: {
        turbo_frame: "fish_custom_action_demo"
      }
    delete_button label: "", title: "something"
    detach_button label: "", title: "something"
    actions_list label: "Runnables", exclude: [ReleaseFish], style: :primary, color: :slate
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    edit_button label: ""
  end
end
```

![](/assets/img/3_0/customizable-controls/show-controls.png)
:::

:::option Edit page
On the <Edit /> view the default configuration is `back_button`, `delete_button`, `actions_list`, and `save_button`.

To start customizing the controls, add a `edit_controls` block and start adding the desired controls.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.edit_controls = -> do
    back_button label: "", title: "Go back now"
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    delete_button label: "", title: "something"
    detach_button label: "", title: "something"
    actions_list exclude: [Avo::Actions::ReleaseFish], style: :primary, color: :slate, label: "Runnables"
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe" if view != :new
    save_button label: "Save Fish"
  end
end
```

![](/assets/img/3_0/customizable-controls/show-controls.png)
:::

:::option Index page
On the <Index /> view the default configuration contains the `actions_list`, `attach_button`, and `create_button`.

To start customizing the controls, add a `index_controls` block and start adding the desired controls.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.index_controls = -> do
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    actions_list exclude: [Avo::Actions::DummyAction], style: :primary, color: :slate, label: "Runnables" if Fish.count > 0
    action Avo::Actions::DummyAction, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe" if Fish.count > 0
    attach_button label: "Attach one Fish"
    create_button label: "Create a new and fresh Fish"
  end
end
```

![](/assets/img/3_0/customizable-controls/index-controls.png)
:::

:::option Row controls
On the <Index /> view the on the end of each table row the default configuration contains the `order_controls` `show_button`, `edit_button`, `detach_button`, and `delete_button`.

To start customizing the controls, add a `row_controls` block and start adding the desired controls.

The controls you customize here will be displayed on the grid view too.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.row_controls = -> do
    action Avo::Actions::ReleaseFish, label: "Release #{record.name}", style: :primary, color: :blue,
      icon: "heroicons/outline/hand-raised" unless params[:view_type] == "grid"
    edit_button title: "Edit this Fish now!"
    show_button title: "Show this Fish now!"
    delete_button title: "Delete this Fish now!", confirmation_message: "Are you sure you want to delete this Fish?"
    actions_list style: :primary, color: :slate, label: "Actions" unless params[:view_type] == "grid"
    action Avo::Actions::ReleaseFish, title: "Release #{record.name}", icon: "heroicons/outline/hand-raised", style: :icon
    link_to "Information about #{record.name}", "https://en.wikipedia.org/wiki/#{record.name}",
      icon: "heroicons/outline/information-circle", target: :_blank, style: :icon
  end
end
```

![](/assets/img/3_0/customizable-controls/row-controls.png)
:::

## Controls

A control is an item that you can place in a designated area. They can be one of the default ones like `back_button`, `delete_button`, or `edit_button` to custom ones like `link_to` or `action`.

You may use the following controls:

:::option `back_button`
Links to a previous page. The link is not a `history.back()` action. It's computed based on the parameters sent by Avo. That ensures the user has consistent hierarchical progress through the app.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `delete_button`
Adds the appropriate destroy form. It will take into account your authorization policy rules.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `detach_button`
Adds the appropriate detach form. It's visible only on the association (`has_one`) page. It will take into account your authorization policy rules.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `actions_list`
A dropdown where the user can see and run all the actions assigned to that resource.

#### Supported options

`label`, `title`, `style`, `color`, `icon`, and `exclude`.

#### `exclude` option

Filters out the specified actions.

It's used in conjunction with the `action` control. For example, when you extract an action, you don't want it to be displayed in the `actions_list` anymore, so you use the `exclude` option to filter it out.

#### Example

```ruby
actions_list exclude: DisableAccount
# Or
actions_list exclude: [ExportSelection, PublishPost]
```
:::info
The list action's [icon](actions.md#icon) and the [dividers](actions.md#divider) are defined in `def actions` method.
:::

:::option `edit_button`
Links to the record edit page.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `link_to`
Renders a link to a path set by you.

#### Supported options

`title`, `style`, `color`, `icon`, `target`, `data`, and `class`.
:::

:::option `action`
Renders a button that triggers an action. You must provide it an [Action](./actions) class.

#### Supported options

`title`, `style`, `color`, `arguments` and `icon`.

#### Example

```ruby
action Avo::Actions::DisableAccount
action Avo::Actions::DisableAccount, arguments: { hide_some_fields: true }
action Avo::Actions::ExportSelection, style: :text
action Avo::Actions::PublishPost, color: :fuchsia, icon: "heroicons/outline/eye"
```

:::

:::warning
When you use the `action` helper in any customizable block it will act only as a shortcut to display the action button, it will not also register it to the resource.

You must manually register it with the `action` declaration.

```ruby{6-8,13-15}
class Avo::Resources::Fish < Avo::BaseResource
  self.title = :name

  self.show_controls = -> do
    # In order to use it here
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, arguments: {
      action_on_show_controls: "Will use this arguments"
    }
  end

  # 👇 Also declare it here 👇
  def actions
    action Avo::Actions::ReleaseFish, arguments: {
      action_from_list: "Will use this arguments"
    }
  end
end
```
:::

:::option `default_controls`
There are times when you just want to add a link before or after the default controls and don't want to re-add them all.
Avo's got you covered! `default_controls` to the rescue.

```ruby
self.show_controls = -> do
  # This link will be added before all other controls.
  link_to "View on site", post_path(record), target: :_blank
  default_controls
end
```

![](/assets/img/3_0/customizable-controls/default_controls.png){height=140}
:::

## Control Options

Some controls take options. Not all controls take all options.
Example: The `link_to` control is the only one that will take the `target` option, but most other controls use the `class` option.

:::option `title`
Sets the tooltip for that control.

#### Possible values

Any string value.
:::

:::option `style`
Sets the `style` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb).

#### Possible values

`:primary`, `:outline`, `:text`
:::

:::option `color`
Sets the `color` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb)

#### Possible values

Can be any color of [Tailwind`s default color pallete](https://tailwindcss.com/docs/customizing-colors#default-color-palette) as a symbol.
:::

:::option `icon`
Sets the icon for that button.

#### Possible values

Any [Heroicon](https://heroicons.com) you want. You must specify the style of the heroicon like so `heoricons/outline/academic-cap` or `heroicons/solid/adjustments`.
:::

:::option `target`
Sets the target for that control. So whatever you pass here will be passed to the control.

#### Possible values

`:_blank`, `:_top`, `:_self`
:::

:::option `class`
Sets the classes for that control.

#### Possible values

Any string value.
:::

## Default values

If you're curious what are the default controls Avo adds for each block, here they are:

```ruby
# show controls
back_button
delete_button
detach_button
actions_list
edit_button

# form (edit & new) controls

back_button
delete_button
actions_list
save_button

# index controls
attach_button
actions_list
create_button

# row controls
order_controls
show_button
edit_button
detach_button
delete_button
```

## Conditionally hiding/showing actions

Actions have the `visible` block where you can control the visibility of an action. In the context of `show_controls` that block is not taken into account, but you can use regular `if`/`else` statements because the action declaration is wrapped in a block.

```ruby{6-8}
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"

    # visibility conditional
    if record.something?
      action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    end

    edit_button label: ""
  end
end
```

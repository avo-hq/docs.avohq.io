---
version: '2.13'
license: pro
betaStatus: Beta
demoVideo: https://youtu.be/qUvMh7AkrlU
---

# Customizable controls

![](/assets/img/resources/customizable-controls/index.jpg)

One of the things that we wanted to support from day one is customizable controls on resource pages.

:::warning
At the moment, only the `Show` view has customizable controls.
:::

## Default buttons

By default, Avo displays a few buttons for the user to use on the <Index />, <Show />, and <Edit /> views which you can override using the appropriate resource options.

## Show page

On the <Show /> view the default configuration is `back_button`, `delete_button`, `detach_button`, `actions_list`, and `edit_button`. You can override them using `show_controls`.

## Customize the controls

To start customizing the buttons, add a `show_controls` block and start adding the desired controls.

```ruby
class FishResource < Avo::BaseResource
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
    actions_list exclude: [ReleaseFish], style: :primary, color: :slate
    action ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    edit_button label: ""
  end
end
```

## Controls

A control is an item that you can place in a designated area. They can be one of the default ones like `back_button`, `delete_button`, or `edit_button` to custom ones like `link_to` or `action`.

You may use the following controls:

<Option name="`back_button`">
Links to a previous page. The link is not a `history.back()` action. It's computed based on the parameters sent by Avo. That ensures the user has consistent hierarchical progress through the app.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
</Option>

<Option name="`delete_button`">
Adds the appropriate destroy form. It will take into account your authorization policy rules.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
</Option>

<Option name="`detach_button`">
Adds the appropriate detach form. It's visible only on the association (`has_one`) page. It will take into account your authorization policy rules.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
</Option>

<Option name="`actions_list`">
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
</Option>

<Option name="`edit_button`">
Links to the record edit page.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
</Option>

<Option name="`link_to`">
Renders a link to a path set by you.

#### Supported options

`title`, `style`, `color`, `icon`, `target`, `data`, and `class`.
</Option>

<Option name="`action`">
Renders a button that triggers an action. You must provide it an [Action](./actions) class.

#### Supported options

`title`, `style`, `color`, and `icon`.

#### Example

```ruby
action DisableAccount
action ExportSelection, style: :text
action PublishPost, color: :fuchsia, icon: "heroicons/outline/eye"
```
</Option>

:::warning
The way `show_controls` works is like a shortcut the the actions that you already declared on your resource, so you should also declare it on the resource as you normally would in order to have it here.

```ruby{6,10}
class FishResource < Avo::BaseResource
  self.title = :name

  self.show_controls = -> do
    # In order to use it here
    action ReleaseFish, style: :primary, color: :fuchsia
  end

  # Also declare it here
  action ReleaseFish, arguments: { both_actions: "Will use them" }
end
:::

## Control Options

<Option name="`title`">
Sets the tooltip for that control.

#### Possible values

Any string value.
</Option>

<Option name="`style`">
Sets the `style` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb).

#### Possible values

`:primary`, `:outline`, `:text`
</Option>

<Option name="`color`">
Sets the `color` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb)

#### Possible values

Can be any color of [Tailwind's default color pallete](https://tailwindcss.com/docs/customizing-colors#default-color-palette) as a symbol.
</Option>

<Option name="`icon`">
Sets the icon for that button.

#### Possible values

Any [Heroicon](https://heroicons.com) you want. You must specify the style of the heroicon like so `heoricons/outline/academic-cap` or `heroicons/solid/adjustments`.
</Option>

<Option name="`target`">
Sets the target for that control. So whatever you pass here will be passed to the control.

#### Possible values

`:_blank`, `:_top`, `:_self`
</Option>

<Option name="`class`">
Sets the classes for that control.

#### Possible values

Any string value.
</Option>

## Conditionally hiding/showing actions

Actions have the `visible` block where you can control the visibility of an action. In the context of `show_controls` that block is not taken into account, but yiou can use regular `if`/`else` statements because the action declaration is wrapped in a block.

```ruby{6-8}
class FishResource < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"

    # visibility conditional
    if record.something?
      action ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    end

    edit_button label: ""
  end
end
```

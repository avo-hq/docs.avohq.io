---
license: add_on
add_on_link: https://avohq.io/addons/custom-controls
outline: [2, 3]
api_docs: ./custom-controls-api.html
---

# Custom controls

Avo displays a default set of buttons (controls) on the <Index />, <Show />, and <Edit /> views and at the end of each table row. Custom controls let you take over any of those areas — relabel or remove the default buttons and add your own links, action buttons, and dropdowns.

<Image src="/assets/img/4_0/customizable-controls/panel.webp" dark-src="/assets/img/4_0/customizable-controls/panel-dark.webp" width="1976" height="564" alt="An Avo Show page panel with the record title and customizable controls highlighted in the header tools area, above a card listing the record fields." prompt="full show page panel with the customizable controls highlighted in the header tools area" />

Take over an area by assigning a block to the matching resource class attribute — [`show_controls`](./custom-controls-api.html#show_controls), [`edit_controls`](./custom-controls-api.html#edit_controls), [`index_controls`](./custom-controls-api.html#index_controls), or [`row_controls`](./custom-controls-api.html#row_controls):

```ruby
# app/avo/resources/fish.rb
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    link_to "View on site", "https://fish.com", target: :_blank
    default_controls
  end
end
```

Any area you don't customize keeps its default controls:

<Image src="/assets/img/4_0/customizable-controls/default-controls.webp" dark-src="/assets/img/4_0/customizable-controls/default-controls-dark.webp" width="321" height="52" alt="The default show controls bar on an Avo resource show page header: a back button, a delete button, and an edit button." prompt="default show controls bar (back, delete, edit) on a resource show page header" />

Inside a block you can mix the built-in controls (like [`back_button`](./custom-controls-api.html#back_button) or [`actions_list`](./custom-controls-api.html#actions_list)) with your own [`link_to`](./custom-controls-api.html#link_to) links and [`action`](./custom-controls-api.html#action) buttons. See the [API reference](./custom-controls-api.html) for every control and the options each one accepts.

## Customize the show controls

On the <Show /> view the default configuration is `back_button`, `delete_button`, `detach_button`, `actions_list`, and `edit_button`. Assign a `show_controls` block and declare the controls you want, in the order you want them:

```ruby
# app/avo/resources/fish.rb
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    link_to "Turbo demo", "/admin/resources/fish/#{params[:id]}?change_to=new-content",
      class: "custom-class",
      data: {
        turbo_frame: "fish_custom_action_demo"
      }
    delete_button label: "", title: "Delete this fish"
    detach_button label: "", title: "Detach this fish"
    actions_list label: "Runnables", exclude: [Avo::Actions::ReleaseFish], style: :primary, color: :slate
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    edit_button label: ""
  end
end
```

<Image src="/assets/img/4_0/customizable-controls/show-controls.webp" dark-src="/assets/img/4_0/customizable-controls/show-controls-dark.webp" width="543" height="54" alt="The customized show_controls bar on an Avo Fish show page header: a back button, Fish.com and Turbo demo links, a delete button, a fuchsia Release fish action, and an edit button." prompt="customized show_controls bar on the Fish show page header" />

## Customize the edit controls

On the <Edit /> and <New /> views the default configuration is `back_button`, `delete_button`, `actions_list`, and `save_button`. Assign an `edit_controls` block — it applies to both views, so use `view` to differentiate when needed:

```ruby
# app/avo/resources/fish.rb
class Avo::Resources::Fish < Avo::BaseResource
  self.edit_controls = -> do
    back_button label: "", title: "Go back now"
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    delete_button label: "", title: "Delete this fish"
    detach_button label: "", title: "Detach this fish"
    actions_list exclude: [Avo::Actions::ReleaseFish], style: :primary, color: :slate, label: "Runnables"
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe" if view != :new
    save_button label: "Save Fish"
  end
end
```

<Image src="/assets/img/4_0/customizable-controls/edit-controls.webp" dark-src="/assets/img/4_0/customizable-controls/edit-controls-dark.webp" width="452" height="54" alt="The customized edit_controls bar on an Avo Fish edit page header: a back button, a Fish.com link, a Runnables actions menu, a fuchsia Release fish action, and a Save Fish button." prompt="customized edit_controls bar on the Fish edit page header" />

## Customize the index controls

On the <Index /> view the default configuration is `attach_button`, `actions_list`, and `create_button`. Assign an `index_controls` block:

```ruby
# app/avo/resources/fish.rb
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

<Image src="/assets/img/4_0/customizable-controls/index-controls.webp" dark-src="/assets/img/4_0/customizable-controls/index-controls-dark.webp" width="673" height="52" alt="The customized index_controls bar on an Avo Fish index page header: a Fish.com link, a Runnables actions menu, a Release fish action, an Attach one Fish button, and a Create a new and fresh Fish button." prompt="customized index_controls bar on the Fish index page header" />

## Customize the row controls

At the end of each table row on the <Index /> view the default configuration is `order_controls`, `show_button`, `edit_button`, `detach_button`, and `delete_button`. Assign a `row_controls` block:

```ruby
# app/avo/resources/fish.rb
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

The same controls are displayed on the grid view items too — check `params[:view_type]` (as above) to show a control on only one of the two view types.

<Image src="/assets/img/4_0/customizable-controls/row-controls.webp" dark-src="/assets/img/4_0/customizable-controls/row-controls-dark.webp" width="2344" height="758" alt="The Avo Fish index table with several rows; the customized row controls area on one middle row is highlighted in red, showing a Release action button, edit, show and delete icons, an Actions menu, and icon links." prompt="Fish index table showing a few rows with the customized row controls area on one row highlighted in red" />

## Keep the default controls

If you just want to add a link before or after the default controls, you don't have to re-declare them all — call [`default_controls`](./custom-controls-api.html#default_controls) where you want them to appear:

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.show_controls = -> do
    # This link will be added before all other controls.
    link_to "View on site", post_path(record), target: :_blank
    default_controls
  end
end
```

<Image src="/assets/img/4_0/customizable-controls/default_controls.webp" dark-src="/assets/img/4_0/customizable-controls/default_controls-dark.webp" width="441" height="52" alt="A show controls bar with a custom &quot;View on site&quot; link prepended before the default back, delete, and edit controls." prompt="show controls bar with a custom link prepended before the default controls" />

## Group links and actions in a dropdown

If you have too many controls for the bar, group your custom links and actions in a [`list`](./custom-controls-api.html#list) dropdown:

```ruby
# app/avo/resources/fish.rb
class Avo::Resources::Fish < Avo::BaseResource
  self.index_controls = -> do
    list label: "Custom Index List", icon: "heroicons/outline/cube-transparent", style: :primary, color: :slate, title: "A custom list" do
      link_to "Google", "https://google.com", icon: "heroicons/outline/academic-cap"
      action Avo::Actions::Sub::DummyAction, icon: "heroicons/outline/globe"
      link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/fire", target: :_blank
    end
  end
end
```

<Image src="/assets/img/4_0/customizable-controls/custom_list.webp" dark-src="/assets/img/4_0/customizable-controls/custom_list-dark.webp" width="314" height="162" alt="The custom `list` control open on an Avo Fish index page header: a &quot;Custom Index List&quot; dropdown button (highlighted) among the page controls, with its menu open showing Google and Fish.com links and a Dummy action, each with an icon." prompt="the list control dropdown opened showing its links and actions" />

Within the `list` block you can use `link_to`, `action`, and [`divider`](./custom-controls-api.html#divider) — the built-in button controls are not allowed there.

## Conditionally show controls

Actions have a `visible` block that controls their visibility, but a control declared with `action` ignores it. Because the controls declaration is a block, use regular `if`/`else` statements instead:

```ruby{6-8}
# app/avo/resources/fish.rb
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"

    # visibility conditional
    if record.released?
      action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    end

    edit_button label: ""
  end
end
```

:::info
The exception is actions declared inside a [`list`](./custom-controls-api.html#list) dropdown — those do respect the action's `visible` block.
:::

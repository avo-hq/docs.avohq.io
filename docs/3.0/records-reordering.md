---
version: "1.24.2"
license: pro
demoVideo: https://www.youtube.com/watch?v=LEALfPiyfRk
---

# Records ordering

A typical scenario is when you need to set your records into a specific order. Like re-ordering `Slide`s inside a `Carousel` or `MenuItem`s inside a `Menu`.

The `ordering` class attribute is your friend for this. You can set four actions `higher`, `lower`, `to_top` or `to_bottom`, and the `display_inline` and `visible_on` options.
The actions are simple lambda functions but coupled with your logic or an ordering gem, and they can be pretty powerful.

## Configuration

I'll demonstrate the ordering feature using the `act_as_list` gem.

Install and configure the gem as instructed in the [tutorials](https://github.com/brendon/acts_as_list#example). Please ensure you [give all records position attribute values](https://github.com/brendon/acts_as_list#adding-acts_as_list-to-an-existing-model), so the gem works fine.

Next, add the order actions like below.

```ruby
class CourseLinkResource < Avo::BaseResource
  self.ordering = {
    visible_on: :index,
    actions: {
      higher: -> { record.move_higher },
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom },
    }
  }
end
```

The `record` is the actual instantiated model. The `move_higher`, `move_lower`, `move_to_top`, and `move_to_bottom` methods are provided by `act_as_list`. If you're not using that gem, you can add your logic inside to change the position of the record.

The actions have access to `record`, `resource`, `options` (the `ordering` class attribute) and `params` (the `request` params).

That configuration will generate a button with a popover containing the ordering buttons.

<img :src="('/assets/img/resources/ordering_hover.jpg')" alt="Avo ordering" class="border mb-4" />

## Always show the order buttons

If the resource you're trying to update requires re-ordering often, you can have the buttons visible at all times using the `display_inline: true` option.

```ruby
class CourseLinkResource < Avo::BaseResource
  self.ordering = {
    display_inline: true,
    visible_on: :index,
    actions: {
      higher: -> { record.move_higher },
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom },
    }
  }
end
```

<img :src="('/assets/img/resources/ordering_visible.jpg')" alt="Avo ordering" class="border mb-4" />

## Display the buttons in the `Index` view or association view

A typical scenario is to order the records only in the scope of a parent record, like order the `MenuItems` for a `Menu` or `Slides` for a `Slider`. So you wouldn't need to have the order buttons on the `Index` view but only in the association section.

To control that, you can use the `visible_on` option. The possible values are `:index`, `:association` or `[:index, :association]` for both views.

## Change the scope on the `Index` view

Naturally, you'll want to apply the `order(position: :asc)` condition to your query. You may do that in two ways.

1. Add a `default_scope` to your model. If you're using this ordering scheme only in Avo, then, this is not the recommended way, because it will add that scope to all queries for that model and you probably don't want that.

2. Use the [`resolve_query_scope`](https://docs.avohq.io/3.0/customization.html#custom-query-scopes) to alter the query in Avo.

```ruby{2-4}
class CourseLinkResource < Avo::BaseResource
  self.resolve_query_scope = -> {
    query.order(position: :asc)
  }

  self.ordering = {
    display_inline: true,
    visible_on: :index, # :index or :association
    actions: {
      higher: -> { record.move_higher }, # has access to record, resource, options, params
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom }
    }
  }
end

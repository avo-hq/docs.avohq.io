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

I'll demonstrate the ordering feature using the `acts_as_list` gem.

Install and configure the gem as instructed in the [tutorials](https://github.com/brendon/acts_as_list#example). Please ensure you [give all records position attribute values](https://github.com/brendon/acts_as_list#adding-acts_as_list-to-an-existing-model), so the gem works fine.

Next, add the order actions like below.

```ruby
class Avo::Resources::CourseLink < Avo::BaseResource
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

The `record` is the actual instantiated model. The `move_higher`, `move_lower`, `move_to_top`, and `move_to_bottom` methods are provided by `acts_as_list`. If you're not using that gem, you can add your logic inside to change the position of the record.

The actions have access to `record`, `resource`, `options` (the `ordering` class attribute) and `params` (the `request` params).

That configuration will generate a button with a popover containing the ordering buttons.

<Image src="/assets/img/resources/ordering_hover.jpg" width="1058" height="550" alt="Avo ordering" />

## Always show the order buttons

If the resource you're trying to update requires re-ordering often, you can have the buttons visible at all times using the `display_inline: true` option.

```ruby
class Avo::Resources::CourseLink < Avo::BaseResource
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

<Image src="/assets/img/resources/ordering_visible.jpg" width="1055" height="546" alt="Avo ordering" />

## Display the buttons in the `Index` view or association view

A typical scenario is to have the order buttons on the <Index /> view or a resource. That's the default value for the `visible_on` option.

```ruby{3}
class Avo::Resources::CourseLink < Avo::BaseResource
  self.ordering = {
    visible_on: :index,
  }
end
```

## Display the button on a `has_many` association

Another scenario is to order the records only in the scope of a parent record, like order the `MenuItems` for a `Menu`, or `Slides` for a `Slider`. So you wouldn't need to have the order buttons on the <Index /> view but only in the association section (in a has many association).

To control that, you can use the `visible_on` option and set it to `:association`.

```ruby{3}
class Avo::Resources::CourseLink < Avo::BaseResource
  self.ordering = {
    visible_on: :association,
  }
end
```

### Possible values

The possible values for the `visible_on` option are `:index`, `:association` or `[:index, :association]` for both views.

## Change the scope on the `Index` view

Naturally, you'll want to apply the `order(position: :asc)` condition to your query. You may do that in two ways.

1. Add a `default_scope` to your model. If you're using this ordering scheme only in Avo, then, this is not the recommended way, because it will add that scope to all queries for that model and you probably don't want that.

2. Use the [`index_query`](https://docs.avohq.io/3.0/customization.html#custom-query-scopes) to alter the query in Avo.

```ruby{2-4}
class Avo::Resources::CourseLink < Avo::BaseResource
  self.index_query = -> {
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
```

## Reorder using drag and drop

<BetaStatus label="Beta"></BetaStatus>

Sometimes just picking up a record and dropping it in the position that you'd like it to be. That's exactly what this feature does.

It's disabled by default but you can enable it by adding `drag_and_drop: true` and `insert_at` options to the `self.ordering` hash.

```ruby{5,11}
self.ordering = {
  display_inline: true,
  visible_on: %i[index association], # :index or :association or both
  # position: -> { record.position },
  drag_and_drop: true,
  actions: {
    higher: -> { record.move_higher }, # has access to record, resource, options, params
    lower: -> { record.move_lower },
    to_top: -> { record.move_to_top },
    to_bottom: -> { record.move_to_bottom },
    insert_at: -> { record.insert_at position }
  }
}
```

### Custom `position` attribute

Using the `position` option you can specify the record's `position` attribute. The default is `record.position`.

```ruby{4}
self.ordering = {
  display_inline: true,
  visible_on: %i[index association], # :index or :association or both
  position: -> { record.position_in_list },
  drag_and_drop: true,
  actions: {
    higher: -> { record.move_higher }, # has access to record, resource, options, params
    lower: -> { record.move_lower },
    to_top: -> { record.move_to_top },
    to_bottom: -> { record.move_to_bottom },
    insert_at: -> { record.insert_at position }
  }
}
```

## Authorization

If you're using the [authorization](./authorization) feature please ensure you give the proper permissions using the [`reorder?`](./authorization#reorder) method.

```ruby
class CourseLinkPolicy < ApplicationPolicy
  def reorder? = edit?

  # or a custom permission

  def reorder?
    user.can_reorder_items?
  end

  # other policy methods
end
```

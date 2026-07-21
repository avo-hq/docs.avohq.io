---
license: pro
outline: [2, 3]
guide: ./record-reordering.html
prev:
  text: "Record reordering"
  link: "./record-reordering.html"
next: false
---

# Record reordering API

Per-option reference for the `ordering` resource class attribute. For task-oriented documentation and worked examples, see the [Record reordering guide](./record-reordering.html).

All options are passed as a Hash to `self.ordering` on the resource:

```ruby
class Avo::Resources::CourseLink < Avo::BaseResource
  self.ordering = {
    # options listed below
  }
end
```

## Ordering actions

<Option name="`actions`">

The lambdas that change a record's position. Each key maps a control to the code that runs when it's used. The reordering controls only render when at least one action is defined.

```ruby
self.ordering = {
  actions: {
    higher: -> { record.move_higher },
    lower: -> { record.move_lower },
    to_top: -> { record.move_to_top },
    to_bottom: -> { record.move_to_bottom },
    insert_at: -> { record.insert_at position }
  }
}
```

Each lambda is evaluated with access to:

- `record` — the instantiated model being moved
- `resource` — the current resource
- `options` — the full `ordering` hash
- `params` — the request params
- `direction` — the pressed direction as a String (directional actions only)
- `position` — the target position as an `Integer` (`insert_at` only)

- **Type:** Hash of Procs, any subset of `:higher`, `:lower`, `:to_top`, `:to_bottom`, `:insert_at`
- **Default:** `nil`

<Option name="`higher`" headingSize="3">

Runs when the "move up" button is pressed. Should move the record one position up.

```ruby
higher: -> { record.move_higher }
```

</Option>

<Option name="`lower`" headingSize="3">

Runs when the "move down" button is pressed. Should move the record one position down.

```ruby
lower: -> { record.move_lower }
```

</Option>

<Option name="`to_top`" headingSize="3">

Runs when the "move to top" button is pressed. Should move the record to the first position.

```ruby
to_top: -> { record.move_to_top }
```

</Option>

<Option name="`to_bottom`" headingSize="3">

Runs when the "move to bottom" button is pressed. Should move the record to the last position.

```ruby
to_bottom: -> { record.move_to_bottom }
```

</Option>

<Option name="`insert_at`" headingSize="3">

Runs when a record is dropped in a new position via [drag and drop](#drag_and_drop). Should move the record to the `position` it receives — an `Integer` computed from where the record was dropped.

```ruby
insert_at: -> { record.insert_at position }
```

</Option>

</Option>

## Visibility

<Option name="`visible_on`">

Which views render the reordering controls.

```ruby
self.ordering = {
  visible_on: :index # :index | :association | [:index, :association]
}
```

| Value                    | Behavior                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `:index`                 | Controls appear on the resource's <Index /> view               |
| `:association`           | Controls appear only in `has_many` association views           |
| `[:index, :association]` | Controls appear in both places                                 |

- **Type:** Symbol or Array of Symbols
- **Default:** `nil`

:::warning No implicit default
Omitting `visible_on` hides the controls everywhere — it does not fall back to `:index`. Always set it explicitly.
:::

</Option>

<Option name="`display_inline`">

Renders the ordering buttons directly in the row instead of tucked behind a popover trigger.

```ruby
self.ordering = {
  display_inline: true
}
```

- **Type:** Boolean
- **Default:** `false` — buttons render inside a popover

</Option>

## Drag and drop

<Option name="`drag_and_drop`">

Enables reordering by dragging a record to its new position.

```ruby
self.ordering = {
  drag_and_drop: true,
  actions: {
    insert_at: -> { record.insert_at position }
  }
}
```

- **Type:** Boolean
- **Default:** `false`

:::warning Requires `insert_at`
Drag and drop only activates when `drag_and_drop: true` **and** an [`actions`](#actions) hash with an `insert_at` key are both present. With either one missing, the drag handles don't render.
:::

</Option>

<Option name="`position`">

A lambda returning a record's current position. Avo calls it on the first record in the list to compute the target position of a dropped record.

```ruby
self.ordering = {
  position: -> { record.position_in_list }
}
```

The lambda has access to `record`, `resource`, `options` (the full `ordering` hash), and `params`.

- **Type:** Proc
- **Default:** `nil` — Avo reads `record.position`, the attribute `acts_as_list` provides

</Option>
